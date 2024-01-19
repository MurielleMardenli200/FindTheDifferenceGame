import { Component, Input } from '@angular/core';
import { ImageArea } from '@app/enums/image-area';
import { GameService } from '@app/services/game-service/game.service';

@Component({
    selector: 'app-image-area-game[imageArea][gameService]',
    template: '',
})
export class ImageAreaGameStubComponent {
    @Input() imageArea: ImageArea = ImageArea.BOTH;
    @Input() gameService!: GameService;
}
