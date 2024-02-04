import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from './authentication.service';
import { SinonStubbedInstance } from 'sinon';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@app/services/user/user.service';

describe('AuthenticationService', () => {
    let service: AuthenticationService;
    let userServiceSpy: SinonStubbedInstance<UserService>;
    let jwtServiceSpy: SinonStubbedInstance<JwtService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AuthenticationService, { provide: UserService, useValue: userServiceSpy }, { provide: JwtService, useValue: jwtServiceSpy }],
        }).compile();

        service = module.get<AuthenticationService>(AuthenticationService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
