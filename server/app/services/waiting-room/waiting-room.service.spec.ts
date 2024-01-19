import { defaultGame } from '@app/samples/game';
import { player1, player2, player3, player4 } from '@app/samples/player';
import {
    defaultEmptyWaitingRoom,
    defaultWaitingRoomWithOnePlayerInQueue,
    defaultWaitingRoomWithThreePlayersInQueue,
    defaultWaitingRoomWithTwoPlayersInQueue,
} from '@app/samples/waiting-room';
import { GameService } from '@app/services/game/game.service';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { WaitingRoomService } from './waiting-room.service';

describe('WaitingRoomService', () => {
    let service: WaitingRoomService;
    let gameServiceStub: SinonStubbedInstance<GameService>;

    beforeEach(async () => {
        gameServiceStub = createStubInstance(GameService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [WaitingRoomService, { provide: GameService, useValue: gameServiceStub }],
        }).compile();

        service = module.get<WaitingRoomService>(WaitingRoomService);
        service['gameIdToRoom'] = new Map();
        service['socketIdToRoom'] = new Map();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('getGameWaitingRoom should return the correct waiting room', () => {
        expect(service.getGameWaitingRoom(defaultGame._id as string)).toBeUndefined();

        const gameIdOne = '1';
        const gameIdTwo = '2';
        const gameIdThree = '3';

        (service['gameIdToRoom'] as unknown) = new Map([
            [defaultGame._id, defaultEmptyWaitingRoom],
            [gameIdOne, defaultWaitingRoomWithOnePlayerInQueue],
            [gameIdTwo, defaultWaitingRoomWithTwoPlayersInQueue],
            [gameIdThree, defaultWaitingRoomWithThreePlayersInQueue],
        ]);

        expect(service.getGameWaitingRoom(defaultGame._id as string)).toEqual(defaultEmptyWaitingRoom);
        expect(service.getGameWaitingRoom(gameIdOne)).toEqual(defaultWaitingRoomWithOnePlayerInQueue);
        expect(service.getGameWaitingRoom(gameIdTwo)).toEqual(defaultWaitingRoomWithTwoPlayersInQueue);
        expect(service.getGameWaitingRoom(gameIdThree)).toEqual(defaultWaitingRoomWithThreePlayersInQueue);
    });

    it('clearRoom should delete the waiting room and delete the waiting room associated to the players waiting', () => {
        service['gameIdToRoom'].set(defaultGame._id as string, defaultWaitingRoomWithOnePlayerInQueue);
        service['socketIdToRoom'].set(player1.socketId, defaultWaitingRoomWithOnePlayerInQueue);
        service['socketIdToRoom'].set(player2.socketId, defaultWaitingRoomWithOnePlayerInQueue);

        service.clearRoom(defaultGame._id as string);

        expect(service['gameIdToRoom'].get(defaultGame._id as string)).toBeUndefined();
        expect(service['socketIdToRoom'].get(player1.socketId)).toBeUndefined();
        expect(service['socketIdToRoom'].get(player2.socketId)).toBeUndefined();
    });

    it('clearRoom called with a gameId that does not exist should not delete anything', () => {
        const gameIdMapDeleteSpy = jest.spyOn(service['gameIdToRoom'], 'delete');
        const socketIdMapDeleteSpy = jest.spyOn(service['socketIdToRoom'], 'delete');

        service.clearRoom('hasNoWaitingRoom');

        expect(gameIdMapDeleteSpy).not.toHaveBeenCalled();
        expect(socketIdMapDeleteSpy).not.toHaveBeenCalled();
    });

    it("addPlayer should create a new waiting room if there isn't already one and return true", async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gameServiceStub.getGame.resolves(defaultGame as any);

        const wasRoomCreated = await service.addPlayer(defaultGame._id as string, player1);

        expect(wasRoomCreated).toEqual(true);
        expect(service['gameIdToRoom'].get(defaultGame._id as string)).toEqual(defaultEmptyWaitingRoom);
        expect(service['socketIdToRoom'].get(player1.socketId)).toEqual(defaultEmptyWaitingRoom);
    });

    it('addPlayer should add the player at the end of the queue', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gameServiceStub.getGame.resolves(defaultGame as any);
        service['gameIdToRoom'].set(defaultGame._id as string, defaultEmptyWaitingRoom);
        service['socketIdToRoom'].set(player1.socketId, defaultEmptyWaitingRoom);

        const wasRoomCreated = await service.addPlayer(defaultGame._id as string, player2);

        expect(wasRoomCreated).toEqual(false);
        expect(service['gameIdToRoom'].get(defaultGame._id as string)).toEqual(defaultWaitingRoomWithOnePlayerInQueue);
        expect(service['socketIdToRoom'].get(player2.socketId)).toEqual(defaultWaitingRoomWithOnePlayerInQueue);
    });

    it('addPlayer called with an gameId that has no game should throw a exception', async () => {
        gameServiceStub.getGame.resolves(null);

        await expect(service.addPlayer('noGameId', player1)).rejects.toThrow('Game not found');
        expect(service['gameIdToRoom'].get('noGameId')).toBeUndefined();
        expect(service['socketIdToRoom'].get(player1.socketId)).toBeUndefined();
    });

    it('removePlayer called with the room creator should delete the waiting room and return true', () => {
        service['gameIdToRoom'].set(defaultGame._id as string, defaultEmptyWaitingRoom);
        service['socketIdToRoom'].set(player1.socketId, defaultEmptyWaitingRoom);

        const clearRoomSpy = jest.spyOn(service, 'clearRoom');

        const wasRoomDeleted = service.removePlayer(player1.socketId);

        expect(wasRoomDeleted).toEqual(true);
        expect(clearRoomSpy).toHaveBeenCalledWith(defaultGame._id as string);
        expect(service['gameIdToRoom'].get(defaultGame._id as string)).toBeUndefined();
        expect(service['socketIdToRoom'].get(player1.socketId)).toBeUndefined();
    });

    it('removePlayer should remove the player from the queue and shift the players added after them towards the start of the queue', () => {
        service['gameIdToRoom'].set(defaultGame._id as string, defaultWaitingRoomWithThreePlayersInQueue);
        service['socketIdToRoom'].set(player2.socketId, defaultWaitingRoomWithThreePlayersInQueue);

        const wasRoomDeleted = service.removePlayer(player2.socketId);

        expect(wasRoomDeleted).toEqual(false);
        expect(service['socketIdToRoom'].get(player2.socketId)).toBeUndefined();
        expect(service['gameIdToRoom'].get(defaultGame._id as string)?.waitingPlayers).toEqual([player3, player4]);
    });

    it('removePlayer called with a player that is not in a waiting room should return false', () => {
        const wasRoomDeleted = service.removePlayer('notInRoom');

        expect(wasRoomDeleted).toEqual(false);
    });

    it('getPlayerWaitingRoom should return the waiting room of the player', () => {
        service['socketIdToRoom'].set(player1.socketId, defaultEmptyWaitingRoom);

        expect(service.getPlayerWaitingRoom(player1.socketId)).toEqual(defaultEmptyWaitingRoom);
    });

    it('getPlayerWaitingRoom should throw error if the requested player is not in a waiting room', () => {
        expect(() => service.getPlayerWaitingRoom('notInRoom')).toThrowError();
    });
});
