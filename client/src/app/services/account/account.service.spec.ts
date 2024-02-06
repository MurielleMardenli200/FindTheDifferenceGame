/* eslint-disable @typescript-eslint/no-empty-function */
import { TestBed } from '@angular/core/testing';
import { AccountService } from './account.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserInfo } from '@app/interfaces/user-info';
import { SocialAuthService } from '@abacritt/angularx-social-login';
import SpyObj = jasmine.SpyObj;
import { TokenService } from '@app/services/token/token.service';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

describe('AccountService', () => {
    let service: AccountService;
    let httpMock: HttpTestingController;
    let socialAuthServiceSpy: SpyObj<SocialAuthService>;
    let tokenServiceSpy: SpyObj<TokenService>;
    let routerSpy: SpyObj<Router>;
    let baseUrl: string;

    beforeEach(() => {
        tokenServiceSpy = jasmine.createSpyObj('TokenService', ['setAccessToken', 'setRefreshToken']);
        socialAuthServiceSpy = jasmine.createSpyObj('SocialAuthService', ['authState', 'verify']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([{}])],
            providers: [
                { provide: SocialAuthService, useValue: socialAuthServiceSpy },
                { provide: TokenService, useValue: tokenServiceSpy },
                { provide: Router, useValue: routerSpy },
            ],
        });

        Object.defineProperty(socialAuthServiceSpy, 'authState', { value: of({}) });
        service = TestBed.inject(AccountService);
        httpMock = TestBed.inject(HttpTestingController);
        baseUrl = service['baseUrl'];
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getAllGames should return all games', () => {
        const info: UserInfo = { username: 'username', password: 'password' };
        service.logInAccount(info);
        const req = httpMock.expectOne(`${baseUrl}/auth/login`);
        expect(req.request.method).toEqual('POST');
        req.flush(info);
    });
});
