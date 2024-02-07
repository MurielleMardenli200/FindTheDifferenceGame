import { HostListener, Injectable, OnDestroy } from '@angular/core';
import { SocketEvent } from '@common/socket-event';
import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { TokenService } from '@app/services/token/token.service';
import { Tokens } from '@common/tokens';
import { TokenExpiredError } from '@app/services/token/token-expired-error';
import { AccountService } from '@app/services/account/account.service';

@Injectable({
    providedIn: 'root',
})
export class SocketService implements OnDestroy {
    socket!: Socket;

    constructor(private readonly tokenService: TokenService, private readonly accountService: AccountService) {
        // FIXME: War crimes, socket needs to be connected but auth token needs async or observable
        this.connect();
    }

    @HostListener('window:beforeunload')
    ngOnDestroy(): void {
        this.disconnect();
    }

    isSocketAlive() {
        return this.socket && this.socket.connected;
    }

    async connect() {
        let tokens: Tokens;
        try {
            tokens = this.tokenService.getTokens();
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                await this.accountService.refreshToken();
                tokens = this.tokenService.getTokens();
            } else {
                throw error;
            }
        }
        this.socket = io(environment.socketUrl, {
            query: {
                token: tokens.refreshToken,
                username: this.tokenService.getUsername(),
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
