import { TimerEnd } from '@app/interfaces/timer-end/timer-end.interface';
import { ClassicWaitingRoom, TimeLimitedWaitingRoom } from '@app/interfaces/waiting-room/waiting-room.interface';
import { ClassicSession } from '@app/model/classes/game-sessions/classic-session/classic-session';
import { SECOND_IN_MILLISECONDS } from '@app/model/classes/game-sessions/game-session.constants';
import { TimeLimitedSession } from '@app/model/classes/game-sessions/time-limited-session/time-limited-session';
import { Coordinate } from '@app/model/dto/coordinate.dto';
import { CreateClassicGameSessionDto } from '@app/model/dto/game-session/create-classic-game-session.dto';
import { GameSession } from '@app/model/schema/game-session';
import { DifferencesService } from '@app/services/differences/differences.service';
import { GameConstantsService } from '@app/services/game-constants/game-constants.service';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { GameService } from '@app/services/game/game.service';
import { MessageFormatterService } from '@app/services/message-formatter/message-formatter.service';
import { WaitingRoomService } from '@app/services/waiting-room/waiting-room.service';
import { GameMode } from '@common/game-mode';
import { GameSessionEvent } from '@common/game-session.events';
import { CreateGameSessionDto } from '@common/model/dto/create-game-session';
import { EndGameResultDto } from '@common/model/dto/end-game-result';
import { GameSheetState, JoinableGame } from '@common/model/game';
import { GameInfo } from '@common/model/game-info';
import { SessionType } from '@common/model/guess-result';
import { Position } from '@common/model/message';
import { WaitingRoomStatus } from '@common/model/waiting-room-status';
import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@Injectable()
export class GameManagerService {
    private roomIdToGameSession: Map<string, GameSession>;
    private socketIdToGameSession: Map<string, GameSession>;

    // eslint-disable-next-line max-params
    constructor(
        public differencesService: DifferencesService,
        private gameService: GameService,
        private messageFormatterService: MessageFormatterService,
        private gameConstantsService: GameConstantsService,
        private waitingRoomService: WaitingRoomService,
        private gameHistoryService: GameHistoryService,
    ) {
        this.roomIdToGameSession = new Map();
        this.socketIdToGameSession = new Map();
    }

    setPlayerGameSession(socketId: string, gameSession: GameSession) {
        this.socketIdToGameSession.set(socketId, gameSession);
    }

    getPlayerGameSession(socketId: string): GameSession {
        const gameSession = this.socketIdToGameSession.get(socketId);
        if (!gameSession) {
            throw new WsException('No gameSession attached to this socket');
        }
        return gameSession;
    }

    isPlayerInGameSession(socketId: string): boolean {
        const gameSession = this.socketIdToGameSession.get(socketId);
        return gameSession ? true : false;
    }

    deletePlayerGameSession(socketId: string) {
        const gameSession = this.socketIdToGameSession.get(socketId);
        if (!gameSession) {
            return;
        }

        gameSession.players.delete(socketId);

        this.socketIdToGameSession.delete(socketId);
    }

    getGameSession(roomIds: string[]): GameSession {
        for (const id of roomIds) {
            const gameSession = this.roomIdToGameSession.get(id);
            if (gameSession) {
                return gameSession;
            }
        }

        throw new WsException('No gameSession attached to this socket');
    }

    deleteGameSession(roomIds: string[]): void {
        for (const id of roomIds) {
            if (this.roomIdToGameSession.get(id)) {
                this.roomIdToGameSession.delete(id);
            }
            this.deletePlayerGameSession(id);
        }
    }

    async createClassicSession(waitingRoom: ClassicWaitingRoom): Promise<ClassicSession> {
        const gameConstants = await this.gameConstantsService.getAll();
        const gameSession = new ClassicSession(this.differencesService, waitingRoom, gameConstants);
        this.roomIdToGameSession.set(gameSession.roomId, gameSession);
        return gameSession;
    }

