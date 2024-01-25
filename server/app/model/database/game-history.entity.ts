import { GameMode } from '@common/game-mode';
import { History as HistoryInterface } from '@common/model/history';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

//
@Entity()
export class History implements HistoryInterface {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    gameStart!: number;

    @Column()
    gameTime!: number;

    @Column()
    gameMode!: GameMode;

    @Column("text", { array: true })
    players!: string[];

    @Column({ nullable: true })
    isWinner?: number;

    @Column({ nullable: true })
    hasAbandonned?: number;
}
