import { Component } from '@angular/core';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
import { MessageService } from '@app/services/message/message.service';
import { ModalService } from '@app/services/modal/modal.service';

@Component({
    selector: 'app-classic-mode',
    templateUrl: '../game-page/game-page.component.html',
    styleUrls: ['../game-page/game-page.component.scss'],
    providers: [ClassicModeService, MessageService],
})
export class ClassicModeComponent extends GamePageComponent {
    constructor(protected messageService: MessageService, protected modalService: ModalService, public classicModeService: ClassicModeService) {
        super(messageService, modalService, classicModeService);
    }
}
