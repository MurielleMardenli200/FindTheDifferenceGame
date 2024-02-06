import { AfterViewInit, Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MessageService } from '@app/services/message/message.service';
import { Message, MessageAuthor } from '@common/model/message';
import { MAX_MESSAGE_LENGTH } from '@app/pages/chat/chat.constants';

@Component({
    selector: 'app-chat',
    providers: [],
    templateUrl: './chat.component.html',
    styleUrl: './chat.component.scss',
})
export class ChatComponent implements AfterViewInit {
    @ViewChildren('messagesList') private messagesList!: QueryList<HTMLDivElement>;
    @ViewChild('messagesDiv') private messagesDiv!: ElementRef<HTMLDivElement>;
    constructor(public messageService: MessageService) {}

    ngAfterViewInit(): void {
        this.messagesList.changes.subscribe(() => {
            this.scrollToBottom();
        });
    }

    scrollToBottom() {
        this.messagesDiv.nativeElement.scrollTop = this.messagesDiv.nativeElement.scrollHeight;
    }

    getMessageTime(_: number, message: Message) {
        return message.time;
    }

    onKeyUp(event: KeyboardEvent) {
        const target = event.target as HTMLInputElement;
        if (target.value.length >= MAX_MESSAGE_LENGTH) return false;
        if (event.key === 'Enter') {
            const message = target.value;
            if (message.trim().length === 0) return false;
            console.log('Sending message client', { author: MessageAuthor.User, content: message, time: Date.now() });
            this.messageService.sendMessage({ author: MessageAuthor.User, content: message, time: Date.now() });
            target.value = '';
        }
        return true;
    }
}
