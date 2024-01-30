import { Component } from '@angular/core';
<<<<<<< HEAD
<<<<<<< HEAD
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserInfo } from '@app/interfaces/user-info';
import { AccountService } from '@app/services/account/account.service';
import { noWhiteSpaceValidator } from '@app/validators/no-whitespace/no-white-space';
import { passwordMatchValidator, passwordValidator } from '@app/validators/user-form-validator/user-form-validator';

@Component({
    selector: 'app-create-account-page',
    standalone: false,
=======
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
=======
import { FormBuilder, Validators } from '@angular/forms';
>>>>>>> 10a4af1 (first rebase)
import { Router } from '@angular/router';
import { UserInfo } from '@app/interfaces/user-info';
import { AccountService } from '@app/services/account/account.service';
import { noWhiteSpaceValidator } from '@app/validators/no-whitespace/no-white-space';
import { passwordMatchValidator, passwordValidator } from '@app/validators/user-form-validator/user-form-validator';

@Component({
    selector: 'app-create-account-page',
<<<<<<< HEAD
    standalone: true,
    imports: [],
>>>>>>> dece8f7 (MM: create account page created and view needs to be modified)
=======
    standalone: false,
>>>>>>> 10a4af1 (first rebase)
    templateUrl: './create-account-page.component.html',
    styleUrl: './create-account-page.component.scss',
})
export class CreateAccountPageComponent {
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 10a4af1 (first rebase)
    createAccountForm = this.formBuilder.group(
        {
            username: ['', Validators.compose([Validators.required, noWhiteSpaceValidator])],
            email: ['', Validators.compose([Validators.required, noWhiteSpaceValidator, Validators.email])],
            password: ['', Validators.compose([Validators.required, noWhiteSpaceValidator, passwordValidator])],
            passwordConfirmation: [''],
        },
        { validators: passwordMatchValidator },
    );
<<<<<<< HEAD

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
=======
    logInForm: FormGroup = this.formBuilder.group({
        username: ['', Validators.required],
        password: ['', Validators.required],
    });
=======
>>>>>>> 10a4af1 (first rebase)

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
<<<<<<< HEAD
            this.logInForm.reset();
>>>>>>> dece8f7 (MM: create account page created and view needs to be modified)
=======
            this.createAccountForm.reset();
>>>>>>> 10a4af1 (first rebase)
        }
    }
}
