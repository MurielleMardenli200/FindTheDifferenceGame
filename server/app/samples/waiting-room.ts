import { TimeLimitedWaitingRoom, WaitingRoom } from '@app/interfaces/waiting-room/waiting-room.interface';
import { SessionType } from '@common/model/guess-result';
import { defaultGame } from './game';
import { player1, player2, player3, player4 } from './player';

export const defaultEmptyWaitingRoom: WaitingRoom = {
    creator: player1,
    waitingPlayers: [],
    game: defaultGame,
    sessionType: SessionType.Classic,
};

export const defaultWaitingRoomWithOnePlayerInQueue: WaitingRoom = {
    creator: player1,
    waitingPlayers: [player2],
    game: defaultGame,
    sessionType: SessionType.Classic,
};

export const defaultWaitingRoomWithTwoPlayersInQueue: WaitingRoom = {
    creator: player1,
    waitingPlayers: [player2, player3],
    game: defaultGame,
    sessionType: SessionType.Classic,
};

export const defaultWaitingRoomWithThreePlayersInQueue: WaitingRoom = {
    creator: player1,
    waitingPlayers: [player2, player3, player4],
    game: defaultGame,
    sessionType: SessionType.Classic,
};

export const defaultTimeLimitedcWaitingRoomWithOnePlayerInQueue: TimeLimitedWaitingRoom = {
    creator: player1,
    waitingPlayers: [player2],
    sessionType: SessionType.TimeLimited,
};

export const defaultTimeLimitedWaitingRoomWithTwoPlayersInQueue: TimeLimitedWaitingRoom = {
    creator: player1,
    waitingPlayers: [player2, player3],
    sessionType: SessionType.TimeLimited,
};

export const defaultEmptyTimeLimitedWaitingRoom: TimeLimitedWaitingRoom = {
    creator: player1,
    waitingPlayers: [],
    sessionType: SessionType.TimeLimited,
};
