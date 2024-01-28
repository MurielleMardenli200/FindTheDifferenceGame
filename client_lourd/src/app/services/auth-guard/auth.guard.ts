/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

export const authGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> => {
    const authService: SocialAuthService = inject(SocialAuthService);
    const router: Router = inject(Router);

    return new Observable<boolean | UrlTree>((observer) => {
        authService.authState.subscribe((user: SocialUser | null) => {
            if (user) {
                observer.next(true);
            } else {
                observer.next(router.createUrlTree(['/login']));
            }
            observer.complete();
        });
    });
};
