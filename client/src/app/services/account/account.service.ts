import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { HttpClient } from '@angular/common/http';
import { Injectable, WritableSignal, signal } from '@angular/core';
import { Router } from '@angular/router';
import { UserInfo } from '@app/interfaces/user-info';
import { LoginResultDto } from '@common/model/dto/login-result.dto';
import { environment } from 'src/environments/environment';
@Injectable({
    providedIn: 'root',
})
export class AccountService {
    user: UserInfo | SocialUser | undefined;
    isLoggedIn: WritableSignal<boolean> = signal(false);
    private readonly baseUrl: string = environment.serverUrl;
    constructor(private readonly http: HttpClient, private socialAuthService: SocialAuthService, private router: Router) {
        this.socialAuthService.authState.subscribe((user) => {
            this.user = user;
        });
    }

    // TODO: Complete login in server side
    logInAccount(info: UserInfo) {
        this.http.post<LoginResultDto>(`${this.baseUrl}/auth/login`, info).subscribe((response: LoginResultDto) => {
            localStorage.setItem('token', response.token);
            this.isLoggedIn.set(true);
            this.router.navigate(['/home']);
        });
    }

    // TODO: Complete registration in server side
    registerAccount(info: UserInfo) {
        return this.http.post(`${this.baseUrl}/auth/register`, info);
    }
}
