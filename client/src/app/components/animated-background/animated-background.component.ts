import { Component } from '@angular/core';
import { FLOATING_ELEMENTS } from '@app/constants';

@Component({
    selector: 'app-animated-background',
    templateUrl: './animated-background.component.html',
    styleUrls: ['./animated-background.component.scss'],
})
export class AnimatedBackgroundComponent {
    floatingItems: number[] = new Array(FLOATING_ELEMENTS);
}
