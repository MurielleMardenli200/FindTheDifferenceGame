import { JWT_SECRET } from '@app/constants/jwt.constants';
import { AuthenticationService } from '@app/services/authentication/authentication.service';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '@common/tokens';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private authenticationService: AuthenticationService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: JWT_SECRET,
        });
    }

    async validate(payload: JwtPayload) {
        return { username: payload.username };
    }
}
