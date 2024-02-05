import { User } from '@app/model/database/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

    async createUser(username: string, password: string, email: string): Promise<User> {
        const saltedHashedPassword = await this.hashPassword(password);
        return await this.userRepository.save(this.userRepository.create({ username, saltedHashedPassword, email }));
    }

    async getUser(username: string): Promise<User | null> {
        return await this.userRepository.findOne({ where: { username } });
    }

    async verifyUserAndPasswordValid(username: string, password: string): Promise<boolean> {
        const user: User | null = await this.userRepository.findOne({ where: { username } });

        if (user === null) return false;

        return await bcrypt.compare(password, user.saltedHashedPassword);
    }

    async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt();
        return await bcrypt.hash(password, salt);
    }
}
