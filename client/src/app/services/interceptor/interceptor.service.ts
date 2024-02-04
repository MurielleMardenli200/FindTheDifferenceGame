import { HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AccountService } from '@app/services/account/account.service';
import { JwtTokensDto } from '@common/model/dto/jwt-tokens.dto';
import { BehaviorSubject, Observable, catchError, concatMap, map, of, tap } from 'rxjs';
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
    getAccessToken(): Observable<Tokens> {
        try {
            return of(this.tokenService.getTokens());
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                return this.accountService.refreshToken().pipe(
                    tap((response: JwtTokensDto) => {
                        this.tokenService.setAccessToken(response.accessToken);
                        this.tokenService.setRefreshToken(response.refreshToken);
                    }),
                    catchError(() => {
                        this.accountService.logOut();
                        throw new Error("Can't refresh token");
                    }),
                );
            }
            throw new Error('Unknown error');
        }
    }

    getHeaders(): Observable<HttpHeaders> {
        const headers = new HttpHeaders();
        const tokens: Observable<Tokens> = this.getAccessToken();
        const username = this.accountService.user?.username;
        if (username === undefined) {
            throw new Error('No username');
        }

        const fullHeaders = tokens.pipe(
            map((token: Tokens) => {
                return headers.append('Authorization', `Bearer ${token.accessToken}`).append('username', username);
            }),
        );

        return fullHeaders;
    }

    addAuthToken(request: HttpRequest<unknown>): Observable<HttpRequest<unknown>> {
        return this.getHeaders().pipe(
            map((headers: HttpHeaders) => {
                return request.clone({ headers });
            }),
        );
    }

    intercept(request: HttpRequest<unknown>, next: HttpHandler) {
        if (request.url.includes('auth')) {
            if (this.accountService.user !== undefined) {
                const requestWithUsername = request.clone({ headers: request.headers.append('username', this.accountService.user?.username) });     
                return next.handle(requestWithUsername);
            }
            throw new Error('No user');
        }

        return this.addAuthToken(request).pipe(
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
