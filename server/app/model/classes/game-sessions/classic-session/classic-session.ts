import { ClassicWaitingRoom } from '@app/interfaces/waiting-room/waiting-room.interface';
import { BaseGameSession } from '@app/model/classes/game-sessions/base-game-session/base-game-session';
import { SECOND_IN_MILLISECONDS } from '@app/model/classes/game-sessions/game-session.constants';
import { GameConstants } from '@app/model/database/game-constants.entity';
import { Coordinate } from '@app/model/dto/coordinate.dto';
import { DifferencesService } from '@app/services/differences/differences.service';
import { GuessResultClassic, ResultType, SessionType } from '@common/model/guess-result';
import { WsException } from '@nestjs/websockets';

export class ClassicSession extends BaseGameSession {
    constructor(differencesService: DifferencesService, waitingRoom: ClassicWaitingRoom, gameConstants: GameConstants) {
        super(differencesService, waitingRoom, gameConstants);
        this.game = waitingRoom.game;
        this.initialTime = 0;
        this.prepareDifferences().then((differences: Set<string>[]) => {
            this.differences = differences;
        });
    }

    getWinner(playerId: string): string | null {
        const player = this.players.get(playerId);
        if (!player) {
            throw new WsException('Player not in room');
        }

        if (this.isMultiplayer() && player.differencesFound >= Math.ceil(this.game.differencesCount / 2)) {
            return playerId;
        } else {
            return this.differences.length === 0 ? playerId : null;
        }
    }

    manageClick(coord: Coordinate, playerId: string): GuessResultClassic {
        const playerData = this.players.get(playerId);

        if (!playerData) {
            throw new WsException('Somehow, the player is not in the game ¯\\_(ツ)_/¯');
        }

        if (playerData.throttleEndTimestamp !== undefined && playerData.throttleEndTimestamp > Date.now()) {
            throw new WsException('You are currently throttled');
        }

        for (const [index, difference] of this.differences.entries()) {
            if (difference.has(coord.hash())) {
                playerData.differencesFound++;

                const differences = this.differences.splice(index, 1).pop();

                if (!differences) {
                    throw new WsException('The difference do not exist');
                }

                return {
                    sessionType: SessionType.Classic,
                    type: ResultType.Success,
                    difference: this.differencesService.encodeDifference([...differences].map((hash) => Coordinate.fromHash(hash))),
                };
            }
        }

        playerData.throttleEndTimestamp = Date.now() + SECOND_IN_MILLISECONDS;
        return {
            sessionType: SessionType.Classic,
            type: ResultType.Failure,
        };
    }

    useHintMalus() {
        this.startedTime -= this.hintPenalty * SECOND_IN_MILLISECONDS;
    }
}
