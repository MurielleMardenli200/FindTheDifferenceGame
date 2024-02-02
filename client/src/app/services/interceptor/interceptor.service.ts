import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AccountService } from '@app/services/account/account.service';
import { catchError } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class InterceptorService implements HttpInterceptor {
    constructor(private accountService: AccountService) { }
    intercept(req: HttpRequest<unknown>, next: HttpHandler) {
        const token = localStorage.getItem('access-token');
        // eslint-disable-next-line no-console
        console.log('InterceptorService called');
        if (token != null && this.accountService.user != null) {
            const tokenizedReq = req.clone({
                headers: req.headers.set('Authorization', `Bearer ${token}`).set('username', `${this.accountService.user.username}`),
            });
            return next.handle(tokenizedReq);
        }
        return next.handle(req).pipe(
            catchError((err: HttpErrorResponse) => {
                if (err.status === HttpStatusCode.Unauthorized || err.status === HttpStatusCode.Forbidden) {
                    this.refreshTokens(req, next);
                }
                throw new Error(err.message);
            }),
        );
    }

    refreshTokens(req: HttpRequest<unknown>, next: HttpHandler) {
        this.accountService.refreshToken().subscribe((response) => {
            localStorage.setItem('token', response.accessToken);
            const tokenizedReq = req.clone({
                headers: req.headers.set('Authorization', `Bearer ${response.accessToken}`).set('username', `${this.accountService.user?.username}`),
            });
            return next.handle(tokenizedReq).pipe(
                catchError((err: HttpErrorResponse) => {
                    this.accountService.logOut();
                    throw new Error(err.message);
                }),
            );
        });
    }
}
