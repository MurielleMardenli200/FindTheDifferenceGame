import { AfterViewInit, Component, ElementRef, Input, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { GameService } from '@app/services/game-service/game.service';
import { MessageService } from '@app/services/message/message.service';
import { GameMode } from '@common/game-mode';
import { Message, MessageAuthor } from '@common/model/message';
import { MAX_MESSAGE_LENGTH } from './message-bar.constants';
@Component({
    selector: 'app-message-bar[gameService]',
    templateUrl: './message-bar.component.html',
    styleUrls: ['./message-bar.component.scss'],
    providers: [],
})
export class MessageBarComponent implements AfterViewInit {
    @Input() gameService!: GameService;
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

    canSendMessage() {
        return (
            (this.gameService.gameInfo.gameMode === GameMode.ClassicOneVersusOne ||
                this.gameService.gameInfo.gameMode === GameMode.TimeLimitedCoop) &&
            !this.gameService.gameEnded
        );
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
            this.gameService.sendMessage({ author: MessageAuthor.User, content: message, time: Date.now() });
            target.value = '';
        }
        return true;
    }
}
