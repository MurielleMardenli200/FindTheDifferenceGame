import { defaultDuelHighScores, defaultSoloHighScores } from '@app/constants/configuration.constants';
import { HighScore } from '@app/model/dto/high-score.dto';
import { NewGameInfo } from '@app/model/schema/new-game-info';
import { Game as GameInterface } from '@common/model/game';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { Document } from 'mongoose';
import { TemporaryGame } from './temporary-game.entity';

export type GameDocument = Game & Document;
export type ExistingGame = Game & { _id: string };

@Schema()
export class Game extends TemporaryGame implements GameInterface {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    originalImageFilename: string;

    @ApiHideProperty()
    @Prop({ required: true })
    @Expose({ groups: ['game-session'] })
    modifiedImageFilename: string;

    @ApiHideProperty()
    @Prop({ required: true })
    @Exclude()
    differencesFilename: string;

    @Prop({ required: true })
    differencesCount: number;

    @Prop()
    soloHighScores: HighScore[] = defaultSoloHighScores;

    @Prop()
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
            this.name = newGameInfoAssert.name;
            this.originalImageFilename = newGameInfoAssert.originalImageFilename;
            this.modifiedImageFilename = newGameInfoAssert.modifiedImageFilename;
            this.differencesFilename = newGameInfoAssert.differencesFilename;
            this.differencesCount = newGameInfoAssert.differencesCount;
        }
    }
}

export const gameSchema = SchemaFactory.createForClass(Game);
gameSchema.loadClass(Game);
