import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Message, MessageAuthor } from '@common/model/message';

import { MessageComponent } from './message.component';

describe('MessageComponent', () => {
    let component: MessageComponent;
    let fixture: ComponentFixture<MessageComponent>;
    let message: Message;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MessageComponent],
        }).compileComponents();

        message = {
            content: 'Hello World!',
            author: MessageAuthor.User,
            time: Date.now(),
        };

        fixture = TestBed.createComponent(MessageComponent);
        component = fixture.componentInstance;
        component.message = message;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
