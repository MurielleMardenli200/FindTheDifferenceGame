import { AuthenticationService } from '@app/services/authentication/authentication.service';
import { TokenType } from '@common/model/dto/jwt-tokens.dto';
import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class RefreshAuthGuard implements CanActivate {
    constructor(private authenticationService: AuthenticationService) { }
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        if (!request.headers.authorization) {
            throw new HttpException('No token given', HttpStatus.UNAUTHORIZED);
        }
        if (!request.headers.username) {
            throw new HttpException('No username given', HttpStatus.BAD_REQUEST);
        }
        const token = request.headers.authorization.split(' ')[1];
        const username = request.headers.username;

        return this.authenticationService.validateJwtToken(username, token, TokenType.REFRESH);
    }
}
