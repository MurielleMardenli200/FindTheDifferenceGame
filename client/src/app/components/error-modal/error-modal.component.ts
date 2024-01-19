import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
@Component({
    selector: 'app-error-modal',
    templateUrl: './error-modal.component.html',
    styleUrls: ['./error-modal.component.scss'],
})
export class ErrorModalComponent {
    constructor(private modalRef: MatDialogRef<ErrorModalComponent>, private router: Router) {}

    close() {
        this.router.navigate(['/home']);
        this.modalRef.close();
    }
}
