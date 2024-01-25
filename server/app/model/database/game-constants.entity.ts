import { GameConstants as GameConstantsInterface } from '@common/game-constants';
import { INIT, PENALTY, WIN } from '@common/game-default.constants';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class GameConstants implements GameConstantsInterface {
    @PrimaryGeneratedColumn('uuid')
    // FIXME: Exclude from api
    id!: string;

    @Column({ nullable: false, default: INIT })
    initialTime!: number;

    @Column({ nullable: false, default: PENALTY })
    hintPenalty!: number;

    @Column({ nullable: false, default: WIN })
    differenceFoundBonus!: number;
}
