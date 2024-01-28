import { JwtStrategy } from '@app/authentication/jwt.strategy';
import { JWT_SECRET } from '@app/constants/jwt.constants';
import { AuthenticationController } from '@app/controllers/authentication/authentication.controller';
import { UsersModule } from '@app/modules/users/users.module';
import { AuthenticationService } from '@app/services/authentication/authentication.service';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

@Module({
    // FIXME: Use a real secret
    imports: [PassportModule, UsersModule, JwtModule.register({ secret: JWT_SECRET, signOptions: { expiresIn: '60s' } })],
    controllers: [AuthenticationController],
    providers: [AuthenticationService, JwtStrategy],
    exports: [AuthenticationService],
})
export class AuthenticationModule {}
