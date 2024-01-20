/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ClassicWaitingRoom } from '@app/interfaces/waiting-room/waiting-room.interface';
import { Coordinate } from '@app/model/dto/coordinate.dto';
import { PlayerData } from '@app/model/schema/game-session';
import { defaultGame } from '@app/samples/game';
import { DEFAULT_GAME_CONSTANTS, differences } from '@app/samples/game-session';
import { player1, player2, player3 } from '@app/samples/player';
import { DifferencesService } from '@app/services/differences/differences.service';
import { ResultType, SessionType } from '@common/model/guess-result';
import { ClassicSession } from './classic-session';

describe('ClassicSession', () => {
    let gameSession: ClassicSession;
    const mockDifferenceService = {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        loadDifferences: async (_: string) => {
            return Promise.resolve(differences);
        },
        encodeDifference: () => '23',
    } as any as DifferencesService;

    beforeEach(() => {
        const defaultWaitingRoomWithTwoPlayersInQueue: ClassicWaitingRoom = {
            creator: player1,
            waitingPlayers: [player2, player3],
            game: defaultGame,
            sessionType: SessionType.Classic,
        };

        gameSession = new ClassicSession(mockDifferenceService, defaultWaitingRoomWithTwoPlayersInQueue, DEFAULT_GAME_CONSTANTS);
    });

    it('manageClick() should throw if player not in the game', () => {
        gameSession.players = new Map();
        expect(() => {
            gameSession.manageClick({ x: 3, y: 4 } as Coordinate, 'ioubio');
        }).toThrow();
    });

    it('manageClick() should throw if player throttled', () => {
        gameSession.throttleEndTimestamp = Date.now() + 1000000000;
        expect(() => {
            gameSession.manageClick({ x: 3, y: 4 } as Coordinate, [...gameSession.players.keys()][0]);
        }).toThrow();
    });

    it('getWinner() should return a winner if all conditions are reunited in multiplayer', () => {
        gameSession.game.differencesCount = 0;
        gameSession.players = new Map([
            ['yes', { differencesFound: 37 } as PlayerData],
            ['no', { differencesFound: 0 } as PlayerData],
        ]);
        gameSession.game.differencesCount = 2;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const expected = 'yes';
        expect(gameSession.getWinner('yes')).toEqual('yes');
    });

    it('getWinner() should return a winner if all conditions are reunited in solo', () => {
        gameSession.game.differencesCount = 0;
        gameSession.players = new Map([['yes', { differencesFound: 37 } as PlayerData]]);
        gameSession.differences = [];
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const expected = 'yes';
        expect(gameSession.getWinner('yes')).toEqual('yes');
    });

    it('getWinner() should throw if player not in room', () => {
        gameSession.game.differencesCount = 0;
        gameSession.players = new Map();
        expect(() => {
            gameSession.getWinner('yes');
        }).toThrow();
    });

    it('manageClick() should return a valid success gameResponse if coordinate is a difference', () => {
        const coordinate = new Coordinate(2, 3);
        const diffSet = new Set<string>();
        diffSet.add(coordinate.hash());
        gameSession.players = new Map([
            ['yes', {} as PlayerData],
            ['no', {} as PlayerData],
        ]);

        gameSession.differences = [diffSet];
        const res = gameSession.manageClick(new Coordinate(2, 3), 'yes');
        expect(res).toEqual({
            sessionType: SessionType.Classic,
            type: ResultType.Success,
            difference: '23',
        });
    });

    it('manageClick() should return a valid failed gameResponse if coordinate is a difference', () => {
        const coordinate = new Coordinate(2, 3);
        const diffSet = new Set<string>();
        diffSet.add(coordinate.hash());
        gameSession.players = new Map([
            ['yes', {} as PlayerData],
            ['no', {} as PlayerData],
        ]);
        gameSession.differences = [diffSet];
        const res = gameSession.manageClick(new Coordinate(5, 9), 'yes');
        expect(res).toEqual({
            sessionType: SessionType.Classic,
            type: ResultType.Failure,
        });
    });

    it('hintMalus() should decrement starterTime', () => {
        const startedTime = 22;
        gameSession.startedTime = startedTime;
        gameSession.hintPenalty = 22;
        gameSession.useHintMalus();
        expect(gameSession.startedTime).toBeLessThan(startedTime);
    });
});
