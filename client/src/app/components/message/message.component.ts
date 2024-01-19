import { Component, Input } from '@angular/core';
import { Message, MessageAuthor } from '@common/model/message';
@Component({
    selector: 'app-message[message]',
    templateUrl: './message.component.html',
    styleUrls: ['./message.component.scss'],
})
export class MessageComponent {
    @Input() message!: Message;
    authors = MessageAuthor;

    get messageTime() {
        const date = new Date(this.message.time);
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
}
