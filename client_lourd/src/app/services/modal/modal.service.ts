import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ActionModalComponent, ActionModalData } from '@app/components/action-modal/action-modal.component';
import { ConfirmModalComponent } from '@app/components/confirm-modal/confirm-modal.component';
import { HistoryModalComponent } from '@app/components/history-modal/history-modal.component';
import { LoadingModalComponent } from '@app/components/loading-modal/loading-modal.component';
import { History } from '@common/model/history';

export type LoadingModalRef = MatDialogRef<LoadingModalComponent>;
export type ActionModalRef = MatDialogRef<ActionModalComponent>;

@Injectable({
    providedIn: 'root',
})
export class ModalService {
    constructor(private modal: MatDialog, private router: Router) {}

    createLoadingModal(disableClose: boolean = true): LoadingModalRef {
        return this.modal.open(LoadingModalComponent, { disableClose });
    }

    async createConfirmModal(message: string): Promise<boolean> {
        return await this.awaitModalClose(this.modal.open(ConfirmModalComponent, { data: { confirmMessage: message } }));
    }

    createActionModal(data: ActionModalData, disableClose: boolean = true): ActionModalRef {
        return this.modal.open(ActionModalComponent, { data, disableClose });
    }

    async createInformationModal(title: string, message: string, closeMessage: string = 'OK'): Promise<number | undefined> {
        return await this.awaitModalClose(this.createActionModal({ title, message, actions: [{ label: closeMessage, close: true }] }));
    }

    createEndGameModal(message: string, replayCallback?: () => void): ActionModalRef {
        const modalData: ActionModalData = {
            title: 'La partie est terminée',
            message,
            actions: [
                {
                    label: 'Accueil',
                    close: true,
                    callback: async () => this.router.navigate(['/home']),
                },
            ],
        };
        if (replayCallback) {
            modalData.actions.push({
                label: 'Revoir la partie',
                close: true,
                callback: () => replayCallback(),
            });
        }
        return this.createActionModal(modalData);
    }

    createHistoryModal(history: History[]) {
        this.modal.open(HistoryModalComponent, { data: history });
    }

    private async awaitModalClose<T, U>(modalRef: MatDialogRef<T>): Promise<U> {
        return new Promise<U>((resolve) => {
            modalRef.afterClosed().subscribe((result) => resolve(result));
        });
    }
}
