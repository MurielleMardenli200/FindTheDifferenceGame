import { TemporaryGame } from '@app/model/database/temporary-game.entity';
import { Coordinate } from '@app/model/dto/coordinate.dto';

export interface PendingGame {
    temporaryGame: TemporaryGame;
    originalImageBase64: string;
    modifiedImageBase64: string;
    differences: Coordinate[][];
}
