import { Injectable } from '@angular/core';
import { Replay } from '@app/classes/replay/replay';
import { History, HistoryEnabledOf, HistoryEntryOf, TimedHistoryEntry } from '@app/decorators/history/history';
import { GameService } from '@app/services/game-service/game.service';
import { Coordinate } from '@common/model/coordinate';
import { EndGameResultDto } from '@common/model/dto/end-game-result';
import { GuessResultClassic, ResultType } from '@common/model/guess-result';
import { Buffer } from 'buffer';
import { COORDINATE_ENCODING_LENGTH } from './classic-mode.constants';

@Injectable()
export class ClassicModeService extends GameService implements HistoryEnabledOf<ClassicModeService> {
    private history: TimedHistoryEntry<ClassicModeService>[] = [];
    private gameBeginTimestamp: number = 0;

    @History()
    async onDifferenceFound(guessResult: GuessResultClassic, otherPlayer: boolean): Promise<void> {
        if (guessResult.type === ResultType.Success) {
            const difference = this.decodeDifference(guessResult.difference as string);
            if (otherPlayer) this.opponentFoundDifferences++;
            else this.foundDifferences++;
            await this.blinkAndReplacePixels(difference);
            this.cheatModeDifferences = this.cheatModeDifferences?.filter((diff) => JSON.stringify(diff[0]) !== JSON.stringify(difference[0]));
            super.onDifferenceFound(guessResult, otherPlayer);
        }
    }

    @History()
    endGame(gameResult: EndGameResultDto) {
        this.stopTimer();

        let message;
        if (gameResult.isForfeit) {
            message = 'Votre adversaire a abandonné la partie. Vous avez gagné!';
        } else {
            message = gameResult.isWinner
                ? 'Vous avez gagné le jeu! Vous avez légalement le droit de claim le titre de légende du jeu des 7 différences.'
                : 'Votre adversaire a gagné. Meilleure chance la prochaine fois.';
        }

        if (gameResult.isWinner && gameResult.recordBeaten !== undefined) {
            message = `Vous avez gagné le jeu! Vous êtes maintenant en ${gameResult.recordBeaten} position sur le leaderboard!`;
        }

        if (this.replayInstance) {
            message = 'La reprise vidéo est terminée.';
        }

        this.modalService.createEndGameModal(message, () => this.replay());
        super.endGame(gameResult);
    }

    addToHistory(entry: HistoryEntryOf<ClassicModeService>) {
        this.history.push({
            action: entry,
            time: Date.now() - this.gameBeginTimestamp,
        });
    }

    clearHistory() {
        this.history = [];
        this.gameBeginTimestamp = Date.now();
    }

    replay() {
        const history = [...this.history];
        this.replayInstance = new Replay(this, history, this.replaySpeedChangedSubject);
        this.replayInstance.finishedObservable.subscribe(() => {
            this.replayInstance = undefined;
            this.history = history;
        });
    }

    endReplay() {
        if (!this.replayInstance) return;
        this.replayInstance.end();
        this.router.navigate(['/home']);
    }

    // Adapted from server
    private decodeDifference(content: string): Coordinate[] {
        const buffer = Buffer.from(content, 'base64');
        const difference: Coordinate[] = [];
        for (let i = 0; i < buffer.length; i += COORDINATE_ENCODING_LENGTH) {
            difference.push({ x: buffer.readUInt16LE(i), y: buffer.readUInt16LE(i + 2) });
        }
        return difference;
    }
}
