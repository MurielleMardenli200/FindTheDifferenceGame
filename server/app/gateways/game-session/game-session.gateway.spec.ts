/* eslint-disable max-lines */
import {
    defaultEmptyWaitingRoom,
    defaultWaitingRoomWithOnePlayerInQueue,
    defaultWaitingRoomWithThreePlayersInQueue,
} from '@app/samples/waiting-room';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server, Socket } from 'socket.io';
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TIME_LIMITED_ID } from '@app/constants/waiting-room.constants';
import { ClassicWaitingRoom, TimeLimitedWaitingRoom } from '@app/interfaces/waiting-room/waiting-room.interface';
import { Coordinate } from '@app/model/dto/coordinate.dto';
import { CreateClassicGameSessionDto } from '@app/model/dto/game-session/create-classic-game-session.dto';
import { CreateTimeLimitedGameSessionDto } from '@app/model/dto/game-session/create-time-limited-game-session.dto';
import { PlayerData } from '@app/model/schema/game-session';
import { defaultGame } from '@app/samples/game';
import {
    defaultClassicDuoGameSession,
    defaultClassicGameSession,
    defaultDuoGameSession,
    defaultFirstPlayer,
    defaultSecondPlayer,
    defaultSoloGameSession,
    defaultTimeLimitedCoopGameSession,
} from '@app/samples/game-session';
import { DEFAULT_SOLO_GUESS_FAILURE_RESULT, DEFAULT_SOLO_GUESS_SUCCESS_RESULT } from '@app/samples/guess-results';
import { player1, player2, player3 } from '@app/samples/player';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { GameService } from '@app/services/game/game.service';
import { HintService } from '@app/services/hints/hint.service';
import { MessageFormatterService } from '@app/services/message-formatter/message-formatter.service';
import { WaitingRoomService } from '@app/services/waiting-room/waiting-room.service';
import { CancelGameResponse } from '@common/cancel-game-responses';
import { ConfigurationEvent } from '@common/configuration.events';
import { GameMode } from '@common/game-mode';
import { GameSessionEvent } from '@common/game-session.events';
import { GameSheetState } from '@common/model/game';
import { GameInfo } from '@common/model/game-info';
import { SessionType } from '@common/model/guess-result';
import { FirstSecondHint, HintType } from '@common/model/hints';
import { Message, MessageAuthor } from '@common/model/message';
import { WaitingRoomStatus } from '@common/model/waiting-room-status';
import { Test, TestingModule } from '@nestjs/testing';
import { Subject } from 'rxjs';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { GameSessionGateway } from './game-session.gateway';
import { SocketAuthGuard } from '@app/authentication/ws-jwt-auth.guard';
import { AuthenticationService } from '@app/services/authentication/authentication.service';

