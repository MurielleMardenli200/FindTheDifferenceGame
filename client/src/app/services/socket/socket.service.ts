import { Injectable, OnDestroy } from '@angular/core';
import { SocketEvent } from '@common/socket-event';
import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
export const TIMEOUT = 2000;

@Injectable({
    providedIn: 'root',
})
export class SocketService implements OnDestroy {
    socket!: Socket;

    constructor() {
        this.connect();
    }

    ngOnDestroy(): void {
        this.disconnect();
    }

    isSocketAlive() {
        return this.socket && this.socket.connected;
    }

    connect() {
        this.socket = io(environment.socketUrl, {
            auth: {
                token: localStorage.getItem('token'),
            },
        });
    }

    disconnect() {
        if (this.socket !== undefined) {
            this.socket.disconnect();
        }
    }

    // Based on https://gitlab.com/nikolayradoev/socket-io-exemple/-/blob/master/client/src/app/services/socket-client.service.ts
    on<T>(event: SocketEvent, action: (data: T) => void): void {
        this.socket.on(event, action);
    }

    once<T>(event: SocketEvent, action: (data: T) => void): void {
        this.socket.once(event, action);
    }

    // Based on https://gitlab.com/nikolayradoev/socket-io-exemple/-/blob/master/client/src/app/services/socket-client.service.ts
    send<T = unknown, U = unknown>(event: SocketEvent, data?: T, callback?: (data: U) => void): void {
        if (!callback) callback = () => undefined;

        this.socket.emit(event, data, callback);
    }
}
