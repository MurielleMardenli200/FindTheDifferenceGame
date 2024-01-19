import { Component, Input } from '@angular/core';
import { ImageArea } from '@app/enums/image-area';
import { CanvasAction } from '@app/interfaces/canvas-action';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-canvas',
    template: '',
})
export class CanvasStubComponent {
    @Input() imageArea: ImageArea = ImageArea.BOTH;
    @Input() actionObservable!: Observable<CanvasAction>;
    @Input() clearOnCreate: boolean = false;
}