describe('GameSessionGateway', () => {
    const createMockSocket = (id: string): SinonStubbedInstance<Socket> => {
        socket = createStubInstance<Socket>(Socket);
        socket.to.returns(socket as any);
        socket.emit.returns(socket as any);
        Object.defineProperty(socket, 'id', { value: id, writable: true });
        Object.defineProperty(socket, 'rooms', { value: [id], writable: true });

        return socket;
    };

    const SOCKET_ID = player1.socketId;
    const CREATE_CLASSIC_SOLO_DTO = { gameId: defaultGame._id.toString(), username: player1.username, gameMode: GameMode.ClassicSolo };
    const PLAYER_1_CLASSIC_ONE_VERSUS_ONE_DTO = {
        gameId: defaultGame._id.toString(),
        username: player1.username,
        gameMode: GameMode.ClassicOneVersusOne,
    };

    let gateway: GameSessionGateway;
    let gameService: SinonStubbedInstance<GameService>;
    let socket: SinonStubbedInstance<Socket>;
    let serverSocket: SinonStubbedInstance<Server>;
    let messageFormatterService: SinonStubbedInstance<MessageFormatterService>;
    let waitingRoomService: SinonStubbedInstance<WaitingRoomService>;
    let gameManagerService: SinonStubbedInstance<GameManagerService>;
    let hintService: SinonStubbedInstance<HintService>;
    let gameServiceDeletedGameSubject: Subject<string>;
    let socketAuthGuard: SinonStubbedInstance<SocketAuthGuard>;
    let authenticationService: SinonStubbedInstance<AuthenticationService>;

    beforeEach(async () => {
        gameService = createStubInstance<GameService>(GameService);
        gameServiceDeletedGameSubject = new Subject();
        gameService['gameDeletedSubject'] = gameServiceDeletedGameSubject;
        messageFormatterService = createStubInstance<MessageFormatterService>(MessageFormatterService);
        waitingRoomService = createStubInstance<WaitingRoomService>(WaitingRoomService);
        gameManagerService = createStubInstance<GameManagerService>(GameManagerService);
        hintService = createStubInstance<HintService>(HintService);
        socketAuthGuard = createStubInstance<SocketAuthGuard>(SocketAuthGuard);
        socket = createMockSocket(SOCKET_ID);
        authenticationService = createStubInstance<AuthenticationService>(AuthenticationService);

        serverSocket = createStubInstance<Server>(Server);
        serverSocket.to.returns(serverSocket as any);
        serverSocket.in.returns(serverSocket as any);
        serverSocket.emit.returns(serverSocket as any);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameSessionGateway,
                {
                    provide: GameService,
                    useValue: gameService,
                },
                {
                    provide: MessageFormatterService,
                    useValue: messageFormatterService,
                },
                {
                    provide: WaitingRoomService,
                    useValue: waitingRoomService,
                },
                {
                    provide: GameManagerService,
                    useValue: gameManagerService,
                },
                {
                    provide: HintService,
                    useValue: hintService,
                },
                {
                    provide: SocketAuthGuard,
                    useValue: socketAuthGuard,
                },
                {
                    provide: AuthenticationService,
                    useValue: authenticationService,
                },
            ],
        }).compile();

        gateway = module.get<GameSessionGateway>(GameSessionGateway);
        gateway['server'] = serverSocket;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('gameDeletedObservable event should inform players the game was deleted', () => {
        const informWaitingPlayersGameWasDeletedSpy = jest.spyOn<any, any>(gateway, 'informWaitingPlayersGameWasDeleted');
        gameServiceDeletedGameSubject.next(defaultGame._id.toString());
        expect(serverSocket.emit.calledWith(ConfigurationEvent.GameWasDeleted, defaultGame._id.toString())).toEqual(true);
        expect(informWaitingPlayersGameWasDeletedSpy).toHaveBeenCalledWith(defaultGame._id.toString());
    });

    it('startGameSession should throw an exception if the player is already in a game', async () => {
        gameManagerService.isPlayerInGameSession.withArgs(SOCKET_ID).resolves(true);

        await expect(
            gateway.startGameSession(socket, { gameId: 'noGame', username: player1.username, gameMode: GameMode.ClassicSolo }),
        ).rejects.toThrow('A game is already in progress');
    });

    it('startGameSession should start a new solo game session when called with GameMode.ClassicSolo or GameMode.TimeLimitedSolo', async () => {
        await gateway.startGameSession(socket, CREATE_CLASSIC_SOLO_DTO);
        expect(gameManagerService.createSoloSession.calledWith(gateway.server, socket, CREATE_CLASSIC_SOLO_DTO)).toEqual(true);
    });

    it('startGameSession should start a new one v one game session when called with GameMode.ClassicOneVersusOne', async () => {
        await gateway.startGameSession(socket, PLAYER_1_CLASSIC_ONE_VERSUS_ONE_DTO);
        expect(
            gameManagerService.createClassicOneVersusOneSession.calledWith(
                gateway.server,
                socket,
                PLAYER_1_CLASSIC_ONE_VERSUS_ONE_DTO as CreateClassicGameSessionDto,
            ),
        ).toEqual(true);
    });

    it('startGameSession should start a new coop game session when called with GameMode.TimeLimitedCoop', async () => {
        waitingRoomService.addPlayer.withArgs(TIME_LIMITED_ID, { socketId: SOCKET_ID, username: player1.username }).resolves(true);
        const dto = new CreateTimeLimitedGameSessionDto(player1.username, GameMode.TimeLimitedCoop);
        await expect(gateway.startGameSession(socket, dto)).resolves.toEqual(WaitingRoomStatus.Created);

        waitingRoomService.addPlayer.withArgs(TIME_LIMITED_ID, { socketId: SOCKET_ID, username: player1.username }).resolves(false);

        waitingRoomService.getGameWaitingRoom.withArgs(TIME_LIMITED_ID).returns(defaultWaitingRoomWithOnePlayerInQueue);
        gameManagerService.createTimeLimitedCoopSession
            .withArgs(gateway.server, defaultWaitingRoomWithOnePlayerInQueue as TimeLimitedWaitingRoom)
            .resolves(defaultTimeLimitedCoopGameSession);
        gateway['clients'] = new Map([
            [SOCKET_ID, socket],
            [player2.socketId, createMockSocket(player2.socketId)],
        ]);
        const result = await gateway.startGameSession(socket, dto);

        expect(result).toEqual(WaitingRoomStatus.Joined);

        gateway['clients'] = new Map();

        expect(gateway.startGameSession(socket, dto)).rejects.toThrow('Creator or Opponent socket not found');
    });

    it('cancelGameSession should call removePlayer', () => {
        waitingRoomService.getPlayerWaitingRoom.withArgs(SOCKET_ID).returns(defaultWaitingRoomWithOnePlayerInQueue);

        gateway.cancelGameSession(socket);

        expect(waitingRoomService.removePlayer.calledWith(SOCKET_ID)).toEqual(true);
    });

    it('rejectOppoent should throw an exception if removing the opponent destroys the waiting room', () => {
        waitingRoomService.removePlayer.returns(true);

        expect(() => {
            gateway.rejectOpponent(socket, { socketId: player2.socketId });
        }).toThrow('The game was canceled');
    });

    it('rejectOpponent should inform the rejected player they have been rejected', () => {
        waitingRoomService.removePlayer.returns(false);
        waitingRoomService.getPlayerWaitingRoom.returns(defaultEmptyWaitingRoom);

        const rejectedPlayerId = player2.socketId;

        gateway.rejectOpponent(socket, { socketId: rejectedPlayerId });

        expect(serverSocket.to.calledWith(rejectedPlayerId)).toEqual(true);
        expect(serverSocket.emit.calledWith(GameSessionEvent.GameSessionCanceled, CancelGameResponse.CreatorRejected)).toEqual(true);
        expect(serverSocket.emit.calledWith(GameSessionEvent.NewOpponent)).toEqual(false);
    });

    it('rejectOpponent should inform the creator if the is a new opponent after the rejected one', () => {
        waitingRoomService.removePlayer.returns(false);
        waitingRoomService.getPlayerWaitingRoom.returns({
            sessionType: SessionType.Classic,
            creator: player1,
            waitingPlayers: [player3],
            game: defaultGame,
        });

        const rejectedPlayerId = player2.socketId;

        gateway.rejectOpponent(socket, { socketId: rejectedPlayerId });

        expect(serverSocket.to.calledWith(rejectedPlayerId)).toEqual(true);
        expect(serverSocket.emit.calledWith(GameSessionEvent.GameSessionCanceled, CancelGameResponse.CreatorRejected)).toEqual(true);
        expect(
            serverSocket.emit.calledWith(GameSessionEvent.NewOpponent, {
                socketId: player3.socketId,
                username: player3.username,
            }),
        ).toEqual(true);
    });

    it('useHint() should return a new hint', () => {
        const coord = new Coordinate(0, 0);
        gameManagerService.getGameSession.withArgs([SOCKET_ID]).returns(defaultClassicGameSession);
        gameManagerService.getRemainingDifferencesArray.withArgs(defaultClassicGameSession).returns([[coord]]);
        hintService.getRandomCoordinate.withArgs([coord]).returns(coord);
        messageFormatterService.createUsedHintMessage.returns('message' as unknown as Message);

        const hint: FirstSecondHint = {
            zone: new Coordinate(0, 0),
            hintType: HintType.FirstSecond,
        };

        hintService.calculateZone.withArgs(3, coord).returns(hint);

        [...defaultClassicGameSession.players.values()][0].remainingHints = 3;

        expect(gateway.useHint(socket)).toEqual(hint);

        [...defaultClassicGameSession.players.values()][0].remainingHints = 1;

        expect(gateway.useHint(socket)).toEqual({
            position: coord,
            hintType: HintType.Third,
        });
    });

    it('useHint() should throw if the player has no more hints', () => {
        gameManagerService.getGameSession.withArgs([SOCKET_ID]).returns(defaultClassicGameSession);
        gameManagerService.getRemainingDifferencesArray.withArgs(defaultClassicGameSession).returns([[]]);
        hintService.getRandomCoordinate.withArgs([]).returns(new Coordinate(1, 2));

        [...defaultClassicGameSession.players.values()][0].remainingHints = 0;

        expect(() => {
            gateway.useHint(socket);
        }).toThrow('You have no hints left');
    });

    it('useHint() should throw if the player is not found', () => {
        const mySocket = createMockSocket(player3.socketId);
        gameManagerService.getGameSession.withArgs([player3.socketId]).returns(defaultClassicGameSession);
        gameManagerService.getRemainingDifferencesArray.withArgs(defaultClassicGameSession).returns([[]]);
        hintService.getRandomCoordinate.withArgs([]).returns(new Coordinate(1, 2));

        expect(() => {
            gateway.useHint(mySocket);
        }).toThrow('There is no playerData in this game');
    });

    it('acceptOpponent clear the waiting room and put the 2 players in the same game session', async () => {
        const gameInfo: GameInfo = {
            game: defaultDuoGameSession.game,
            usernames: [player1.username, player2.username],
            initialTime: 0,
            hintPenalty: 0,
            differenceFoundBonus: 0,
        };

        waitingRoomService.getPlayerWaitingRoom.returns(defaultWaitingRoomWithThreePlayersInQueue);

        gameManagerService.createClassicSession.resolves(defaultClassicDuoGameSession);
        gameManagerService.generateGameInfo.returns(gameInfo);
        gateway['clients'].set(player2.socketId, createMockSocket(player2.socketId));

        await gateway.acceptOpponent(socket, { socketId: player2.socketId });

        expect(
            waitingRoomService.clearRoom.calledWith((defaultWaitingRoomWithThreePlayersInQueue as ClassicWaitingRoom).game._id.toString()),
        ).toEqual(true);
        expect(serverSocket.emit.calledWith(GameSessionEvent.GameSessionCanceled, CancelGameResponse.GameStarted)).toEqual(true);
        expect(serverSocket.emit.calledWith(GameSessionEvent.GameStart, gameInfo)).toEqual(true);
        expect(
            serverSocket.emit.calledWith(GameSessionEvent.GameStateChanged, {
                _id: (defaultWaitingRoomWithThreePlayersInQueue as ClassicWaitingRoom).game._id.toString(),
                sheetState: GameSheetState.Creatable,
            }),
        ).toEqual(true);
    });

    it('acceptOpponent should throw an exception if the opponent cannot be found', async () => {
        waitingRoomService.getPlayerWaitingRoom.returns(defaultWaitingRoomWithThreePlayersInQueue);

        await expect(gateway.acceptOpponent(socket, { socketId: 'playerWhoLeft' })).rejects.toThrow('Could not find you opponent');
    });

    it('acceptOpponent should throw an exception if the waiting room is of time limited kind', async () => {
        const timeLimitedWaitingRoom: TimeLimitedWaitingRoom = { ...defaultWaitingRoomWithOnePlayerInQueue, sessionType: SessionType.TimeLimited };
        waitingRoomService.getPlayerWaitingRoom.returns(timeLimitedWaitingRoom);
        gateway['clients'].set(player2.socketId, createMockSocket(player2.socketId));
        await expect(gateway.acceptOpponent(socket, { socketId: player2.socketId })).rejects.toThrow(
            'You cannot accept an opponent in a time limited game',
        );
    });

    it('remainingDifferences() should return the remaining differences', () => {
        const coordinates = [[new Coordinate(0, 0), new Coordinate(0, 1)]];
        gameManagerService.getPlayerGameSession.returns(defaultSoloGameSession);
        gameManagerService.getRemainingDifferencesArray.returns(coordinates);
        expect(gateway.remainingDifferences(socket)).toEqual(coordinates);
    });

    it('giveUp() should send EndGame event in classic mode', () => {
        const player: PlayerData = {
            username: defaultFirstPlayer.username,
            differencesFound: 0,
            remainingHints: 3,
        };
        gameManagerService.getPlayerGameSession.returns(defaultDuoGameSession);
        defaultDuoGameSession.players.set(defaultFirstPlayer.playerId, player);
        Object.defineProperty(socket, 'id', { value: defaultFirstPlayer.playerId });

        gateway.giveUp(socket);
        expect(socket.to.calledWith(defaultDuoGameSession.roomId)).toEqual(true);
        expect(socket.emit.calledWith(GameSessionEvent.EndGame)).toEqual(true);
    });

    it('giveUp() should cleanup game or send EndGame dependending on players left in time limited mode', () => {
        const player: PlayerData = {
            username: defaultFirstPlayer.username,
            differencesFound: 0,
            remainingHints: 3,
        };
        gameManagerService.getPlayerGameSession.returns(defaultTimeLimitedCoopGameSession);
        defaultTimeLimitedCoopGameSession.players = new Map();
        defaultTimeLimitedCoopGameSession.players.set(defaultFirstPlayer.playerId, player);
        Object.defineProperty(socket, 'id', { value: defaultFirstPlayer.playerId });
        // create spy on cleanup method of gateway
        const cleanupGameSpy = jest.spyOn<any, any>(gateway, 'cleanupGame');

        gateway.giveUp(socket);
        expect(cleanupGameSpy).toHaveBeenCalled();

        defaultTimeLimitedCoopGameSession.players.set(defaultSecondPlayer.playerId, player);

        gateway.giveUp(socket);

        expect(serverSocket.to.calledWith(defaultTimeLimitedCoopGameSession.roomId)).toEqual(true);
        expect(serverSocket.emit.calledWith(GameSessionEvent.EndGame, { isWinner: false, isForfeit: true })).toEqual(true);
    });

    it('giveUp() should throw if no game in progress', () => {
        gameManagerService.getPlayerGameSession.throws(new Error('No game in progress'));
        expect(() => gateway.giveUp(socket)).toThrow('No game in progress');
    });

    it('giveUp() should throw if the player is not found', () => {
        const mySocket = createMockSocket(player3.socketId);
        gameManagerService.getPlayerGameSession.returns(defaultDuoGameSession);
        expect(() => gateway.giveUp(mySocket)).toThrow('Player is not in game');
    });

    it('guessDifference() should return Success if difference clicked', async () => {
        gameManagerService.getPlayerGameSession.returns(defaultSoloGameSession);
        const manageClickSpy = jest.spyOn(defaultSoloGameSession, 'manageClick').mockImplementation(() => DEFAULT_SOLO_GUESS_SUCCESS_RESULT);

        expect(await gateway.guessDifference(socket, { x: 0, y: 0 } as Coordinate)).toEqual(DEFAULT_SOLO_GUESS_SUCCESS_RESULT);
        expect(manageClickSpy).toHaveBeenCalled();
    });

    it('guessDifference() should return Failure if no difference clicked', async () => {
        gameManagerService.getPlayerGameSession.returns(defaultSoloGameSession);
        const manageClickSpy = jest.spyOn(defaultSoloGameSession, 'manageClick').mockImplementation(() => DEFAULT_SOLO_GUESS_FAILURE_RESULT);
        expect(await gateway.guessDifference(socket, new Coordinate(100, 100))).toEqual(DEFAULT_SOLO_GUESS_FAILURE_RESULT);
        expect(manageClickSpy).toHaveBeenCalled();
    });

    it('guessDifference() should call gameManager.manageEndGame if there is a winner in classic mode', async () => {
        gameManagerService.getPlayerGameSession.returns(defaultDuoGameSession);
        const manageClickSpy = jest.spyOn(defaultDuoGameSession, 'manageClick').mockImplementation(() => DEFAULT_SOLO_GUESS_SUCCESS_RESULT);
        jest.spyOn(defaultDuoGameSession, 'getWinner').mockImplementation(() => defaultFirstPlayer.playerId);
        gateway.guessDifference(socket, new Coordinate(1, 5));
        expect(serverSocket.to.calledWith(defaultDuoGameSession.roomId)).toEqual(true);
        expect(manageClickSpy).toHaveBeenCalled();
    });

    it('handleDisconnect() should remove references to the client', () => {
        waitingRoomService.getPlayerWaitingRoom.returns(defaultWaitingRoomWithThreePlayersInQueue);

        const socketRooms = new Set([socket.id]);

        const removePlayerSpy = jest.spyOn(gateway as any, 'removePlayer');
        const clientsSpy = jest.spyOn(gateway['clients'] as any, 'delete');

        Object.defineProperty(socket, 'rooms', { value: socketRooms });

        gateway.handleDisconnect(socket);
        expect(gameManagerService.deleteGameSession.calledOnceWith([socket.id])).toEqual(true);
        expect(removePlayerSpy).toHaveBeenCalledWith(socket.id);
        expect(clientsSpy).toHaveBeenCalledWith(socket.id);
    });

    it('message() should send a message to the other player', () => {
        const message: Message = { content: 'Hello', author: MessageAuthor.User, time: Date.now() };

        gameManagerService.getPlayerGameSession.returns(defaultDuoGameSession);

        gateway.message(socket, message);
        expect(socket.to.calledWith(defaultDuoGameSession.roomId)).toEqual(true);
    });

    it('message() should throw if there is no game in progress', () => {
        gameManagerService.getPlayerGameSession.throws(new Error('No game in progress'));
        const message: Message = { content: 'Hello', author: MessageAuthor.User, time: Date.now() };
        expect(() => gateway.message(socket, message)).toThrow('No game in progress');
    });

    it('message() should throw if message is from wrong author', () => {
        const message: Message = { content: 'Hello', author: MessageAuthor.System, time: Date.now() };
        expect(() => gateway.message(socket, message)).toThrow('Invalid message author');
    });

    it('getGameState should return that the game as joinable if there is a waiting room', () => {
        waitingRoomService.getGameWaitingRoom.returns(defaultEmptyWaitingRoom);
        expect(gateway.getGameState(defaultGame._id.toString())).toEqual({ _id: defaultGame._id.toString(), sheetState: GameSheetState.Joinable });
    });

    it('getGameState should return that the game as creatable if there is no waiting room', () => {
        waitingRoomService.getGameWaitingRoom.returns(undefined);
        expect(gateway.getGameState(defaultGame._id.toString())).toEqual({ _id: defaultGame._id.toString(), sheetState: GameSheetState.Creatable });
    });

    it('handleConnection should add the socket to the clients map', () => {
        const clientsSpy = jest.spyOn(gateway['clients'] as any, 'set');
        gateway.handleConnection(socket);
        expect(clientsSpy).toHaveBeenCalledWith(socket.id, socket);
    });

    it('cleanupGame should delete the game session and remove the players from the game session room', () => {
        const opponentSocket = createMockSocket(defaultSecondPlayer.playerId);
        const playerSocket = createMockSocket(defaultFirstPlayer.playerId);
        gameManagerService.deleteGameSession.returns(undefined);
        const firstPlayer: PlayerData = {
            username: defaultFirstPlayer.username,
            differencesFound: 0,
            remainingHints: 3,
        };
        const secondPlayer: PlayerData = {
            username: defaultSecondPlayer.username,
            differencesFound: 0,
            remainingHints: 3,
        };

        defaultDuoGameSession.players = new Map();
        defaultDuoGameSession.players.set(opponentSocket.id, secondPlayer);
        defaultDuoGameSession.players.set(playerSocket.id, firstPlayer);
        gateway['clients'].clear();
        gateway['clients'].set(opponentSocket.id, playerSocket);
        gateway['clients'].set(playerSocket.id, opponentSocket);

        gateway['cleanupGame'](defaultDuoGameSession);

        expect(gameManagerService.deleteGameSession.calledWith([defaultDuoGameSession.roomId])).toEqual(true);
        expect(opponentSocket.leave.calledWith(defaultDuoGameSession.roomId)).toEqual(true);
    });

    it('removePlayer should call inform the waiting players if the waiting room was deleted', () => {
        waitingRoomService.getPlayerWaitingRoom.returns(defaultWaitingRoomWithThreePlayersInQueue);
        waitingRoomService.removePlayer.withArgs(defaultWaitingRoomWithThreePlayersInQueue.creator.socketId).returns(true);

        gateway['removePlayer'](defaultWaitingRoomWithThreePlayersInQueue.creator.socketId);

        expect(waitingRoomService.removePlayer.calledWith(defaultWaitingRoomWithThreePlayersInQueue.creator.socketId)).toEqual(true);
        expect(serverSocket.emit.calledWith(GameSessionEvent.GameSessionCanceled, CancelGameResponse.CreatorCanceled)).toEqual(true);
        expect(
            serverSocket.emit.calledWith(GameSessionEvent.GameStateChanged, {
                _id: (defaultWaitingRoomWithThreePlayersInQueue as ClassicWaitingRoom).game._id,
                sheetState: GameSheetState.Creatable,
            }),
        ).toEqual(true);
        expect(serverSocket.emit.callCount).toEqual(defaultWaitingRoomWithThreePlayersInQueue.waitingPlayers.length + 1);
    });
});
