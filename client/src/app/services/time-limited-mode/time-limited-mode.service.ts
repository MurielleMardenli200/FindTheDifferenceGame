import { Injectable } from '@angular/core';
import { GameService } from '@app/services/game-service/game.service';
import { GameMode } from '@common/game-mode';
import { GameSessionEvent } from '@common/game-session.events';
import { EndGameResultDto } from '@common/model/dto/end-game-result';
import { GuessResultTimeLimited, ResultType } from '@common/model/guess-result';

@Injectable({
    providedIn: 'root',
})
export class TimeLimitedModeService extends GameService {
    // FIXME: a bit ugly to fix if we have time
    endGame(gameResult: EndGameResultDto) {
        this.stopTimer();

        if (gameResult.isForfeit) {
            this.gameInfo.gameMode = GameMode.TimeLimitedSolo;
            this.socketService.once(GameSessionEvent.EndGame, (secondGameResult: EndGameResultDto) => this.endGame(secondGameResult));
        } else {
            const message = gameResult.isWinner
                ? 'Vous avez gagné le jeu! Vous avez légalement le droit de claim le titre de légende du jeu des 7 différences.'
                : 'Le temps est écoulé vous avez perdu ! Get good';
            this.modalService.createEndGameModal(message);
            super.endGame(gameResult);
        }
    }

    protected async onDifferenceFound(guessResult: GuessResultTimeLimited): Promise<void> {
        this.foundDifferences++;
        if (guessResult.type === ResultType.Success && guessResult.game) {
            this.gameInfo.game = guessResult.game;
            this.loadImages();
            this.bonusSubject.next(this.gameInfo.differenceFoundBonus);
            if (this.cheatModeDifferences) {
                this.cheatModeDifferences = await this.getRemainingDifferences();
            }
        }
        super.onDifferenceFound(guessResult);
    }
}
