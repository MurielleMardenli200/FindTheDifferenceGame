import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoginDto } from '@common/model/dto/login.dto';
import { UserInfo } from '@app/interfaces/user-info';
import { JwtTokensDto } from '@common/model/dto/jwt-tokens.dto';
import { environment } from 'src/environments/environment';
import { RefreshDto } from '@common/model/dto/refresh.dto';
import { Observable } from 'rxjs';
import { TokenService } from '@app/services/token/token.service';
import { REFRESH_TOKEN_KEY } from '@app/services/token/token.constants';

@Injectable({
    providedIn: 'root',
})
export class AccountService {
    user: UserInfo | undefined;

    private readonly baseUrl: string = environment.serverUrl;
    // eslint-disable-next-line max-params
    constructor(
        private readonly http: HttpClient,
        private router: Router,
        private tokenService: TokenService,
        private socialAuthService: SocialAuthService,
    ) {
        this.socialAuthService.authState.subscribe((user: SocialUser) => {
            this.user = {
                username: user.email,
                password: user.id,
                email: user.email,
            };
        });
    }

    isLoggedIn(): boolean {
        return localStorage.getItem(REFRESH_TOKEN_KEY) !== null;
    }

    logInAccount(info: LoginDto) {
        this.user = { username: info.username, password: info.password };
        this.http.post<JwtTokensDto>(`${this.baseUrl}/auth/login`, info).subscribe({
            next: (response: JwtTokensDto) => {
                this.tokenService.setAccessToken(response.accessToken);
                this.tokenService.setRefreshToken(response.refreshToken);
                this.router.navigate(['/home']);
            },
            error: (error) => {
                throw new Error(error.error.message || 'Unknown error');
            },
        });
    }

    logOut() {
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        this.http.post(`${this.baseUrl}/auth/logout`, { username: this.user?.username });
        this.router.navigate(['/login']);
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

    registerAccount(info: UserInfo) {
        return this.http.post(`${this.baseUrl}/auth/signup`, info).subscribe(() => {
            this.router.navigate(['/login']);
        });
    }
}
