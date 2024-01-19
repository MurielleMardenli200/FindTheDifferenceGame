import { ImageArea } from '@app/enums/image-area';

export interface CanvasAction {
    imageArea: ImageArea;
    action: (context: CanvasRenderingContext2D) => void;
}
