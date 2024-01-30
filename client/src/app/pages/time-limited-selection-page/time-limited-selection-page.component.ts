import { Component } from '@angular/core';
import { GameStartService } from '@app/services/game-start/game-start.service';

@Component({
    selector: 'app-time-limited-selection-page',
    templateUrl: './time-limited-selection-page.component.html',
    styleUrls: ['./time-limited-selection-page.component.scss'],
})
export class TimeLimitedSelectionPageComponent {
    constructor(public gameStartService: GameStartService) {}
}
