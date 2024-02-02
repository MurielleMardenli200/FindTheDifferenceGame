import { AuthenticationService } from '@app/services/authentication/authentication.service';
import { TokenType } from '@common/model/dto/jwt-tokens.dto';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class SocketAuthGuard implements CanActivate {
    constructor(private authenticationService: AuthenticationService) { }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const token = context.switchToWs().getClient().handshake.auth.token;
        const username = context.switchToWs().getClient().handshake.auth.username;
        return await this.authenticationService.validateJwtToken(username, token, TokenType.ACCESS);
    }
}
