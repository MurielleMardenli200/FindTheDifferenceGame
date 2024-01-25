import { TimeLimitedWaitingRoom } from '@app/interfaces/waiting-room/waiting-room.interface';
import { BaseGameSession } from '@app/model/classes/game-sessions/base-game-session/base-game-session';
import { SECOND_IN_MILLISECONDS } from '@app/model/classes/game-sessions/game-session.constants';
import { Timer } from '@app/model/classes/timer/timer';
import { ExistingGame } from '@app/model/database/game.entity';
import { Coordinate } from '@app/model/dto/coordinate.dto';
import { TimeLimitedGameSession } from '@app/model/schema/game-session';
import { DifferencesService } from '@app/services/differences/differences.service';
import { GameConstants } from '@common/game-constants';
import { GuessResultTimeLimited, ResultType, SessionType } from '@common/model/guess-result';
import { WsException } from '@nestjs/websockets';
import { randomInt } from 'crypto';

export class TimeLimitedSession extends BaseGameSession implements TimeLimitedGameSession {
    // Instanciated in function called by constructor
    games!: ExistingGame[];
    originalDifferenceCount!: number;
    differencesFound: number = 0;
    timer: Timer;

    // eslint-disable-next-line max-params
    constructor(differencesService: DifferencesService, waitingRoom: TimeLimitedWaitingRoom, games: ExistingGame[], gameConstants: GameConstants) {
        super(differencesService, waitingRoom, gameConstants);
        this.games = games;
        this.getRandomGame();
        this.timer = new Timer(this.roomId, this.initialTime);
    }

    getRandomGame(): ExistingGame | undefined {
        if (this.games.length > 0) {
            const randomId = randomInt(this.games.length);
            this.game = this.games.splice(randomId, 1)[0];
            this.originalDifferenceCount = this.game.differencesCount;
            this.prepareDifferences().then((differences: Set<string>[]) => {
                this.differences = differences;
                this.originalDifferenceCount = this.differences.length;
            });
            return this.game;
        }
    }

    getWinner(): string | null {
        if (this.games.length !== 0 || this.game.differencesCount === this.originalDifferenceCount) {
            return null;
        }
        this.timer.stopTimer(false);
        return [...this.players.keys()][0];
    }

    manageClick(coord: Coordinate, playerId: string): GuessResultTimeLimited {
        const playerData = this.players.get(playerId);

        if (!playerData) {
            throw new WsException('Somehow, the player is not in the game ¯\\_(ツ)_/¯');
        }

        if (playerData.throttleEndTimestamp !== undefined && playerData.throttleEndTimestamp > Date.now()) {
            throw new WsException('You are currently throttled');
        }
        for (const [index, difference] of this.differences.entries()) {
            if (difference.has(coord.hash())) {
                this.incrementPlayerDifferencesFound();
                this.game.differencesCount--;
                const resultDifference = this.differences.splice(index, 1).pop();
                this.timer.addBonus(this.differenceFoundBonus);

                if (!resultDifference) {
                    throw new WsException('Difference is somehow not a difference');
                }
                const game = this.getRandomGame();
                return {
                    sessionType: SessionType.TimeLimited,
                    type: ResultType.Success,
                    game,
                };
            }
        }

        playerData.throttleEndTimestamp = Date.now() + SECOND_IN_MILLISECONDS;
        return {
            sessionType: SessionType.TimeLimited,
            type: ResultType.Failure,
        };
    }

    incrementPlayerDifferencesFound() {
        this.players.forEach((value) => {
            value.differencesFound++;
        });
    }

    useHintMalus() {
        this.timer.addBonus(-this.hintPenalty);
    }
}
