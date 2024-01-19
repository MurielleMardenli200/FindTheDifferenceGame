import { GameMode } from '@common/game-mode';

export interface CreateClassicGameSessionDto {
    gameId: string;
    username: string;
    gameMode: GameMode.ClassicOneVersusOne | GameMode.ClassicSolo;
}

export interface CreateTimeLimitedGameSessionDto {
    username: string;
    gameMode: GameMode.TimeLimitedSolo | GameMode.TimeLimitedCoop;
}

export type CreateGameSessionDto = CreateClassicGameSessionDto | CreateTimeLimitedGameSessionDto;