    async createTimeLimitedSession(waitingRoom: TimeLimitedWaitingRoom): Promise<TimeLimitedSession> {
        const games = await this.gameService.getGames();
        const gameConstants = await this.gameConstantsService.getAll();
        const gameSession = new TimeLimitedSession(this.differencesService, waitingRoom, games, gameConstants);
        this.roomIdToGameSession.set(gameSession.roomId, gameSession);
        return gameSession;
    }

    async manageTimeLimitedEndGame(gameSession: GameSession, server: Server, isWinning: boolean) {
        const timerScoreMil = Date.now() - gameSession.startedTime;
        const timeScore = Math.floor(timerScoreMil / SECOND_IN_MILLISECONDS);

        server.to(gameSession.roomId).emit(GameSessionEvent.EndGame, { isWinner: isWinning, isForfeit: false });
        await this.createGameHistory(gameSession, timeScore, '');
    }

    // eslint-disable-next-line max-params
    async manageClassicEndGame(gameSession: GameSession, winnerId: string, server: Server, playerGivingUpId?: string): Promise<void> {
        const game = gameSession.game;
        const playerData = gameSession.players.get(winnerId);

        if (!playerData) {
            throw new WsException('No player at this socket id somehow');
        }

        // FIXME: Add bonus/malus to the time score.
        const timeScoreMil = Date.now() - gameSession.startedTime;
        const timeScore = Math.floor(timeScoreMil / SECOND_IN_MILLISECONDS);

        if (playerGivingUpId) {
            await this.createGameHistory(gameSession, timeScore, winnerId, playerGivingUpId);
            return;
        }

        const highScores = gameSession.isMultiplayer() ? game.duelHighScores : game.soloHighScores;
        let position: Position | undefined;
        for (const [index, highScore] of highScores.entries()) {
            if (timeScore < highScore.time) {
                highScores.splice(index, 0, {
                    playerName: playerData.username,
                    time: timeScore,
                });
                highScores.pop();
                await this.gameService.updateGame(game._id as string, gameSession.isMultiplayer(), highScores);

                position = [Position.First, Position.Second, Position.Third][index];
                const message = this.messageFormatterService.createRecordBeatenMessage(playerData.username, position, gameSession);
                server.emit(GameSessionEvent.Message, message);
                break;
            }
        }

        for (const socketId of gameSession.players.keys()) {
            const endGameResult: EndGameResultDto = { isWinner: winnerId === socketId, isForfeit: false };
            if (winnerId === socketId) endGameResult.recordBeaten = position;
            server.to(socketId).emit(GameSessionEvent.EndGame, endGameResult);
        }

        await this.createGameHistory(gameSession, timeScore, winnerId);
    }

    generateGameInfo(gameSession: GameSession): GameInfo {
        return {
            game: gameSession.game,
            initialTime: gameSession.initialTime,
            hintPenalty: gameSession.hintPenalty,
            differenceFoundBonus: gameSession.differenceFoundBonus,
            usernames: [...gameSession.players.values()].map((player) => player.username),
        };
    }

    getRemainingDifferencesArray(gameSession: GameSession): Coordinate[][] {
        return gameSession.differences.map((hashSet) => [...hashSet].map((hash) => Coordinate.fromHash(hash)));
    }

    async createSoloSession(server: Server, socket: Socket, createGameSessionDto: CreateGameSessionDto): Promise<WaitingRoomStatus> {
        let gameSession: GameSession;
        if (createGameSessionDto.gameMode === GameMode.ClassicSolo) {
            if (!createGameSessionDto.gameId) throw new WsException('No gameId provided');
            const game = await this.gameService.getGame(createGameSessionDto.gameId);
            if (!game) throw new WsException('No game found with this id');

            const waitingRoom: ClassicWaitingRoom = {
                creator: { socketId: socket.id, username: createGameSessionDto.username },
                waitingPlayers: [],
                game,
                sessionType: SessionType.Classic,
            };
            gameSession = await this.createClassicSession(waitingRoom);
        } else {
            const waitingRoom: TimeLimitedWaitingRoom = {
                creator: { socketId: socket.id, username: createGameSessionDto.username },
                waitingPlayers: [],
                sessionType: SessionType.TimeLimited,
            };
            gameSession = await this.createTimeLimitedSession(waitingRoom);
        }
        this.setPlayerGameSession(socket.id, gameSession);
        socket.join(gameSession.roomId);

        server.to(socket.id).emit(GameSessionEvent.GameStart, this.generateGameInfo(gameSession));

        return WaitingRoomStatus.Created;
    }

