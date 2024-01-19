import { ConfigurationEvent } from './configuration.events';
import { GameCreateEvent } from './game-create.events';
import { GameSessionEvent } from './game-session.events';

export enum GlobalEvent {
    Exception = 'exception',
}

export type SocketEvent = GameCreateEvent | GameSessionEvent | GlobalEvent | ConfigurationEvent;
