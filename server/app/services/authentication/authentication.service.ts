import { User } from '@app/model/database/user.entity';
import { UserService } from '@app/services/user/user.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthenticationService {
    constructor(private userService: UserService, private jwtService: JwtService) {}

    async isUserAndPasswordValid(username: string, password: string): Promise<boolean> {
        return await this.userService.isUserAndPasswordValid(username, password);
    }

    async logIn(username: string, password: string): Promise<string> {
        const user = await this.userService.getUser(username);
        if (user !== null && user.password === password) {
            const payload = { sub: user._id, username: user.username };
            return this.jwtService.signAsync(payload);
        }
        throw new HttpException('Incorrect username or password', HttpStatus.BAD_REQUEST);
    }

    async signUp(username: string, password: string): Promise<User> {
        const user = await this.userService.getUser(username);
        if (user !== null) {
            throw new HttpException('Username already exists', HttpStatus.CONFLICT);
        }
        return await this.userService.createUser(username, password);
    }

    async validateUser(username: string, password: string): Promise<User | null> {
        const user = await this.userService.getUser(username);
        if (user !== null && user.password === password) {
            return user;
        }
        return null;
    }
}
