import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AccountService } from '@app/services/account/account.service';
import { catchError } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class InterceptorService implements HttpInterceptor {
    constructor(private accountService: AccountService) {}
    intercept(req: HttpRequest<unknown>, next: HttpHandler) {
        const token = localStorage.getItem('token');
        // eslint-disable-next-line no-console
        console.log('InterceptorService called');
        if (token != null) {
            const tokenizedReq = req.clone({
                headers: req.headers.set('Authorization', `Bearer ${token}`),
            });
            // eslint-disable-next-line no-console
            console.log('InterceptorService tokenizedReq', tokenizedReq);
            return next.handle(tokenizedReq);
        }
        return next.handle(req).pipe(
            catchError((err: HttpErrorResponse) => {
                if (err) {
                    this.accountService.logOut();
                }
                throw new Error(err.message);
            }),
        );
    }
}
