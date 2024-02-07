import { HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AccountService } from '@app/services/account/account.service';
import { BehaviorSubject, from, catchError, concatMap } from 'rxjs';
import { TokenService } from '@app/services/token/token.service';
import { TokenExpiredError } from '@app/services/token/token-expired-error';
import { Tokens } from '@common/tokens';

@Injectable({
    providedIn: 'root',
})
export class InterceptorService implements HttpInterceptor {
    isRefreshing = false;
    refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

    constructor(private accountService: AccountService, private tokenService: TokenService) {}
    async getAccessToken(): Promise<Tokens> {
        try {
            return this.tokenService.getTokens();
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                await this.accountService.refreshToken();
                return this.tokenService.getTokens();
            }
            throw new Error('Unknown error');
        }
    }

    async getHeaders(): Promise<HttpHeaders> {
        const headers = new HttpHeaders();
        const tokens: Tokens = await this.getAccessToken();
        const username = this.tokenService.getUsername();
        if (username === undefined) {
            throw new Error('No username');
        }

        return headers.append('Authorization', `Bearer ${tokens.accessToken}`).append('username', username);
    }

    async addAuthToken(request: HttpRequest<unknown>): Promise<HttpRequest<unknown>> {
        const headers: HttpHeaders = await this.getHeaders();
        return request.clone({ headers });
    }

    intercept(request: HttpRequest<unknown>, next: HttpHandler) {
        if (request.url.includes('auth')) {
            if (this.accountService.user !== undefined) {
                const requestWithUsername = request.clone({ headers: request.headers.append('username', this.accountService.user?.username) });
                return next.handle(requestWithUsername);
            }
            this.accountService.logOut();
            throw new Error('Interceptor No user');
        }

        return from(this.addAuthToken(request)).pipe(
            concatMap((tokenizedRequest: HttpRequest<unknown>) => {
                return next.handle(tokenizedRequest).pipe(
                    catchError((error) => {
                        this.accountService.logOut();
                        throw new Error(error.message);
                    }),
                );
            }),
        );
    }
}
