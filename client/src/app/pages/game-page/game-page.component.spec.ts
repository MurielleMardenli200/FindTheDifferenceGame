/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimerComponent } from '@app/components/timer/timer.component';
import { GameService } from '@app/services/game-service/game.service';
import { MessageService } from '@app/services/message/message.service';
import { ModalService } from '@app/services/modal/modal.service';
import { TimerStubComponent } from '@app/stubs/timer.component.stub';
import { GameMode } from '@common/game-mode';
import { Difficulty } from '@common/model/difficulty';
import { ExistingGame } from '@common/model/game';
import { GamePageComponent } from './game-page.component';

import SpyObj = jasmine.SpyObj;

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;

    let messageServiceSpy: SpyObj<MessageService>;
    let modalServiceSpy: SpyObj<ModalService>;
    let gameServiceSpy: SpyObj<GameService>;
    beforeEach(async () => {
        messageServiceSpy = jasmine.createSpyObj('MessageService', ['']);
        modalServiceSpy = jasmine.createSpyObj('ModalService', ['createConfirmModal']);
        modalServiceSpy.createConfirmModal.and.returnValue(Promise.resolve(true));
        gameServiceSpy = jasmine.createSpyObj('GameService', ['initialize', 'toggleCheatMode', 'stopTimer', 'giveUp', 'getHint']);
        gameServiceSpy.gameInfo = {} as any;

        await TestBed.configureTestingModule({
            declarations: [GamePageComponent, TimerStubComponent],
            providers: [
                TimerComponent,
                { provide: ModalService, useValue: modalServiceSpy },
                { provide: MessageService, useValue: messageServiceSpy },
                { provide: GameService, useValue: gameServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('giveUp() should ask service to give up', async () => {
        await component.giveUp();
        expect(modalServiceSpy.createConfirmModal).toHaveBeenCalled();
        expect(gameServiceSpy.giveUp).toHaveBeenCalled();
    });

    it('cheat mode event should call classicModeService.toggleCheatMode', () => {
        const event = { key: 'T' } as KeyboardEvent;
        component.keyEvent(event);
        expect(gameServiceSpy.toggleCheatMode).toHaveBeenCalled();
    });

    it('hint event should get hint from gameService and apply penalty', () => {
        const event = { key: 'I' } as KeyboardEvent;
        component['gameService'].gameInfo.gameMode = GameMode.ClassicSolo;
        component['gameService'].gameInfo.hintPenalty = 5;
        component['timer'] = { addSeconds: () => {} } as any;
        const addSecondsSpy = spyOn(component['timer'], 'addSeconds').and.callThrough();
        const canGetHintSpy = spyOn<any>(component, 'canGetHint').and.returnValue(true);

        component.keyEvent(event);

        expect(gameServiceSpy.getHint).toHaveBeenCalled();
        expect(addSecondsSpy).toHaveBeenCalledWith(5);
        expect(canGetHintSpy).toHaveBeenCalled();

        component['gameService'].gameInfo.gameMode = GameMode.TimeLimitedCoop;
        fixture.detectChanges();

        component.keyEvent(event);

        expect(gameServiceSpy.getHint).toHaveBeenCalledTimes(2);
        expect(addSecondsSpy).toHaveBeenCalledWith(-5);
        expect(canGetHintSpy).toHaveBeenCalledTimes(2);
    });

    it('gameDifficulty should return the difficulty of the game', () => {
        gameServiceSpy.gameInfo.game = { difficulty: Difficulty.Easy } as ExistingGame;
        expect(component.gameDifficulty).toEqual(Difficulty.Easy);
    });

    it('totalDifferences should return the total number of differences', () => {
        gameServiceSpy.gameInfo.game = { differencesCount: 5 } as ExistingGame;
        expect(component.totalDifferences).toEqual(5);
    });

    it('keyEvent should be ignored if user is focused on an input', () => {
        const inputElement = document.createElement('input');
        const event = { key: 'T', target: inputElement as EventTarget } as KeyboardEvent;
        component.keyEvent(event);
        expect(gameServiceSpy.toggleCheatMode).not.toHaveBeenCalled();
    });

    it('canGetHint should return true if there are remaining hints and game mode is solo', () => {
        gameServiceSpy.remainingHints = 1;
        gameServiceSpy.gameInfo.gameMode = GameMode.ClassicSolo;
        expect(component['canGetHint']()).toEqual(true);
    });

    it('canGetHint should return false if there are no remaining hints', () => {
        gameServiceSpy.remainingHints = 0;
        gameServiceSpy.gameInfo.gameMode = GameMode.ClassicSolo;
        expect(component['canGetHint']()).toEqual(false);
    });

    it('canGetHint should return false if game mode is not solo', () => {
        gameServiceSpy.remainingHints = 1;
        gameServiceSpy.gameInfo.gameMode = GameMode.ClassicOneVersusOne;
        expect(component['canGetHint']()).toEqual(false);
    });
});
