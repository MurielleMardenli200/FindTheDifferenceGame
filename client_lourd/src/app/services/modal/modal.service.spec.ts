/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { TestBed } from '@angular/core/testing';

import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ActionModalComponent, ActionModalData } from '@app/components/action-modal/action-modal.component';
import { ConfirmModalComponent } from '@app/components/confirm-modal/confirm-modal.component';
import { HistoryModalComponent } from '@app/components/history-modal/history-modal.component';
import { LoadingModalComponent } from '@app/components/loading-modal/loading-modal.component';
import { GameMode } from '@common/game-mode';
import { History } from '@common/model/history';
import { Subject } from 'rxjs';
import { ActionModalRef, ModalService } from './modal.service';

import SpyObj = jasmine.SpyObj;

describe('ModalService', () => {
    let service: ModalService;
    let modalSpy: SpyObj<MatDialog>;
    let matDialogRefSpy: SpyObj<MatDialogRef<unknown>>;
    let modalSubject: Subject<unknown>;
    let routerSpy: SpyObj<Router>;

    beforeEach(() => {
        modalSubject = new Subject();

        matDialogRefSpy = jasmine.createSpyObj(MatDialogRef, ['open', 'close', 'afterClosed']);
        matDialogRefSpy.afterClosed.and.returnValue(modalSubject.asObservable());

        modalSpy = jasmine.createSpyObj(MatDialog, ['open']);
        modalSpy.open.and.returnValue(matDialogRefSpy);

        routerSpy = jasmine.createSpyObj(Router, ['navigate']);

        TestBed.configureTestingModule({
            providers: [
                { provide: MatDialog, useValue: modalSpy },
                { provide: Router, useValue: routerSpy },
            ],
        });
        service = TestBed.inject(ModalService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('createLoadingModal should open a new LoadingModal', () => {
        const disableClose = false;

        service.createLoadingModal(disableClose);

        expect(modalSpy.open).toHaveBeenCalledOnceWith(LoadingModalComponent, { disableClose });
    });

    it('createConfirmModal should open a new ConfirmModalComponent', async () => {
        const message = 'Hello';
        const modalResult = true;

        const returnPromise = service.createConfirmModal(message);

        modalSubject.next(modalResult);

        expect(await returnPromise).toEqual(modalResult);
        expect(modalSpy.open).toHaveBeenCalledOnceWith(ConfirmModalComponent, { data: { confirmMessage: message } });
    });

    it('createActionModal should open a new ActionModal', () => {
        const data: ActionModalData = {
            title: 'Test',
            message: 'A nice message',
            actions: [],
        };
        const disableClose = false;

        service.createActionModal(data, disableClose);

        expect(modalSpy.open).toHaveBeenCalledWith(ActionModalComponent, { data, disableClose });
    });

    it('createInformationModal should open an ActionModal with the close action', async () => {
        const message = 'Very message';
        const closeMessage = 'Such close message';
        const modalData = { title: 'Such title', message, actions: [{ label: closeMessage, close: true }] };
        const modalResult = 0;

        const returnPromise = service.createInformationModal(modalData.title, modalData.message, closeMessage);

        modalSubject.next(modalResult);

        expect(await returnPromise).toEqual(modalResult);
        expect(modalSpy.open).toHaveBeenCalledWith(ActionModalComponent, { data: modalData, disableClose: true });
    });

    it('createInformationModal should open an ActionModal with the close action default label', async () => {
        const message = 'Very message';
        const closeMessage = 'OK';
        const modalData = { title: 'Such title', message, actions: [{ label: closeMessage, close: true }] };
        const modalResult = 0;

        const returnPromise = service.createInformationModal(modalData.title, modalData.message);

        modalSubject.next(modalResult);

        expect(await returnPromise).toEqual(modalResult);
        expect(modalSpy.open).toHaveBeenCalledWith(ActionModalComponent, { data: modalData, disableClose: true });
    });

    it('createEndGameModal should open an ActionModal with the home action', async () => {
        const replayCallbackSpy = jasmine.createSpy();
        spyOn(service, 'createActionModal').and.callFake((modalData) => {
            expect(modalData.message).toEqual('hello');
            modalData.actions.forEach((action) => action.callback!());
            return {} as ActionModalRef;
        });

        service.createEndGameModal('hello', replayCallbackSpy);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
        expect(replayCallbackSpy).toHaveBeenCalled();
    });

    it('createHistoryModal should open a new HistoryModal', () => {
        const data: History[] = [
            {
                gameStart: Date.now(),
                gameTime: 5,
                gameMode: GameMode.ClassicSolo,
                players: ['player'],
            },
            {
                gameStart: Date.now(),
                gameTime: 5,
                gameMode: GameMode.ClassicOneVersusOne,
                players: ['player'],
                isWinner: 0,
                hasAbandonned: 1,
            },
        ];

        service.createHistoryModal(data);

        expect(modalSpy.open).toHaveBeenCalledWith(HistoryModalComponent, { data });
    });
});
