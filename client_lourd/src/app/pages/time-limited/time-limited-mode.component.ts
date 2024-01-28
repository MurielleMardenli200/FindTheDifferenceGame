import { Component } from '@angular/core';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MessageService } from '@app/services/message/message.service';
import { ModalService } from '@app/services/modal/modal.service';
import { TimeLimitedModeService } from '@app/services/time-limited-mode/time-limited-mode.service';
@Component({
    selector: 'app-time-limited-mode',
    templateUrl: '../game-page/game-page.component.html',
    styleUrls: ['../game-page/game-page.component.scss'],
    providers: [TimeLimitedModeService, MessageService],
})
export class TimeLimitedModeComponent extends GamePageComponent {
    constructor(
        protected messageService: MessageService,
        protected modalService: ModalService,
        public timeLimitedModeService: TimeLimitedModeService,
    ) {
        super(messageService, modalService, timeLimitedModeService);
    }
}
