/* eslint-disable max-params */
import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { TEAM_MEMBERS } from '@app/constants/initial-view-constants';
import { UserInfo } from '@app/interfaces/user-info';
import { AccountService } from '@app/services/account/account.service';

@Component({
    selector: 'app-login-page',
    templateUrl: './login-page.component.html',
    styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent implements OnInit {
    user: SocialUser | undefined;
    loggedIn: boolean | undefined;
    logInForm = this.formBuilder.group({
        username: ['', Validators.required],
        password: ['', Validators.required],
    });

    constructor(
        private authService: SocialAuthService,
        private router: Router,
        private formBuilder: FormBuilder,
        private accountService: AccountService,
    ) {}

    ngOnInit() {
        this.authService.authState.subscribe((user) => {
            this.user = user;
            this.loggedIn = user != null;
            if (this.loggedIn) this.router.navigate(['/home']);
            else this.router.navigate(['/login']);
        });
    }

    getTeamMembers() {
        return TEAM_MEMBERS;
    }

    onSubmit() {
        if (this.logInForm.valid) {
            const userInfo = this.logInForm.value as UserInfo;
            this.accountService.logInAccount(userInfo).subscribe(() => {
                this.router.navigate(['/home']);
            });
            this.logInForm.reset();
        }
    }
}
