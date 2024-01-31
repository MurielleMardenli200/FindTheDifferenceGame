import { AuthenticationController } from '@app/controllers/authentication/authentication.controller';
import { UsersModule } from '@app/modules/users/users.module';
import { AuthenticationService } from '@app/services/authentication/authentication.service';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

@Module({
    imports: [
        PassportModule.register({ property: 'payload' }),
        UsersModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '1h' },
        }),
    ],
    controllers: [AuthenticationController],
    providers: [AuthenticationService],
    exports: [AuthenticationService],
})
export class AuthenticationModule {}
