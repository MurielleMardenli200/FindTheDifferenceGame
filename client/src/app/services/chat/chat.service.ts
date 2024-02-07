import { Injectable } from '@angular/core';
import { SocketService } from '@app/services/socket/socket.service';
import { GameSessionEvent } from '@common/game-session.events';
import { ChatMessage } from '@common/model/message';

// TODO: This is just a duplicated MessageService, remove it
@Injectable({
    providedIn: 'root',
})
export class ChatService {
    messages: ChatMessage[] = [];
    constructor(private socketService: SocketService) {
        this.initialize();
    }

    initialize() {
        this.socketService.on(GameSessionEvent.Message, (message: ChatMessage) => {
            this.receiveMessage(message);
        });
    }

    receiveMessage(message: ChatMessage) {
        this.messages.push(message);
    }

    sendMessage(message: ChatMessage) {
        this.receiveMessage(message);
        this.socketService.send(GameSessionEvent.Message, message);
    }
}
