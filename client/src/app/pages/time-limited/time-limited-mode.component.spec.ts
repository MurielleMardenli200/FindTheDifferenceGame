import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GameStartService } from '@app/services/game-start/game-start.service';
import { MessageService } from '@app/services/message/message.service';
import { TimeLimitedModeService } from '@app/services/time-limited-mode/time-limited-mode.service';

import { GameInfo } from '@app/interfaces/game-info';
import { ButtonStubComponent } from '@app/stubs/button.component.stub';
import { ImageAreaGameStubComponent } from '@app/stubs/image-area-game.component.stub';
import { MessageBarStubComponent } from '@app/stubs/message-bar.component.stub';
import { TimerStubComponent } from '@app/stubs/timer.component.stub';
import { Game } from '@common/model/game';
import { TimeLimitedModeComponent } from './time-limited-mode.component';
import SpyObj = jasmine.SpyObj;

describe('TimeLimitedModeComponent', () => {
    let component: TimeLimitedModeComponent;
    let fixture: ComponentFixture<TimeLimitedModeComponent>;
    let messageServiceSpy: SpyObj<MessageService>;
    let modalSpy: SpyObj<MatDialog>;
    let gameServiceSpy: SpyObj<TimeLimitedModeService>;
    let routerSpy: SpyObj<Router>;

    beforeEach(async () => {
        messageServiceSpy = jasmine.createSpyObj('MessageService', ['']);
        modalSpy = jasmine.createSpyObj('MatDialog', ['open']);
        gameServiceSpy = jasmine.createSpyObj('TimeLimitedModeService', ['initialize', 'blinkRemainingDifferences', 'stopTimer', 'giveUp']);
        gameServiceSpy.gameInfo = { game: {} as Game } as GameInfo;

        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        await TestBed.configureTestingModule({
            declarations: [TimeLimitedModeComponent, ButtonStubComponent, ImageAreaGameStubComponent, TimerStubComponent, MessageBarStubComponent],
            providers: [
                { provide: MatDialog, useValue: modalSpy },
                { provide: MessageService, useValue: messageServiceSpy },
                { provide: TimeLimitedModeService, useValue: gameServiceSpy },
                { provide: GameStartService, useValue: gameServiceSpy },
                { provide: Router, useValue: routerSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(TimeLimitedModeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
