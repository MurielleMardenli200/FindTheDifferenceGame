import { defaultDuelHighScores, defaultSoloHighScores } from '@app/constants/configuration.constants';
import { HighScore } from '@app/model/dto/high-score.dto';
import { NewGameInfo } from '@app/model/schema/new-game-info';
import { TemporaryGame } from '@app/model/schema/temporary-game';
import { Game as GameInterface } from '@common/model/game';
import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { v4 as uuid } from 'uuid';


export type ExistingGame = Game & { _id: string };

@Entity()
export class Game extends TemporaryGame implements GameInterface {
    @PrimaryGeneratedColumn('uuid')
    _id: string;

    @Column({ nullable: false })
    name: string;

    @Column({ nullable: false })
    originalImageFilename: string;

    @ApiHideProperty()
    @Column({ nullable: false })
    @Expose({ groups: ['game-session'] })
    modifiedImageFilename: string;

    @ApiHideProperty()
    @Column({ nullable: false })
    @Exclude()
    differencesFilename: string;

    @Column({ nullable: false })
    differencesCount: number;

    @Column({ array: true })
    soloHighScores: HighScore[] = defaultSoloHighScores;

    @Column({ array: true })
    duelHighScores: HighScore[] = defaultDuelHighScores;

    constructor(game: Game);
    constructor(temporaryGame: TemporaryGame, newGameInfo: NewGameInfo);
    constructor(gameOrTemporaryGame: Game | TemporaryGame, newGameInfo?: NewGameInfo) {
        super(gameOrTemporaryGame.detectionRadius, gameOrTemporaryGame.difficulty);
        if ('name' in gameOrTemporaryGame) {
            this._id = gameOrTemporaryGame._id;
            this.name = gameOrTemporaryGame.name;
            this.creationTimestamp = gameOrTemporaryGame.creationTimestamp;
            this.soloHighScores = gameOrTemporaryGame.soloHighScores;
            this.duelHighScores = gameOrTemporaryGame.duelHighScores;
            this.originalImageFilename = gameOrTemporaryGame.originalImageFilename;
            this.modifiedImageFilename = gameOrTemporaryGame.modifiedImageFilename;
            this.differencesFilename = gameOrTemporaryGame.differencesFilename;
            this.differencesCount = gameOrTemporaryGame.differencesCount;
        } else {
            // Second prototype is used, so newGameInfo is definitely defined.
            const newGameInfoAssert = newGameInfo as NewGameInfo;
            this._id = uuid();
            this.name = newGameInfoAssert.name;
            this.originalImageFilename = newGameInfoAssert.originalImageFilename;
            this.modifiedImageFilename = newGameInfoAssert.modifiedImageFilename;
            this.differencesFilename = newGameInfoAssert.differencesFilename;
            this.differencesCount = newGameInfoAssert.differencesCount;
        }
    }
}
