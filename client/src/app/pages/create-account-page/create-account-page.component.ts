import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserInfo } from '@app/interfaces/user-info';
import { AccountService } from '@app/services/account/account.service';

@Component({
    selector: 'app-create-account-page',
    standalone: true,
    imports: [],
    templateUrl: './create-account-page.component.html',
    styleUrl: './create-account-page.component.scss',
})
export class CreateAccountPageComponent {
    logInForm: FormGroup = this.formBuilder.group({
        username: ['', Validators.required],
        password: ['', Validators.required],
    });

    constructor(private router: Router, private formBuilder: FormBuilder, private accountService: AccountService) {}

    onSubmit() {
        if (this.logInForm.valid) {
            const userInfo = this.logInForm.value as UserInfo;
            this.accountService.registerAccount(userInfo).subscribe(() => {
                this.router.navigate(['/login']);
            });
            this.logInForm.reset();
        }
    }
}
