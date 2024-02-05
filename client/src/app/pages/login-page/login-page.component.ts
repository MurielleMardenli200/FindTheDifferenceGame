/* eslint-disable max-params */
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { TEAM_MEMBERS } from '@app/constants/initial-view-constants';
import { UserInfo } from '@app/interfaces/user-info';
import { AccountService } from '@app/services/account/account.service';

@Component({
    selector: 'app-login-page',
    templateUrl: './login-page.component.html',
    styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent implements OnInit {
    logInForm = this.formBuilder.group({
        username: ['', Validators.required],
        password: ['', Validators.required],
    });
    constructor(private formBuilder: FormBuilder, private accountService: AccountService, private socialAuthService: SocialAuthService) {}

    ngOnInit() {
        this.socialAuthService.authState.subscribe((user) => {
            const userInfo: UserInfo = { username: user.name, password: user.id };
            this.accountService.logInAccount(userInfo);
        });
    }

    getTeamMembers() {
        return TEAM_MEMBERS;
    }

    onSubmit() {
        if (this.logInForm.valid) {
            const userInfo = this.logInForm.value as UserInfo;
            this.accountService.logInAccount(userInfo);
            this.logInForm.reset();
        }
    }
}
