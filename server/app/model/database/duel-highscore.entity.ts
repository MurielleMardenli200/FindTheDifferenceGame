import { Entity, ManyToOne } from "typeorm";
import { Game } from "./game.entity";
import { HighScore } from "./highscore.entity";


@Entity()
export class DuelHighScore extends HighScore {
    @ManyToOne((type) => Game, (game) => game.duelHighScores)
    game!: Game;
}
