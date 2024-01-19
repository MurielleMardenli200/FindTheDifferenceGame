import { Injectable } from '@angular/core';
import { SocketService } from '@app/services/socket/socket.service';
import { GameSessionEvent } from '@common/game-session.events';
import { Message } from '@common/model/message';
@Injectable()
export class MessageService {
    messages: Message[] = [];

    constructor(private socketService: SocketService) {}

    receiveMessage(message: Message) {
        this.messages.push(message);
    }

    sendMessage(message: Message) {
        this.socketService.send(GameSessionEvent.Message, message);
    }
}
