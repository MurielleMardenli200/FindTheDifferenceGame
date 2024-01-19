import { Coordinate as CoordinateInterface } from '@common/model/coordinate';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNumber } from 'class-validator';

@Schema({ _id: false })
export class Coordinate implements CoordinateInterface {
    @Prop()
    @IsNumber()
    x: number;

    @Prop()
    @IsNumber()
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    static fromHash(hash: string) {
        const parts = hash.split(',');
        return new Coordinate(Number(parts[0]), Number(parts[1]));
    }

    hash(): string {
        return `${this.x},${this.y}`;
    }

    equals(other: Coordinate) {
        return this.x === other.x && this.y === other.y;
    }
}

export const coordinateSchema = SchemaFactory.createForClass(Coordinate);
coordinateSchema.loadClass(Coordinate);
