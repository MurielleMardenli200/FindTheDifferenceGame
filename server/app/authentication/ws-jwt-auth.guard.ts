import { AuthenticationService } from '@app/services/authentication/authentication.service';
import { CommunicationProtocol } from '@common/model/communication-protocole';
import { TokenType } from '@common/model/dto/jwt-tokens.dto';
import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class SocketAuthGuard {
    constructor(private authenticationService: AuthenticationService) {}

    async verifyHandshake(socket: Socket): Promise<boolean> {
        const token = socket.handshake.query.token as string;
        const username = socket.handshake.query.username as string;

        if (token === undefined || username === undefined) {
            throw new WsException('No username given');
        }
        const res = await this.authenticationService.validateJwtToken(username, token, TokenType.REFRESH, CommunicationProtocol.WEBSOCKET);
        if (res) {
            return true;
        } else {
            throw new WsException('YOU SUCK');
        }
    }
}
