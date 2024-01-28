/* eslint-disable @typescript-eslint/no-empty-function */
import { TestBed } from '@angular/core/testing';

import { AccountService } from './account.service';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { UserInfo } from '@app/interfaces/user-info';

describe('AccountService', () => {
    let service: AccountService;
    let httpMock: HttpTestingController;
    let baseUrl: string;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
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
        service.logInAccount(info).subscribe(() => {});
        const req = httpMock.expectOne(`${baseUrl}/auth/login`);
        expect(req.request.method).toEqual('POST');
        req.flush(info);
    });
});
