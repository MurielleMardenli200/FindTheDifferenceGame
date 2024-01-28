import { JWT_SECRET } from '@app/constants/jwt.constants';
import { AuthenticationService } from '@app/services/authentication/authentication.service';
import { JwtPayload } from '@common/jwt-payload';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private authenticationService: AuthenticationService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreEpiration: false,
            secretOrKey: JWT_SECRET,
        });
    }

    async validate(payload: JwtPayload) {
        return { userId: payload.sub, username: payload.username };
    }
}
