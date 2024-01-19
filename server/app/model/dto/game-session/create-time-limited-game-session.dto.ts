import { IsObjectId } from '@app/class-validators/is-object-id/is-object-id.class-validator';
import { GameMode } from '@common/game-mode';
import { CreateTimeLimitedGameSessionDto as CreateGameSessionInterface } from '@common/model/dto/create-game-session';

export class CreateTimeLimitedGameSessionDto implements CreateGameSessionInterface {
    @IsObjectId()
    username: string;
    gameMode: GameMode.TimeLimitedSolo | GameMode.TimeLimitedCoop;

    constructor(username: string, gameMode: GameMode.TimeLimitedSolo | GameMode.TimeLimitedCoop) {
        this.username = username;
        this.gameMode = gameMode;
    }
}
