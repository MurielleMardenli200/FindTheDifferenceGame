import { HttpClient } from '@angular/common/http';
import { Injectable, WritableSignal, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LoginDto } from '@common/model/dto/login.dto';
import { UserInfo } from '@app/interfaces/user-info';
import { JwtTokensDto } from '@common/model/dto/jwt-tokens.dto';
import { environment } from 'src/environments/environment';
@Injectable({
    providedIn: 'root',
})
export class AccountService {
    user: UserInfo | undefined;
    isLoggedIn: WritableSignal<boolean> = signal(false);
    private readonly baseUrl: string = environment.serverUrl;
    constructor(private readonly http: HttpClient, private router: Router) {
        if (localStorage.getItem('token') != null) {
            this.isLoggedIn.set(true);
        }
    }

    logInAccount(info: LoginDto) {
        this.user = { username: info.username, password: info.password };
        this.http.post<JwtTokensDto>(`${this.baseUrl}/auth/login`, info).subscribe((response: JwtTokensDto) => {
            localStorage.setItem('access-token', response.accessToken);
            localStorage.setItem('refresh-token', response.refreshToken);
            this.isLoggedIn.set(true);
            this.router.navigate(['/home']);
        });
    }

    logOut() {
        localStorage.removeItem('token');
        this.isLoggedIn.set(false);
        this.router.navigate(['/login']);
    }

    refreshToken() {
        return this.http.post<JwtTokensDto>(`${this.baseUrl}/auth/refresh`, null);
    }
    // Commented because I am not yet to the registration part of the project
    // registerAccount(info: UserInfo) {
    //     return this.http.post(`${this.baseUrl}/auth/register`, info);
}
