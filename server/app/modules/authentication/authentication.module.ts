import { AuthenticationController } from '@app/controllers/authentication/authentication.controller';
import { AuthenticationService } from '@app/services/authentication/authentication.service';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '@app/modules/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JWT_SECRET } from '@app/constants/jwt.constants';
import { JwtStrategy } from '@app/controllers/authentication/jwt.strategy';

@Module({
    // FIXME: Use a real secret
    imports: [PassportModule, UsersModule, JwtModule.register({ secret: JWT_SECRET, signOptions: { expiresIn: '60s' } })],
    controllers: [AuthenticationController],
    providers: [AuthenticationService, JwtStrategy],
    exports: [AuthenticationService],
})
export class AuthenticationModule {}
