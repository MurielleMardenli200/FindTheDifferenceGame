/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimerComponent } from '@app/components/timer/timer.component';
import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
import { MessageService } from '@app/services/message/message.service';
import { ModalService } from '@app/services/modal/modal.service';
import { ButtonStubComponent } from '@app/stubs/button.component.stub';
import { ImageAreaGameStubComponent } from '@app/stubs/image-area-game.component.stub';
import { MessageBarStubComponent } from '@app/stubs/message-bar.component.stub';
import { TimerStubComponent } from '@app/stubs/timer.component.stub';
import { ClassicModeComponent } from './classic-mode.component';
import SpyObj = jasmine.SpyObj;

describe('ClassicModeComponent', () => {
    let component: ClassicModeComponent;
    let fixture: ComponentFixture<ClassicModeComponent>;
    let classicModeServiceSpy: SpyObj<ClassicModeService>;
    let modalServiceSpy: SpyObj<ModalService>;
    let messageServiceSpy: SpyObj<MessageService>;

    beforeEach(async () => {
        classicModeServiceSpy = jasmine.createSpyObj(ClassicModeService, ['initialize', 'showModal', 'endGame', 'giveUp', 'setupCheatMode']);
        classicModeServiceSpy.gameInfo = {} as any;
        classicModeServiceSpy.gameInfo.game = {} as any;
        modalServiceSpy = jasmine.createSpyObj(ModalService, ['createConfirmModal']);
        messageServiceSpy = jasmine.createSpyObj(MessageService, ['addMessage']);
        await TestBed.configureTestingModule({
            declarations: [ClassicModeComponent, ButtonStubComponent, ImageAreaGameStubComponent, TimerStubComponent, MessageBarStubComponent],
            providers: [
                { provide: ClassicModeService, useValue: classicModeServiceSpy },
                { provide: ModalService, useValue: modalServiceSpy },
                { provide: MessageService, useValue: messageServiceSpy },
            ],
        }).compileComponents();

        TestBed.overrideProvider(ClassicModeService, { useValue: classicModeServiceSpy });

        fixture = TestBed.createComponent(ClassicModeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component['timer'] = { stop: () => undefined } as TimerComponent;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
