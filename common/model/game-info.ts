import { ExistingGame } from './game';

export interface GameInfo {
    game: ExistingGame;
    initialTime: number;
    hintPenalty: number;
    differenceFoundBonus: number;
    usernames: string[];
}
