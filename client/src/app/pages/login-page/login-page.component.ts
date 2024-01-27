import { Component } from '@angular/core';
import { TEAM_MEMBERS } from '@app/constants/initial-view-constants';

@Component({
    selector: 'app-login-page',
    templateUrl: './login-page.component.html',
    styleUrl: './login-page.component.scss',
})
export class LoginPageComponent {
    getTeamMembers() {
        return TEAM_MEMBERS;
    }
}
