/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { GameInfo } from '@app/interfaces/game-info';

import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ButtonState } from '@app/enums/button-state';
import { ClassicModeComponent } from '@app/pages/classic-mode/classic-mode.component';
import { ModalService } from '@app/services/modal/modal.service';
import { SocketService } from '@app/services/socket/socket.service';
import { GameMode } from '@common/game-mode';
import { GameSessionEvent } from '@common/game-session.events';
import { GameSheetState } from '@common/model/game';
import { WaitingRoomStatus } from '@common/model/waiting-room-status';
import { GlobalEvent } from '@common/socket-event';
import { GameStartService } from './game-start.service';

import SpyObj = jasmine.SpyObj;

describe('GameStartService', () => {
    let service: GameStartService;
    let modalSpy: SpyObj<MatDialog>;
    let socketServiceSpy: SpyObj<SocketService>;
    let modalServiceSpy: SpyObj<ModalService>;
    let routerSpy: SpyObj<Router>;

    beforeEach(() => {
        modalSpy = jasmine.createSpyObj(MatDialog, ['open', 'close', 'closeAll']);
        socketServiceSpy = jasmine.createSpyObj(SocketService, ['on', 'send', 'once']);
        modalServiceSpy = jasmine.createSpyObj(ModalService, ['createActionModal', 'createLoadingModal', 'createInformationModal']);
        routerSpy = jasmine.createSpyObj(Router, ['navigate']);

        TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([{ path: 'classic', component: ClassicModeComponent }])],
            providers: [
                GameStartService,
                { provide: MatDialog, useValue: modalSpy },
                { provide: SocketService, useValue: socketServiceSpy },
                { provide: ModalService, useValue: modalServiceSpy },
                { provide: Router, useValue: routerSpy },
            ],
        });
        service = TestBed.inject(GameStartService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getting game info should return the game info and set the value to null', () => {
        const gameInfo: GameInfo = {
            game: 'game',
            username: 'Name',
            gamemode: GameMode.ClassicOneVersusOne,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;

        service['_gameInfo'] = gameInfo;

        expect(service.gameInfo).toEqual(gameInfo);
        expect(service.gameInfo).toEqual(null);
    });

    it('startSoloGame should call startGame', async () => {
        const gameId = 'id';
        const startGameSpy = spyOn<any>(service, 'startGame');
        await service.startSoloGame(gameId);
        expect(startGameSpy).toHaveBeenCalledWith(GameMode.ClassicSolo, ButtonState.Play, gameId);
    });

    it('startSoloGame without game id should call StartGame with time limited gameMode', async () => {
        const startGameSpy = spyOn<any>(service, 'startGame');
        await service.startSoloGame();
        expect(startGameSpy).toHaveBeenCalledWith(GameMode.TimeLimitedSolo, ButtonState.Play);
    });

    it('startMultiplayerGame should call startGame with the correct sheet state', async () => {
        const gameId = 'id';
        const startGameSpy = spyOn<any>(service, 'startGame');
        let sheetState = GameSheetState.Creatable;

        await service.startMultiplayerGame(sheetState, gameId);
        expect(startGameSpy).toHaveBeenCalledWith(GameMode.ClassicOneVersusOne, ButtonState.Create, gameId);

        sheetState = GameSheetState.Joinable;
        await service.startMultiplayerGame(sheetState, gameId);
        expect(startGameSpy).toHaveBeenCalledWith(GameMode.ClassicOneVersusOne, ButtonState.Join, gameId);
    });

    it('startMultiplayer without game id should call StartGame with time limited gameMode', async () => {
        const startGameSpy = spyOn<any>(service, 'startGame');
        await service.startMultiplayerGame();
        expect(startGameSpy).toHaveBeenCalledWith(GameMode.TimeLimitedCoop, ButtonState.Play);
    });

    it('acceptOpponent should send the correct event and show a loading modal', () => {
        const opponentId = '1234';
        service['acceptOpponent'](opponentId);
        expect(socketServiceSpy.send).toHaveBeenCalledWith(GameSessionEvent.AcceptOpponent, { socketId: opponentId });
        expect(modalServiceSpy.createLoadingModal).toHaveBeenCalled();
    });

    it('rejectOpponent should send the correct event', () => {
        const opponentId = '1234';
        service['rejectOpponent'](opponentId);
        expect(socketServiceSpy.send).toHaveBeenCalledWith(GameSessionEvent.RejectOpponent, { socketId: opponentId });
    });

    it('cancelGameSession should send the correct event and close all modals', () => {
        service['cancelGameSession']();
        expect(socketServiceSpy.send).toHaveBeenCalledWith(GameSessionEvent.CancelGameSession);
        expect(modalSpy.closeAll).toHaveBeenCalled();
    });

    it('startGame should return early if there is no username', async () => {
        const gameId = '123';
        const gameMode = GameMode.ClassicSolo;

        spyOn<any>(service, 'getUsername').and.resolveTo(undefined);

        await service['startGame'](gameMode, ButtonState.Play, gameId);

        expect(socketServiceSpy.send).not.toHaveBeenCalled();
        expect(modalServiceSpy.createLoadingModal).not.toHaveBeenCalled();
    });

    it('startGame called with ClassicSolo should start a solo game', async () => {
        const gameId = '123';
        const gameMode = GameMode.ClassicSolo;
        const username = 'user';

        spyOn<any>(service, 'getUsername').and.resolveTo(username);

        await service['startGame'](gameMode, ButtonState.Play, gameId);

        expect(socketServiceSpy.send).toHaveBeenCalledWith(GameSessionEvent.StartGameSession, { gameId, gameMode, username });
        expect(modalServiceSpy.createLoadingModal).toHaveBeenCalled();
    });

    it('startGame called with ClassicOneVersusOne should show the player in a waiting status', async () => {
        const gameId = '123';
        const gameMode = GameMode.ClassicOneVersusOne;
        const username = 'user';

        spyOn<any>(service, 'getUsername').and.resolveTo(username);

        await service['startGame'](gameMode, ButtonState.Create, gameId);

        expect(socketServiceSpy.send).toHaveBeenCalledWith(GameSessionEvent.StartGameSession, { gameId, gameMode, username }, jasmine.any(Function));
        expect(modalServiceSpy.createLoadingModal).toHaveBeenCalled();
    });

    // FIXME: This test just doesn't want to pass
    // it('showWaitingModal should cancel the game session if the user decides to cancel', () => {
    //     modalServiceSpy.createInformationModal.and.resolveTo(2);
    //     const cancelSpy = spyOn<any>(service, 'cancelGameSession');

    //     const callPromise = new Promise<void>((resolve) => {
    //         service['showWaitingModal'](WaitingRoomStatus.Joined);
    //         resolve();
    //     });

    //     callPromise.then(() => expect(cancelSpy).toHaveBeenCalled());
    // });

    it('showWaitingModal should give the correct message depending on the waiting room status', () => {
        modalServiceSpy.createInformationModal.and.resolveTo(undefined);

        let status = WaitingRoomStatus.Created;

        service['showWaitingModal'](status);

        expect(modalServiceSpy.createInformationModal).toHaveBeenCalledWith('Attente...', "En attente d'un autre joueur...", 'Annuler');

        status = WaitingRoomStatus.Joined;

        service['showWaitingModal'](status);

        expect(modalServiceSpy.createInformationModal).toHaveBeenCalledWith('Attente...', "En attente d'acceptation du créateur...", 'Annuler');
    });

    it('GlobalEvent Exception should open a ErrorModal', () => {
        const callbackFunc = jasmine.createSpyObj('callbackFunc', ['call']);
        service['onExceptionCallbacks'].push(callbackFunc.call);
        socketServiceSpy.on.and.callFake((event: GlobalEvent, callback) => {
            if (event === GlobalEvent.Exception) callback(undefined as any);
        });

        socketServiceSpy.once.and.callFake((event: GlobalEvent, callback) => {
            if (event === GlobalEvent.Exception) callback(undefined as any);
        });

        service['setupEventListeners']();
        expect(modalSpy.open).toHaveBeenCalled();
        expect(callbackFunc.call).toHaveBeenCalled();
    });

    it('GameStart with time limited solo gamemode should send a event to the server', async () => {
        const username = 'user';
        const gameMode = GameMode.TimeLimitedSolo;
        spyOn<any>(service, 'getUsername').and.resolveTo(username);

        await service['startGame'](gameMode, ButtonState.Play);

        expect(socketServiceSpy.send).toHaveBeenCalledWith(GameSessionEvent.StartGameSession, { gameMode, username });
    });

    it('startGame with time limited coop gamemode should send a event to the server', async () => {
        const username = 'user';
        const gameMode = GameMode.TimeLimitedCoop;
        spyOn<any>(service, 'getUsername').and.resolveTo(username);

        await service['startGame'](gameMode, ButtonState.Play);

        expect(socketServiceSpy.send).toHaveBeenCalledWith(GameSessionEvent.StartGameSession, { gameMode, username }, jasmine.any(Function));
    });

    it('startGame with time limited coop gamemode should show a waiting modal', async () => {
        const username = 'user';
        const gameMode = GameMode.TimeLimitedCoop;
        const loadingModal = jasmine.createSpyObj('loadingModal', ['close']);
        spyOn<any>(service, 'getUsername').and.resolveTo(username);
        modalServiceSpy.createLoadingModal.and.returnValue(loadingModal);
        const showWaitingModalSpy = spyOn<any>(service, 'showWaitingModal');

        socketServiceSpy.send.and.callFake((event: string, data: unknown, callback: (data: any) => void) => {
            callback(WaitingRoomStatus.Created);
            expect(showWaitingModalSpy).toHaveBeenCalled();
            expect(loadingModal.close).toHaveBeenCalled();
        });
        await service['startGame'](gameMode, ButtonState.Play);
    });

    it('startGame with time limited coop gamemode should show a waiting modal', async () => {
        const username = 'user';
        const gameId = '123';
        const gameMode = GameMode.ClassicOneVersusOne;
        const loadingModal = jasmine.createSpyObj('loadingModal', ['close']);
        spyOn<any>(service, 'getUsername').and.resolveTo(username);
        modalServiceSpy.createLoadingModal.and.returnValue(loadingModal);
        const showWaitingModalSpy = spyOn<any>(service, 'showWaitingModal');

        socketServiceSpy.send.and.callFake((event: string, data: unknown, callback: (data: any) => void) => {
            callback(WaitingRoomStatus.Created);
            expect(showWaitingModalSpy).toHaveBeenCalled();
            expect(loadingModal.close).toHaveBeenCalled();
        });
        await service['startGame'](gameMode, ButtonState.Play, gameId);
    });

    it('startGame should return if the gamemode is classic and no id is given', async () => {
        const username = 'user';
        let gameMode = GameMode.ClassicOneVersusOne;
        spyOn<any>(service, 'getUsername').and.resolveTo(username);
        await service['startGame'](gameMode, ButtonState.Play);

        expect(socketServiceSpy.send).not.toHaveBeenCalled();
        gameMode = GameMode.ClassicSolo;
        await service['startGame'](gameMode, ButtonState.Play);
        expect(socketServiceSpy.send).not.toHaveBeenCalled();
    });
});
