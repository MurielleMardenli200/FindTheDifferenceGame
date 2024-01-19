import { Player } from '@app/interfaces/player/player.interface';
import { ExistingGame } from '@app/model/database/game.entity';
import { SessionType } from '@common/model/guess-result';

export interface TimeLimitedWaitingRoom {
    creator: Player;
    waitingPlayers: Player[];
    sessionType: SessionType.TimeLimited;
}

export interface ClassicWaitingRoom {
    creator: Player;
    waitingPlayers: Player[];
    game: ExistingGame;
    sessionType: SessionType.Classic;
}

export type WaitingRoom = ClassicWaitingRoom | TimeLimitedWaitingRoom;
