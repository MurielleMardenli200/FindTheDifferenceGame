import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ImageArea } from '@app/enums/image-area';
import { ImageUploadService } from '@app/services/image-upload/image-upload.service';

@Component({
    selector: 'app-load-image-button[imageArea]',
    templateUrl: './load-image-button.component.html',
    styleUrls: ['./load-image-button.component.scss'],
})
export class LoadImageButtonComponent implements OnInit {
    @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;
    @Input() imageArea: ImageArea = ImageArea.BOTH;

    buttonLabel: string = '';

    constructor(private imageUploadService: ImageUploadService) {}

    ngOnInit(): void {
        this.setButtonLabel();
    }

    onButtonClick() {
        if (this.imageInput !== undefined) {
            this.imageInput.nativeElement.value = '';
            this.imageInput.nativeElement.dispatchEvent(new MouseEvent('click'));
        }
    }

    onImageSelected(event: Event) {
        const input = event.target as HTMLInputElement;

        if (input && input.files) {
            this.imageUploadService.onFileUpload(input.files[0], this.imageArea);
        }
    }

    private setButtonLabel() {
        switch (this.imageArea) {
            case ImageArea.BOTH:
                this.buttonLabel = 'Charger une image en arrière plan des 2 zones';
                break;
            default:
                this.buttonLabel = 'Charger une image en arrière plan';
                break;
        }
    }
}
