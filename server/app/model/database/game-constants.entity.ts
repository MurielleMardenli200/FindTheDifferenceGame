import { GameConstants as GameConstantsInterface } from '@common/game-constants';
import { INIT, PENALTY, WIN } from '@common/game-default.constants';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class GameConstants implements GameConstantsInterface {
    @Prop({ required: true, default: INIT })
    initialTime: number;

    @Prop({ required: true, default: PENALTY })
    hintPenalty: number;

    @Prop({ required: true, default: WIN })
    differenceFoundBonus: number;

    constructor(gameConstants: GameConstants = { initialTime: INIT, hintPenalty: PENALTY, differenceFoundBonus: WIN }) {
        this.initialTime = gameConstants.initialTime;
        this.hintPenalty = gameConstants.hintPenalty;
        this.differenceFoundBonus = gameConstants.differenceFoundBonus;
    }
}

export type GameConstantsDocument = GameConstants & Document;

export const gameConstantsSchema = SchemaFactory.createForClass(GameConstants);
gameConstantsSchema.loadClass(GameConstants);
