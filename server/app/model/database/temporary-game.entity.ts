import { Difficulty } from '@common/model/difficulty';
import { Prop, Schema } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';

@Schema()
export class TemporaryGame {
    @Prop()
    detectionRadius: number;

    @Prop()
    difficulty: Difficulty;

    @Prop()
    creationTimestamp: number;

    @Transform(({ value }: { value: string }) => value.toString(), { toPlainOnly: true })
    _id?: string;

    constructor(detectionRadius: number, difficulty: Difficulty, creationTimestamp: number = Date.now()) {
        this.detectionRadius = detectionRadius;
        this.difficulty = difficulty;
        this.creationTimestamp = creationTimestamp;
    }
}
