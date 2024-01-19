import { GameMode } from '@common/game-mode';
import { History } from './game-history.entity';

describe('History', () => {
    let entity: History;

    const history: History = {
        gameStart: Date.now(),
        gameTime: 50,
        gameMode: GameMode.ClassicOneVersusOne,
        players: ['player', 'player'],
        isWinner: 0,
        hasAbandonned: 1,
    };

    beforeEach(async () => {
        entity = new History(history);
    });

    it('should create', () => {
        expect(entity).toBeTruthy();
        expect(entity.gameStart).toEqual(history.gameStart);
        expect(entity.gameTime).toEqual(history.gameTime);
        expect(entity.gameMode).toEqual(history.gameMode);
        expect(entity.players).toEqual(history.players);
        expect(entity.isWinner).toEqual(history.isWinner);
        expect(entity.hasAbandonned).toEqual(history.hasAbandonned);
    });
});
