import { Shape } from '@app/classes/shape/shape';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@app/constants';
import { PaintMode } from '@app/enums/paint-mode';
import { DrawOptions } from '@app/interfaces/shape';
import { Coordinate } from '@common/model/coordinate';

export class Rectangle extends Shape {
    private beginPosition?: Coordinate;
    private lastOptions?: DrawOptions;

    begin(position: Coordinate): void {
        this.beginPosition = position;
        super.begin(position);
    }

    drawRectangle(context: CanvasRenderingContext2D, position: Coordinate, isShifted?: boolean): void {
        if (!this.beginPosition) return;
        const beginPosition = this.beginPosition;
        let beginX = Math.min(position.x, beginPosition.x);
        let beginY = Math.min(position.y, beginPosition.y);
        const width = Math.abs(position.x - beginPosition.x);
        const height = Math.abs(position.y - beginPosition.y);
        if (isShifted) {
            const side = Math.min(width, height);
            beginX = Math.max(beginX, beginPosition.x - side);
            beginY = Math.max(beginY, beginPosition.y - side);
            context.fillRect(beginX, beginY, side, side);
        } else {
            context.fillRect(beginX, beginY, width, height);
        }
    }

    draw(options: DrawOptions) {
        if (!this.beginPosition) return;
        const { position, color, isShifted } = options;
        this.lastOptions = options;
        this.parent.drawOnTemp((context) => {
            context.clearRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        });

        this.parent.drawOnTemp((context) => {
            context.fillStyle = color;
            this.drawRectangle(context, position, isShifted);
        });
        super.draw(options);
    }

    end() {
        // end() can never be called without a call to draw() first
        const { position, color, isShifted } = this.lastOptions as DrawOptions;
        this.parent.drawOnFront((context) => {
            context.fillStyle = color;
            this.drawRectangle(context, position, isShifted);
        });
        this.parent.drawOnTemp((context) => {
            context.clearRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        });
        return super.end();
    }

    getPaintMode(): PaintMode {
        return PaintMode.Rectangle;
    }
}
