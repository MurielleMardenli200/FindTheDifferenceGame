import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserInfo } from '@app/interfaces/user-info';
import { AccountService } from '@app/services/account/account.service';
import { noWhiteSpaceValidator } from '@app/validators/no-whitespace/no-white-space';
import { passwordMatchValidator, passwordValidator } from '@app/validators/user-form-validator/user-form-validator';

@Component({
    selector: 'app-create-account-page',
    standalone: false,
    templateUrl: './create-account-page.component.html',
    styleUrl: './create-account-page.component.scss',
})
export class CreateAccountPageComponent {
    createAccountForm = this.formBuilder.group(
        {
            username: ['', Validators.compose([Validators.required, noWhiteSpaceValidator])],
            email: ['', Validators.compose([Validators.required, noWhiteSpaceValidator, Validators.email])],
            password: ['', Validators.compose([Validators.required, noWhiteSpaceValidator, passwordValidator])],
            passwordConfirmation: [''],
        },
        { validators: passwordMatchValidator },
    );

    constructor(private router: Router, private formBuilder: FormBuilder, private accountService: AccountService) {}

    showPasswordError(): string {
        return 'Veuillez entrer une valeur avec au moins\n- 8 caractères\n- 1 majuscule\n- 1 nombre';
    }

    onSubmit() {
        if (this.createAccountForm.valid) {
            const userInfo = this.createAccountForm.value as UserInfo;
            this.accountService.registerAccount(userInfo).subscribe(() => {
                this.router.navigate(['/login']);
            });
            this.createAccountForm.reset();
        }
    }
}
