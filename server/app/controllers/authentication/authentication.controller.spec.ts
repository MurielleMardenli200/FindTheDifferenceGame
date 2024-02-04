import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from '@app/services/authentication/authentication.service';
import { createStubInstance } from 'sinon';

describe('AuthenticationController', () => {
    let controller: AuthenticationController;
    let authenticationService: AuthenticationService;

    beforeEach(async () => {
        authenticationService = createStubInstance(AuthenticationService);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthenticationController],
            providers: [
                {
                    provide: AuthenticationService,
                    useValue: authenticationService,
                },
            ],
        }).compile();

        controller = module.get<AuthenticationController>(AuthenticationController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
