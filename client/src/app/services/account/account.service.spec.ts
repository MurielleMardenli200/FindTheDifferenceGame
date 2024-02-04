/* eslint-disable @typescript-eslint/no-empty-function */
import { TestBed } from '@angular/core/testing';

import { AccountService } from './account.service';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';

describe('AccountService', () => {
    let service: AccountService;
    let httpMock: HttpTestingController;
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(AccountService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // it('getAllGames should return all games', () => {
    //     const info: UserInfo = { username: 'username', password: 'password' };
    //     service.logInAccount(info);
    //     const req = httpMock.expectOne(`${baseUrl}/auth/login`);
    //     expect(req.request.method).toEqual('POST');
    //     req.flush(info);
    // });
});
