import { Component, Input } from '@angular/core';
import { MILLISECONDS_IN_ONE_SECOND } from '@app/constants';
import { ExistingGame } from '@common/model/game';
import { TIME_STRING_BEGIN_OFFSET, TIME_STRING_END_OFFSET } from './leaderboard.constants';

@Component({
    selector: 'app-leaderboard[game]',
    templateUrl: './leaderboard.component.html',
    styleUrls: ['./leaderboard.component.scss'],
})
export class LeaderboardComponent {
    @Input() game!: ExistingGame;

    format(time: number): string {
        return new Date(MILLISECONDS_IN_ONE_SECOND * time).toTimeString().slice(TIME_STRING_BEGIN_OFFSET, TIME_STRING_END_OFFSET);
    }
}
