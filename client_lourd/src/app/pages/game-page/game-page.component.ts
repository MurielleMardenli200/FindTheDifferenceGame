import { AfterViewInit, Component, HostListener, ViewChild } from '@angular/core';
import { TimerComponent } from '@app/components/timer/timer.component';
import { CHEAT_BLINK_KEY, HINT_KEY } from '@app/constants';
import { ImageArea } from '@app/enums/image-area';
import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
import { GameService } from '@app/services/game-service/game.service';
import { MessageService } from '@app/services/message/message.service';
import { ModalService } from '@app/services/modal/modal.service';
import { GameMode } from '@common/game-mode';
import { Difficulty } from '@common/model/difficulty';

@Component({
    template: '',
})
export class GamePageComponent implements AfterViewInit {
    @ViewChild('timer', { static: false }) private timer!: TimerComponent;
    areas = ImageArea;
    // Necessary for html template
    gameMode = GameMode;
    classicModeService?: ClassicModeService;

    constructor(protected messageService: MessageService, protected modalService: ModalService, protected gameService: GameService) {}

    get gameName() {
        return this.gameService.gameInfo.game.name;
    }

    get gameDifficulty(): Difficulty {
        return this.gameService.gameInfo.game.difficulty;
    }

    get totalDifferences() {
        return this.gameService.gameInfo.game.differencesCount;
    }

    get remainingHints() {
        return this.gameService.remainingHints;
    }

    @HostListener('window:keyup', ['$event'])
    keyEvent(event: KeyboardEvent) {
        if (event.target instanceof HTMLInputElement || this.gameService.gameEnded) return;
        if (CHEAT_BLINK_KEY.includes(event.key)) {
            this.gameService.toggleCheatMode();
        }
        if (HINT_KEY.includes(event.key) && this.canGetHint()) {
            this.getHint();
        }
    }

    async ngAfterViewInit() {
        this.gameService.afterViewInitialize();
    }

    async giveUp() {
        if (await this.modalService.createConfirmModal('Voulez-vous vraiment abandonner ?')) {
            this.gameService.giveUp();
        }
    }

    canGetHint() {
        const hasRemainingHints = this.remainingHints > 0;
        return (
            (this.gameService.gameInfo.gameMode === GameMode.ClassicSolo || this.gameService.gameInfo.gameMode === GameMode.TimeLimitedSolo) &&
            hasRemainingHints
        );
    }

    getHint() {
        this.gameService.getHint();
        switch (this.gameService.gameInfo.gameMode) {
            case GameMode.ClassicSolo:
            case GameMode.ClassicOneVersusOne:
                this.timer.addSeconds(this.gameService.gameInfo.hintPenalty);
                break;
            case GameMode.TimeLimitedSolo:
            case GameMode.TimeLimitedCoop:
                this.timer.addSeconds(-this.gameService.gameInfo.hintPenalty);
                break;
        }
    }
}
