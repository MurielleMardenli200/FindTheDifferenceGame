import { HttpClient } from '@angular/common/http';
import { Injectable, WritableSignal, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LoginDto } from '@common/model/dto/login.dto';
import { UserInfo } from '@app/interfaces/user-info';
import { JwtTokensDto } from '@common/model/dto/jwt-tokens.dto';
import { environment } from 'src/environments/environment';
import { RefreshDto } from '@common/model/dto/refresh.dto';
import { Observable } from 'rxjs';
import { TokenService } from '@app/services/token/token.service';

@Injectable({
    providedIn: 'root',
})
export class AccountService {
    user: UserInfo | undefined;
    isLoggedIn: WritableSignal<boolean> = signal(false);
    refreshCounter = 0;

    private readonly baseUrl: string = environment.serverUrl;
    // eslint-disable-next-line max-params
    constructor(private readonly http: HttpClient, private router: Router, private tokenService: TokenService) {
        if (localStorage.getItem('refresh-token') != null) {
            this.isLoggedIn.set(true);
        }
    }

    logInAccount(info: LoginDto) {
        this.user = { username: info.username, password: info.password };
        this.http.post<JwtTokensDto>(`${this.baseUrl}/auth/login`, info).subscribe((response: JwtTokensDto) => {
            this.tokenService.setAccessToken(response.accessToken);
            this.tokenService.setRefreshToken(response.refreshToken);
            this.isLoggedIn.set(true);
            this.router.navigate(['/home']);
        });
    }

    logOut() {
        localStorage.removeItem('access-token');
        localStorage.removeItem('refresh-token');
        this.http.post(`${this.baseUrl}/auth/logout`, { username: this.user?.username }).subscribe({
            next: () => {
                this.isLoggedIn.set(false);
                this.router.navigate(['/login']);
            },
        });
    }

    refreshToken(): Observable<JwtTokensDto> {
        const refreshToken = this.tokenService.getRefreshToken();
        if (this.user === undefined || this.user.username === undefined || refreshToken === null) {
            this.logOut();
            throw new Error('No user or refresh token');
        }

        const refreshDto: RefreshDto = {
            username: this.user.username,
            refreshToken,
        };
        return this.http.post<JwtTokensDto>(`${this.baseUrl}/auth/refresh`, refreshDto);
    }

    // Commented because I am not yet to the registration part of the project
    // registerAccount(info: UserInfo) {
    //     return this.http.post(`${this.baseUrl}/auth/register`, info);
}