    async createClassicOneVersusOneSession(
        server: Server,
        socket: Socket,
        createGameSessionDto: CreateClassicGameSessionDto,
    ): Promise<WaitingRoomStatus> {
        const game = await this.gameService.getGame(createGameSessionDto.gameId);
        if (!game) {
            throw new WsException('Game not found');
        }
        const wasWaitingRoomCreated = await this.waitingRoomService.addPlayer(createGameSessionDto.gameId, {
            socketId: socket.id,
            username: createGameSessionDto.username,
        });

        // We can be certain the is a waiting room, since we just added a player to it
        const waitingRoom = this.waitingRoomService.getGameWaitingRoom(createGameSessionDto.gameId) as ClassicWaitingRoom;

        if (!wasWaitingRoomCreated) {
            if (waitingRoom.waitingPlayers[0].socketId === socket.id) {
                server.to(waitingRoom.creator.socketId).emit(GameSessionEvent.NewOpponent, {
                    username: createGameSessionDto.username,
                    socketId: socket.id,
                });
            }

            return WaitingRoomStatus.Joined;
        }

        const joinableGame: JoinableGame = {
            _id: game._id.toString(),
            sheetState: GameSheetState.Joinable,
        };

        server.emit(GameSessionEvent.GameStateChanged, joinableGame);

        return WaitingRoomStatus.Created;
    }

    async createTimeLimitedCoopSession(server: Server, waitingRoom: TimeLimitedWaitingRoom): Promise<GameSession> {
        const gameSession = await this.createTimeLimitedSession(waitingRoom);

        const timerObserver = {
            next: (timerEnd: TimerEnd) => {
                if (timerEnd.isEndgame) {
                    this.manageTimeLimitedEndGame(gameSession, server, false);
                    server.to(timerEnd.roomId).emit(GameSessionEvent.EndGame, { isWinner: false, isForfeit: false });
                }
            },
        };
        gameSession.timer.timerEndedObservable.subscribe(timerObserver);
        return gameSession;
    }

    // eslint-disable-next-line max-params
    async createGameHistory(gameSession: GameSession, timeScore: number, winnerId: string, playerGaveUpId?: string): Promise<void> {
        const playerNames = [...gameSession.players.values()].map((player) => player.username);

        const winner = gameSession.players.get(winnerId);
        const isWinnerIndex = winner ? playerNames.indexOf(winner.username) : undefined;

        let hasAbandonnedIndex;
        if (playerGaveUpId) {
            const playerGaveUp = gameSession.players.get(playerGaveUpId);
            hasAbandonnedIndex = playerGaveUp ? playerNames.indexOf(playerGaveUp.username) : undefined;
        }

        let gameMode;
        if (gameSession instanceof ClassicSession) {
            gameMode = gameSession.isMultiplayer() ? GameMode.ClassicOneVersusOne : GameMode.ClassicSolo;
        } else {
            gameMode = gameSession.isMultiplayer() ? GameMode.TimeLimitedCoop : GameMode.TimeLimitedSolo;
        }

        await this.gameHistoryService.createGameHistory({
            gameStart: gameSession.startedTime,
            gameTime: timeScore,
            gameMode,
            players: playerNames,
            isWinner: gameSession.isMultiplayer() ? isWinnerIndex : undefined,
            hasAbandonned: hasAbandonnedIndex,
        });
    }
}
