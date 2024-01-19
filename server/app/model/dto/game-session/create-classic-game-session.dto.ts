import { IsObjectId } from '@app/class-validators/is-object-id/is-object-id.class-validator';
import { GameMode } from '@common/game-mode';
import { CreateClassicGameSessionDto as CreateGameSessionInterface } from '@common/model/dto/create-game-session';

export class CreateClassicGameSessionDto implements CreateGameSessionInterface {
    @IsObjectId()
    gameId: string;
    username: string;
    gameMode: GameMode.ClassicOneVersusOne | GameMode.ClassicSolo;

    constructor(gameId: string, username: string, gameMode: GameMode.ClassicOneVersusOne | GameMode.ClassicSolo) {
        this.gameId = gameId;
        this.username = username;
        this.gameMode = gameMode;
    }
}
