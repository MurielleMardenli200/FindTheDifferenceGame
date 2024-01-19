import { TIME_LIMITED_ID } from '@app/constants/waiting-room.constants';
import { Player } from '@app/interfaces/player/player.interface';
import { ClassicWaitingRoom, TimeLimitedWaitingRoom, WaitingRoom } from '@app/interfaces/waiting-room/waiting-room.interface';
import { GameService } from '@app/services/game/game.service';
import { SessionType } from '@common/model/guess-result';
import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WaitingRoomService {
    private gameIdToRoom: Map<string, WaitingRoom> = new Map();
    private socketIdToRoom: Map<string, WaitingRoom> = new Map();

    constructor(private gameService: GameService) {}

    async addPlayer(gameId: string, player: Player): Promise<boolean> {
        const waitingRoom = this.gameIdToRoom.get(gameId);

        if (waitingRoom) {
            waitingRoom.waitingPlayers.push(player);
            this.socketIdToRoom.set(player.socketId, waitingRoom);
            return false;
        }

        if (gameId === TIME_LIMITED_ID) {
            return this.addTimeLimitedPlayer(player);
        } else {
            return this.addClassicPlayer(gameId, player);
        }
    }

    async addClassicPlayer(gameId: string, player: Player): Promise<boolean> {
        const game = await this.gameService.getGame(gameId);

        if (!game) {
            throw new WsException('Game not found');
        }

        const newRoom: ClassicWaitingRoom = {
            creator: player,
            waitingPlayers: [],
            game,
            sessionType: SessionType.Classic,
        };

        this.gameIdToRoom.set(gameId, newRoom);
        this.socketIdToRoom.set(player.socketId, newRoom);

        return true;
    }

    addTimeLimitedPlayer(player: Player): boolean {
        const newRoom: TimeLimitedWaitingRoom = {
            creator: player,
            waitingPlayers: [],
            sessionType: SessionType.TimeLimited,
        };

        this.gameIdToRoom.set(TIME_LIMITED_ID, newRoom);
        this.socketIdToRoom.set(player.socketId, newRoom);
        return true;
    }

    removePlayer(socketId: string): boolean {
        const waitingRoom = this.socketIdToRoom.get(socketId);

        if (!waitingRoom) {
            return false;
        }

        if (socketId === waitingRoom.creator.socketId) {
            const gameId = waitingRoom.sessionType === SessionType.Classic ? waitingRoom.game._id.toString() : TIME_LIMITED_ID;

            this.clearRoom(gameId);
            return true;
        }

        const playerToRemoveIndex = waitingRoom.waitingPlayers.findIndex((player) => {
            return player.socketId === socketId;
        });

        waitingRoom.waitingPlayers.splice(playerToRemoveIndex, 1);

        this.socketIdToRoom.delete(socketId);

        return false;
    }

    getGameWaitingRoom(gameId: string): WaitingRoom | undefined {
        return this.gameIdToRoom.get(gameId);
    }

    getPlayerWaitingRoom(socketId: string): WaitingRoom {
        const waitingRoom = this.socketIdToRoom.get(socketId);
        if (!waitingRoom) {
            throw new WsException('Player is not in a waiting room');
        }
        return waitingRoom;
    }

    clearRoom(gameId: string): void {
        const waitingRoom = this.gameIdToRoom.get(gameId);

        if (!waitingRoom) {
            return;
        }

        this.gameIdToRoom.delete(gameId);

        this.socketIdToRoom.delete(waitingRoom.creator.socketId);

        waitingRoom.waitingPlayers.forEach((player) => {
            this.socketIdToRoom.delete(player.socketId);
        });
    }
}
