import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class InterceptorService implements HttpInterceptor {
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
        return next.handle(req);
    }
}
