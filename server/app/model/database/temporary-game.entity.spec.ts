import { defaultTemporaryGame } from '@app/samples/game';
import { instanceToPlain } from 'class-transformer';
import { Types } from 'mongoose';
import { TemporaryGame } from './temporary-game.entity';

describe('TemporaryGameEntity', () => {
    it('_id should be transformed to string by instanceToPlain', () => {
        defaultTemporaryGame._id = new Types.ObjectId('012345678901234567891234') as unknown as string;
        const serializedGame = instanceToPlain(defaultTemporaryGame) as TemporaryGame;
        expect(serializedGame._id).toEqual('012345678901234567891234');
    });
});
