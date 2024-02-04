import { AuthenticationService } from '@app/services/authentication/authentication.service';
import { CommunicationProtocol } from '@common/model/communication-protocole';
import { TokenType } from '@common/model/dto/jwt-tokens.dto';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class SocketAuthGuard implements CanActivate {
    constructor(private authenticationService: AuthenticationService) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const token = context.switchToWs().getClient().handshake.query.token;
        const username = context.switchToWs().getClient().handshake.query.username;
        return await this.authenticationService.validateJwtToken(username, token, TokenType.REFRESH, CommunicationProtocol.WEBSOCKET);
    }
}
