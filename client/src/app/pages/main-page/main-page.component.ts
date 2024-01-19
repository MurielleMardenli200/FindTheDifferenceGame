import { Component } from '@angular/core';
import { TEAM_MEMBERS, TEAM_NUMBER } from '@app/constants/initial-view-constants';
import { GameStartService } from '@app/services/game-start/game-start.service';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    // FIXME : USE GAMESTARTSERVICE TO OPEN A MODAL TO START AGAINST TIME
    constructor(public gameStartService: GameStartService) {}
    getTeamNumber(): number {
        return TEAM_NUMBER;
    }

    getTeamMembers() {
        return TEAM_MEMBERS;
    }
}
