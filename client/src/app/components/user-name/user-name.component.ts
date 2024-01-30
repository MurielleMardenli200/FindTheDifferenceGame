import { Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MAX_USERNAME_LENGTH, MIN_USERNAME_LENGTH } from '@app/constants';
import { ButtonState } from '@app/enums/button-state';
import { noWhiteSpaceValidator } from '@app/validators/no-whitespace/no-white-space';

@Component({
    selector: 'app-user-name',
    templateUrl: './user-name.component.html',
    styleUrls: ['./user-name.component.scss'],
})
export class UserNameComponent {
    username: string = '';
    userNameFormControl = new FormControl('', [
        Validators.required,
        Validators.minLength(MIN_USERNAME_LENGTH),
        Validators.maxLength(MAX_USERNAME_LENGTH),
        noWhiteSpaceValidator,
    ]);

    constructor(private modal: MatDialogRef<UserNameComponent>, @Inject(MAT_DIALOG_DATA) public data: { state: ButtonState }) {}

    async playGame(event: Event) {
        event.preventDefault();
        if (!this.username) return;
        this.modal.close(this.username);
    }
}
