/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { Coordinate } from '@app/model/dto/coordinate.dto';
import { PlayerData } from '@app/model/schema/game-session';
import { defaultGame } from '@app/samples/game';
import { DEFAULT_GAME_CONSTANTS, differences } from '@app/samples/game-session';
import { defaultTimeLimitedcWaitingRoomWithOnePlayerInQueue } from '@app/samples/waiting-room';
import { DifferencesService } from '@app/services/differences/differences.service';
import { ExistingGame } from '@common/model/game';
import { ResultType, SessionType } from '@common/model/guess-result';
import { TimeLimitedSession } from './time-limited-session';

describe('TimeLimitedSession', () => {
    let gameSession: TimeLimitedSession;
    const mockDifferenceService = {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        loadDifferences: async (_: string) => {
            return Promise.resolve(differences);
        },
    } as DifferencesService;

    beforeEach(() => {
        const games = [{ _id: 0 } as any as ExistingGame, { _id: 1 } as any as ExistingGame, { _id: 2 } as any as ExistingGame];

        gameSession = new TimeLimitedSession(
            mockDifferenceService,
            defaultTimeLimitedcWaitingRoomWithOnePlayerInQueue,
            games as any,
            DEFAULT_GAME_CONSTANTS,
        );
        gameSession.game = defaultGame;
    });

    it('should be defined', () => {
        expect(gameSession).toBeDefined();
    });

    it('getRandomGame() should return a game of the gameSession', () => {
        const gamesLength = gameSession.games.length;
        const game = gameSession.getRandomGame();

        expect(gameSession.games).not.toContain(game);
        expect(gameSession.games.length).toEqual(gamesLength - 1);
    });

    it('getWinner() should return a winner if all conditions are reunited', () => {
        gameSession.games = [];
        gameSession.game.differencesCount = 0;
        gameSession.originalDifferenceCount = 1;
        gameSession.players = new Map([
            ['yes', {} as PlayerData],
            ['no', {} as PlayerData],
        ]);
        const expected = 'yes';
        const stopTimerSpy = jest.spyOn(gameSession.timer, 'stopTimer').mockImplementation();
        expect(gameSession.getWinner()).toEqual(expected);
        expect(stopTimerSpy).toHaveBeenCalled();
    });

    it('manageClick() should throw if player not in the game', () => {
        gameSession.players = new Map();
        expect(() => {
            gameSession.manageClick({ x: 3, y: 4 } as Coordinate, 'ioubio');
        }).toThrow();
    });

    it('manageClick() should throw if player throttled', () => {
        gameSession.players = new Map([
            ['yes', {} as PlayerData],
            ['no', {} as PlayerData],
        ]);
        gameSession.throttleEndTimestamp = Infinity;
        expect(() => {
            gameSession.manageClick({ x: 3, y: 4 } as Coordinate, 'yes');
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
        jest.spyOn(gameSession, 'getRandomGame').mockImplementation(() => defaultGame);

        gameSession.differences = [diffSet];
        const res = gameSession.manageClick(new Coordinate(2, 3), 'yes');
        expect(res).toEqual({
            sessionType: SessionType.TimeLimited,
            type: ResultType.Success,
            game: defaultGame,
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
        jest.spyOn(gameSession, 'getRandomGame').mockImplementation(() => defaultGame);

        gameSession.differences = [diffSet];
        const res = gameSession.manageClick(new Coordinate(5, 9), 'yes');
        expect(res).toEqual({
            sessionType: SessionType.TimeLimited,
            type: ResultType.Failure,
        });
    });

    it('hintMalus() should call timer.addBonus', () => {
        gameSession.hintPenalty = 5;
        const timerBonusSpy = jest.spyOn(gameSession.timer, 'addBonus').mockImplementation();
        gameSession.useHintMalus();
        expect(timerBonusSpy).toHaveBeenCalledWith(-gameSession.hintPenalty);
    });
});
