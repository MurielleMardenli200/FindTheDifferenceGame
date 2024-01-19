/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ElementRef, QueryList } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageComponent } from '@app/components/message/message.component';
import { GameInfo } from '@app/interfaces/game-info';
import { GameService } from '@app/services/game-service/game.service';
import { MessageService } from '@app/services/message/message.service';
import { GameMode } from '@common/game-mode';
import { Message } from '@common/model/message';
import { MessageBarComponent } from './message-bar.component';

import SpyObj = jasmine.SpyObj;

describe('MessageBarComponent', () => {
    let component: MessageBarComponent;
    let fixture: ComponentFixture<MessageBarComponent>;
    let messageServiceSpy: SpyObj<MessageService>;
    let gameServiceSpy: SpyObj<GameService>;

    beforeEach(async () => {
        messageServiceSpy = jasmine.createSpyObj(MessageService, ['']);
        gameServiceSpy = jasmine.createSpyObj(GameService, ['sendMessage']);
        gameServiceSpy.gameInfo = {} as GameInfo;
        gameServiceSpy.gameInfo.gameMode = GameMode.ClassicSolo;

        await TestBed.configureTestingModule({
            declarations: [MessageBarComponent, MessageComponent],
            providers: [
                {
                    provide: MessageService,
                    useValue: messageServiceSpy,
                },
                {
                    provide: GameService,
                    useValue: gameServiceSpy,
                },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(MessageBarComponent);
        component = fixture.componentInstance;
        component.gameService = gameServiceSpy;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should scroll to bottom when new message is added', () => {
        component['messagesList'] = {
            changes: {
                subscribe: (callback: () => void) => {
                    callback();
                },
            },
        } as QueryList<HTMLDivElement>;

        const scrollToBottomSpy = spyOn(component, 'scrollToBottom');
        component.ngAfterViewInit();
        expect(scrollToBottomSpy).toHaveBeenCalled();
    });

    it('scrollToBottom() should scroll to bottom', () => {
        component['messagesDiv'] = {
            nativeElement: {
                scrollTop: 0,
                scrollHeight: 100,
            },
        } as ElementRef<HTMLDivElement>;

        component.scrollToBottom();
        expect(component['messagesDiv'].nativeElement.scrollTop).toEqual(100);
    });

    it('canSendMessage() should return true if game mode is classic multiplayer', () => {
        gameServiceSpy.gameInfo.gameMode = GameMode.ClassicSolo;
        expect(component.canSendMessage()).toBeFalse();
        gameServiceSpy.gameInfo.gameMode = GameMode.ClassicOneVersusOne;
        expect(component.canSendMessage()).toBeTrue();
    });

    it('getMessageTime should return message time', () => {
        const message = { time: 123 } as Message;
        expect(component.getMessageTime(0, message)).toEqual(123);
    });

    it('onKeyUp() should send message if enter is pressed', () => {
        const event = {
            key: 'Enter',
            target: {
                value: 'test',
            } as HTMLInputElement as EventTarget,
        } as KeyboardEvent;
        component.onKeyUp(event);
        expect(gameServiceSpy.sendMessage).toHaveBeenCalled();
    });

    it('onKeyUp() should not send message if message is empty', () => {
        const event = {
            key: 'Enter',
            target: {
                value: '',
            } as HTMLInputElement as EventTarget,
        } as KeyboardEvent;
        component.onKeyUp(event);
        expect(component.onKeyUp(event)).toBeFalse();
    });

    it('onKeyUp() should fail if message is longer than 200 characters', () => {
        const event = {
            key: 'l',
            target: {
                value: 'a'.repeat(200),
            } as HTMLInputElement as EventTarget,
        } as KeyboardEvent;
        expect(component.onKeyUp(event)).toBeFalse();
    });
});
