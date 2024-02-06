/* eslint-disable max-lines */
// FIXME: remove disable
import { TIME_LIMITED_ID } from '@app/constants/waiting-room.constants';
import { GATEWAY_CONFIGURATION_OBJECT } from '@app/gateways/gateway.constants';
import { Player } from '@app/interfaces/player/player.interface';
import { TimeLimitedWaitingRoom, WaitingRoom } from '@app/interfaces/waiting-room/waiting-room.interface';
import { ClassicSession } from '@app/model/classes/game-sessions/classic-session/classic-session';
import { Coordinate } from '@app/model/dto/coordinate.dto';
import { CreateClassicGameSessionDto } from '@app/model/dto/game-session/create-classic-game-session.dto';
import { CreateTimeLimitedGameSessionDto } from '@app/model/dto/game-session/create-time-limited-game-session.dto';
import { GameSession } from '@app/model/schema/game-session';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { GameService } from '@app/services/game/game.service';
import { HintService } from '@app/services/hints/hint.service';
import { MessageFormatterService } from '@app/services/message-formatter/message-formatter.service';
import { WaitingRoomService } from '@app/services/waiting-room/waiting-room.service';
import { WSValidationPipe } from '@app/validation-pipes/web-socket/web-socket.validation-pipe';
import { CancelGameResponse } from '@common/cancel-game-responses';
import { ConfigurationEvent } from '@common/configuration.events';
import { GameMode } from '@common/game-mode';
import { GameSessionEvent } from '@common/game-session.events';
import { GameSheetState, JoinableGame } from '@common/model/game';
import { GuessResult, ResultType, SessionType } from '@common/model/guess-result';
import { Hint, HintType, RemainingHints } from '@common/model/hints';
import { WaitingRoomStatus } from '@common/model/waiting-room-status';
import { ClassSerializerInterceptor, Injectable, Logger, SerializeOptions, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(GATEWAY_CONFIGURATION_OBJECT)
@Injectable()
@UsePipes(new WSValidationPipe({ transform: true }))
export class GameSessionGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;
    private clients: Map<string, Socket>;

    // Used to inject the required services
    // eslint-disable-next-line max-params
    constructor(
        private messageFormatterService: MessageFormatterService,
        private waitingRoomService: WaitingRoomService,
        private gameService: GameService,
        private hintService: HintService,
        private gameManagerService: GameManagerService,
    ) {
        this.clients = new Map();
        this.gameService.gameDeletedObservable.subscribe((deletedGameId: string) => {
            this.server.emit(ConfigurationEvent.GameWasDeleted, deletedGameId);
            this.informWaitingPlayersGameWasDeleted(deletedGameId);
        });
    }

    @SubscribeMessage(GameSessionEvent.StartGameSession)
    async startGameSession(
        @ConnectedSocket() socket: Socket,
        @MessageBody() createGameSessionDto: CreateTimeLimitedGameSessionDto | CreateClassicGameSessionDto,
    ): Promise<WaitingRoomStatus> {
        if (this.gameManagerService.isPlayerInGameSession(socket.id)) {
            throw new WsException('A game is already in progress');
        }

        switch (createGameSessionDto.gameMode) {
            case GameMode.ClassicSolo:
            case GameMode.TimeLimitedSolo: {
                return this.gameManagerService.createSoloSession(this.server, socket, createGameSessionDto);
            }
            case GameMode.ClassicOneVersusOne:
                return this.gameManagerService.createClassicOneVersusOneSession(this.server, socket, createGameSessionDto);
            case GameMode.TimeLimitedCoop: {
                const wasWaitingRoomCreated = await this.waitingRoomService.addPlayer(TIME_LIMITED_ID, {
                    socketId: socket.id,
                    username: createGameSessionDto.username,
                });
                if (wasWaitingRoomCreated) return WaitingRoomStatus.Created;
                const waitingRoom = this.waitingRoomService.getGameWaitingRoom(TIME_LIMITED_ID) as TimeLimitedWaitingRoom;
                const gameSession = await this.gameManagerService.createTimeLimitedCoopSession(this.server, waitingRoom);
                const creatorSocket = this.clients.get(waitingRoom.creator.socketId);
                const opponentSocket = this.clients.get(waitingRoom.waitingPlayers[0].socketId);
                if (!creatorSocket || !opponentSocket || creatorSocket.id === opponentSocket.id) {
                    this.waitingRoomService.clearRoom(TIME_LIMITED_ID);
                    throw new WsException('Creator or Opponent socket not found');
                }
                this.gameManagerService.setPlayerGameSession(creatorSocket.id, gameSession);
                this.gameManagerService.setPlayerGameSession(opponentSocket.id, gameSession);
                creatorSocket.join(gameSession.roomId);
                opponentSocket.join(gameSession.roomId);
                this.server.to(gameSession.roomId).emit(GameSessionEvent.GameStart, this.gameManagerService.generateGameInfo(gameSession));
                this.waitingRoomService.clearRoom(TIME_LIMITED_ID);
                return WaitingRoomStatus.Joined;
            }
        }
    }

    @SubscribeMessage(GameSessionEvent.Message)
    message(@ConnectedSocket() socket: Socket, @MessageBody() message: Message): void {
        if (message.author !== MessageAuthor.User) {
            throw new WsException('Invalid message author');
        }

        const gameSession = this.gameManagerService.getPlayerGameSession(socket.id);
        socket.to(gameSession.roomId).emit(GameSessionEvent.Message, { ...message, author: MessageAuthor.Opponent });
    }

    @SubscribeMessage(GameSessionEvent.GetGameState)
    getGameState(@MessageBody() gameId: string): JoinableGame {
        const waitingRoom = this.waitingRoomService.getGameWaitingRoom(gameId);

        if (!waitingRoom) {
            return { _id: gameId, sheetState: GameSheetState.Creatable };
        }
        return { _id: gameId, sheetState: GameSheetState.Joinable };
    }

    @SubscribeMessage(GameSessionEvent.UseHint)
    useHint(@ConnectedSocket() socket: Socket): Hint {
        const rooms = Array.from(socket.rooms.values());
        const gameSession = this.gameManagerService.getGameSession(rooms);

        const differences = this.gameManagerService.getRemainingDifferencesArray(gameSession).flat();
        const randomDifference = this.hintService.getRandomCoordinate(differences);

        const player = gameSession.players.get(socket.id);
        if (!player) {
            throw new WsException('There is no playerData in this game');
        }

        if (player.remainingHints === 0) {
            throw new WsException('You have no hints left');
        }

        socket.emit(GameSessionEvent.Message, this.messageFormatterService.createUsedHintMessage());
        gameSession.useHintMalus();

        let hintInfo: Hint;
        if (player.remainingHints === RemainingHints.OneHintLeft) {
            hintInfo = { position: randomDifference, hintType: HintType.Third };
        } else {
            hintInfo = this.hintService.calculateZone(player.remainingHints, randomDifference);
        }
        player.remainingHints--;
        return hintInfo;
    }

    @SubscribeMessage(GameSessionEvent.AcceptOpponent)
    async acceptOpponent(@ConnectedSocket() socket: Socket, @MessageBody() { socketId }: { socketId: string }): Promise<void> {
        const waitingRoom = this.waitingRoomService.getPlayerWaitingRoom(socket.id);

        if (waitingRoom.sessionType !== SessionType.Classic) {
            throw new WsException('You cannot accept an opponent in a time limited game');
        }

        const opponent = waitingRoom.waitingPlayers[0];
        const opponentSocket = this.clients.get(socketId);

        if (!opponent || opponent.socketId !== socketId || !opponentSocket) {
            throw new WsException('Could not find you opponent');
        }

        waitingRoom.waitingPlayers.forEach((player: Player) => {
            if (player.socketId === socketId) return;
            this.server.to(player.socketId).emit(GameSessionEvent.GameSessionCanceled, CancelGameResponse.GameStarted);
        });

        this.waitingRoomService.clearRoom(waitingRoom.game._id.toString());

        const gameSession = await this.gameManagerService.createClassicSession(waitingRoom);

        this.gameManagerService.setPlayerGameSession(socket.id, gameSession);
        this.gameManagerService.setPlayerGameSession(opponentSocket.id, gameSession);

        socket.join(gameSession.roomId);
        opponentSocket.join(gameSession.roomId);

        const gameId = waitingRoom.game._id.toString();
        this.server.to(gameSession.roomId).emit(GameSessionEvent.GameStart, this.gameManagerService.generateGameInfo(gameSession));
        this.server.emit(GameSessionEvent.GameStateChanged, {
            _id: gameId,
            sheetState: GameSheetState.Creatable,
        });
    }

    @SubscribeMessage(GameSessionEvent.RejectOpponent)
    rejectOpponent(@ConnectedSocket() socket: Socket, @MessageBody() { socketId }: { socketId: string }): void {
        const wasWaitingRoomDeleted = this.waitingRoomService.removePlayer(socketId);

        if (wasWaitingRoomDeleted) {
            throw new WsException('The game was canceled');
        }

        this.server.to(socketId).emit(GameSessionEvent.GameSessionCanceled, CancelGameResponse.CreatorRejected);

        const waitingRoom = this.waitingRoomService.getPlayerWaitingRoom(socket.id);

        this.findNewOpponent(waitingRoom);
    }

    @UseInterceptors(ClassSerializerInterceptor)
    @SerializeOptions({
        groups: ['game-session'],
    })
    @SubscribeMessage(GameSessionEvent.CancelGameSession)
    cancelGameSession(@ConnectedSocket() socket: Socket): void {
        this.waitingRoomService.getPlayerWaitingRoom(socket.id);
        this.removePlayer(socket.id);
    }

    @SubscribeMessage(GameSessionEvent.GuessDifference)
    async guessDifference(@ConnectedSocket() socket: Socket, @MessageBody() coordinate: Coordinate): Promise<GuessResult> {
        const gameSession = this.gameManagerService.getPlayerGameSession(socket.id);
        const playerName = gameSession.isMultiplayer() ? gameSession.players.get(socket.id)?.username : undefined;

        const guessResult = gameSession.manageClick(coordinate, socket.id);
        if (guessResult.type === ResultType.Failure) {
            socket.emit(GameSessionEvent.Message, this.messageFormatterService.createErrorMessage(playerName));
            return guessResult;
        }

        this.server.to(gameSession.roomId).emit(GameSessionEvent.Message, this.messageFormatterService.createDifferenceFoundMessage(playerName));
        socket.to(gameSession.roomId).emit(GameSessionEvent.DifferenceFound, guessResult);

        const winner = gameSession.getWinner(socket.id);
        if (winner) {
            if (gameSession instanceof ClassicSession) {
                await this.gameManagerService.manageClassicEndGame(gameSession, socket.id, this.server);
            } else {
                this.gameManagerService.manageTimeLimitedEndGame(gameSession, this.server, true);
            }
            this.cleanupGame(gameSession);
        }

        return guessResult;
    }

    @SubscribeMessage(GameSessionEvent.RemainingDifferences)
    remainingDifferences(@ConnectedSocket() socket: Socket): Coordinate[][] {
        const gameSession = this.gameManagerService.getPlayerGameSession(socket.id);
        return this.gameManagerService.getRemainingDifferencesArray(gameSession);
    }

    giveUp(@ConnectedSocket() socket: Socket): void {
        const gameSession = this.gameManagerService.getPlayerGameSession(socket.id);

        const player = gameSession.players.get(socket.id);
        if (!player) throw new WsException('Player is not in game');

        if (gameSession instanceof ClassicSession) {
            if (!gameSession.isMultiplayer()) {
                this.gameManagerService.manageClassicEndGame(gameSession, socket.id, this.server, socket.id);
                this.cleanupGame(gameSession);
            } else {
                for (const id of gameSession.players.keys()) {
                    if (id !== socket.id) this.gameManagerService.manageClassicEndGame(gameSession, id, this.server, socket.id);
                }
                this.cleanupGame(gameSession);
            }
            socket.to(gameSession.roomId).emit(GameSessionEvent.Message, this.messageFormatterService.createGiveUpMessage(player.username));
            socket.to(gameSession.roomId).emit(GameSessionEvent.EndGame, { isWinner: true, isForfeit: true });
        } else {
            if (gameSession.isMultiplayer()) {
                this.server.to(gameSession.roomId).emit(GameSessionEvent.EndGame, { isWinner: false, isForfeit: true });
                this.gameManagerService.deletePlayerGameSession(socket.id);
            } else {
                this.cleanupGame(gameSession);
            }
        }
    }

    @UseGuards(SocketAuthGuard)
    @SubscribeMessage(GameSessionEvent.Message)
    message(@ConnectedSocket() socket: Socket, @MessageBody() message: Message): void {
        // FIXME: Change this logic
        // if (message.author !== MessageAuthor.User) {
        //     throw new WsException('Invalid message author');
        // }

        Logger.log(`You have mail!: ${JSON.stringify(message)}`);

        socket.emit(GameSessionEvent.Message, { author: 'SERVER', content: 'I received the message', time: Date.now() });

        const gameSession = this.gameManagerService.getPlayerGameSession(socket.id);
        socket.to(gameSession.roomId).emit(GameSessionEvent.Message, { ...message, author: MessageAuthor.Opponent });
    }

    @UseGuards(SocketAuthGuard)
    @SubscribeMessage(GameSessionEvent.GetGameState)
    getGameState(@MessageBody() gameId: string): JoinableGame {
        const waitingRoom = this.waitingRoomService.getGameWaitingRoom(gameId);

        if (!waitingRoom) {
            return { _id: gameId, sheetState: GameSheetState.Creatable };
        }
        return { _id: gameId, sheetState: GameSheetState.Joinable };
    }

    handleConnection(socket: Socket) {
        this.clients.set(socket.id, socket);
    }

    handleDisconnect(socket: Socket) {
        if (this.gameManagerService.isPlayerInGameSession(socket.id)) {
            this.giveUp(socket);
        }
        this.gameManagerService.deleteGameSession(Array.from(socket.rooms.values()));
        this.removePlayer(socket.id);
        this.clients.delete(socket.id);
    }

    private informWaitingPlayersGameWasDeleted(gameId: string) {
        const waitingRoom = this.waitingRoomService.getGameWaitingRoom(gameId);
        if (!waitingRoom) return;

        const playerSocketIds = waitingRoom.waitingPlayers.map((player: Player) => {
            return player.socketId;
        });

        this.server.to([...playerSocketIds, waitingRoom.creator.socketId]).emit(GameSessionEvent.GameSessionCanceled, CancelGameResponse.GameDeleted);
        this.waitingRoomService.clearRoom(gameId);
    }

    private removePlayer(socketId: string) {
        let waitingRoom: WaitingRoom;
        try {
            waitingRoom = this.waitingRoomService.getPlayerWaitingRoom(socketId);
        } catch (e) {
            return;
        }
        const firstInQueue = waitingRoom.waitingPlayers[0];
        const wasRoomDeleted = this.waitingRoomService.removePlayer(socketId);

        if (wasRoomDeleted) {
            waitingRoom.waitingPlayers.forEach((player: Player) => {
                this.server.to(player.socketId).emit(GameSessionEvent.GameSessionCanceled, CancelGameResponse.CreatorCanceled);
            });

            const gameId = waitingRoom.sessionType === SessionType.Classic ? waitingRoom.game._id.toString() : TIME_LIMITED_ID;
            this.server.emit(GameSessionEvent.GameStateChanged, {
                _id: gameId,
                sheetState: GameSheetState.Creatable,
            });
        } else if (firstInQueue && firstInQueue.socketId === socketId) {
            this.server.to(waitingRoom.creator.socketId).emit(GameSessionEvent.GameSessionCanceled, CancelGameResponse.OpponentLeft);
            this.findNewOpponent(waitingRoom);
        }
    }

    private cleanupGame(gameSession: GameSession) {
        this.gameManagerService.deleteGameSession([gameSession.roomId]);
        for (const player of gameSession.players.keys()) {
            const socket = this.clients.get(player);
            if (!socket) return;
            this.gameManagerService.deletePlayerGameSession(socket.id);
            socket.leave(gameSession.roomId);
        }
    }

    private findNewOpponent(waitingRoom: WaitingRoom) {
        const newOpponent = waitingRoom.waitingPlayers[0];
        if (waitingRoom.waitingPlayers[0]) {
            this.server.to(waitingRoom.creator.socketId).emit(GameSessionEvent.NewOpponent, {
                username: newOpponent.username,
                socketId: newOpponent.socketId,
            });
        }
    }
}
