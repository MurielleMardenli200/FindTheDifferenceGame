import { AuthenticationService } from '@app/services/authentication/authentication.service';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class SocketAuthGuard implements CanActivate {
    constructor(private authenticationService: AuthenticationService) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const token = context.switchToWs().getClient().handshake.auth.token;

        return await this.authenticationService.validateJwtToken(token);
    }
}
