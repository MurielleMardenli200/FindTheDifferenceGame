import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserInfo } from '@app/interfaces/user-info';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class AccountService {
    private readonly baseUrl: string = environment.serverUrl;

    constructor(private readonly http: HttpClient) {}

    // TODO: Complete login in server side
    logInAccount(info: UserInfo) {
        return this.http.post(`${this.baseUrl}/auth/login`, info);
    }

    // TODO: Complete registration in server side
    registerAccount(info: UserInfo) {
        return this.http.post(`${this.baseUrl}/auth/register`, info);
    }
}
