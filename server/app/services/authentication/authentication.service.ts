import { User } from '@app/model/database/user.entity';
import { UserDto } from '@app/model/dto/user-dto';
import { UserService } from '@app/services/user/user.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtTokensDto, TokenType } from '@common/model/dto/jwt-tokens.dto';
import { CommunicationProtocol } from '@common/model/communication-protocole';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class AuthenticationService {
    private connectedUsers = new Map<string, JwtTokensDto>();

    constructor(private userService: UserService, private jwtService: JwtService) {}

    async logIn(username: string, password: string): Promise<JwtTokensDto> {
        if (this.connectedUsers.has(username)) {
            throw new HttpException('User already connected', HttpStatus.UNAUTHORIZED);
        }

        if (await this.userService.verifyUserAndPasswordValid(username, password)) {
            const tokens = this.generateTokens(username);
            this.connectedUsers.set(username, tokens);
            return tokens;
        }
        throw new HttpException('Incorrect username or password', HttpStatus.BAD_REQUEST);
    }

    async signUp(userDto: UserDto): Promise<User> {
        const user = await this.userService.getUser(userDto.username);
        if (user !== null) {
            throw new HttpException('Username already exists', HttpStatus.CONFLICT);
        }
        return await this.userService.createUser(userDto.username, userDto.password, userDto.email);
    }

    async refreshTokens(username: string, refreshToken: string): Promise<JwtTokensDto> {
        if (username === undefined || (await this.userService.getUser(username)) === null) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        if (!this.connectedUsers.has(username)) {
            throw new HttpException('User not connected', HttpStatus.UNAUTHORIZED);
        }
        const oldTokens = this.getTokens(username);
        if (oldTokens.refreshToken !== refreshToken) {
            throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
        }

        const tokens = this.generateTokens(username);
        this.connectedUsers.set(username, tokens);
        return tokens;
    }

    // eslint-disable-next-line max-params
    async validateJwtToken(username: string, token: string, tokenType: TokenType, communicationProtol: CommunicationProtocol): Promise<boolean> {
        if (!this.connectedUsers.has(username)) {
            throw new HttpException('User not connected', HttpStatus.UNAUTHORIZED);
        }
        await this.jwtService.verifyAsync(token).catch((error: Error) => {
            if (error.message === 'jwt expired') {
                if (communicationProtol === CommunicationProtocol.HTTP) throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
                if (communicationProtol === CommunicationProtocol.WEBSOCKET) throw new WsException('Invalid token');
            }
        });

        const tokens = this.getTokens(username);
        if (tokenType === TokenType.ACCESS) {
            return tokens.accessToken === token;
        } else {
            return tokens.refreshToken === token;
        }
    }

    async logOut(username: string): Promise<void> {
        this.connectedUsers.delete(username);
    }

    generateTokens(username: string): JwtTokensDto {
        const payload = { username };
        const accessToken: string = this.jwtService.sign(payload, { expiresIn: '10s' });
        const refreshToken: string = this.jwtService.sign(payload, { expiresIn: '1h' });
        this.connectedUsers.set(username, { accessToken, refreshToken });
        return { accessToken, refreshToken };
    }

    getTokens(username: string): JwtTokensDto {
        const tokens = this.connectedUsers.get(username);
        if (tokens === undefined) {
            throw new HttpException('User not connected', HttpStatus.UNAUTHORIZED);
        }
        return tokens;
    }
}
