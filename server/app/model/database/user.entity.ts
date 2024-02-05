import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    _id!: string;

    @Column({ nullable: false })
    username!: string;

    @Column({ nullable: false })
    saltedHashedPassword!: string;

    @Column({ nullable: false })
    email!: string;
}
