import { GameMode } from '@common/game-mode';
import { History as HistoryInterface } from '@common/model/history';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class History implements HistoryInterface {
    @Prop({ required: true })
    gameStart: number;

    @Prop({ required: true })
    gameTime: number;

    @Prop({ required: true })
    gameMode: GameMode;

    @Prop({ required: true })
    players: string[];

    @Prop()
    isWinner?: number;

    @Prop()
    hasAbandonned?: number;

    constructor(history: History) {
        this.gameStart = history.gameStart;
        this.gameTime = history.gameTime;
        this.gameMode = history.gameMode;
        this.players = history.players;
        this.isWinner = history.isWinner;
        this.hasAbandonned = history.hasAbandonned;
    }
}

export const gameHistorySchema = SchemaFactory.createForClass(History);
gameHistorySchema.loadClass(History);
