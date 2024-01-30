/* eslint-disable max-params */
import { SocialUser } from '@abacritt/angularx-social-login';
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { TEAM_MEMBERS } from '@app/constants/initial-view-constants';
import { UserInfo } from '@app/interfaces/user-info';
import { AccountService } from '@app/services/account/account.service';

@Component({
    selector: 'app-login-page',
    templateUrl: './login-page.component.html',
    styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent {
    user: SocialUser | undefined;
    logInForm = this.formBuilder.group({
        username: ['', Validators.required],
        password: ['', Validators.required],
    });

    constructor(private formBuilder: FormBuilder, private accountService: AccountService) {}

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
