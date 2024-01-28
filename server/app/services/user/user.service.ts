import { User } from '@app/model/database/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

    async createUser(username: string, password: string): Promise<User> {
        const user = new this.userModel({ username, password });
        return await this.userModel.create(user);
    }

    async getUser(username: string): Promise<User | null> {
        return await this.userModel.findOne({ username });
    }

    async isUserAndPasswordValid(username: string, password: string): Promise<boolean> {
        const user: User | null = await this.userModel.findOne({ username: { username } });

        if (user !== null) {
            return user.password === password;
        }
        return false;
    }
}
