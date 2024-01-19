import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@app/constants/image.constants';
import { Bitmap } from '@app/model/schema/bitmap';
import { ImageInfo } from '@app/model/schema/image-info';
import { FileService } from '@app/services/file/file.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import {
    ACCEPTED_COLOR_DEPTH,
    MINIMAL_HEADER_SIZE,
    OFFSET_COLOR_DEPTH,
    OFFSET_FILE_SIZE,
    OFFSET_IMAGE_HEIGHT,
    OFFSET_IMAGE_WIDTH,
    OFFSET_PIXEL_MAP,
    PADDING_BITS,
    PADDING_BYTES,
    UPLOADS_PATH,
} from './bitmap.service.constants';

@Injectable()
export class BitmapService {
    constructor(private fileService: FileService) {}

    // Decode base64 image and save it to path. Return path
    async saveImage(base64ImageContent: string): Promise<string> {
        return await this.fileService.saveFile(Buffer.from(base64ImageContent, 'base64'), 'bmp', UPLOADS_PATH);
    }

    decodeHeader(imageContent: Buffer): ImageInfo {
        return {
            signature: imageContent.toString('utf8', 0, 2),
            fileSize: imageContent.readUInt32LE(OFFSET_FILE_SIZE),
            pixelMapStart: imageContent.readUInt32LE(OFFSET_PIXEL_MAP),
            width: imageContent.readInt32LE(OFFSET_IMAGE_WIDTH),
            height: Math.abs(imageContent.readInt32LE(OFFSET_IMAGE_HEIGHT)),
            colorDepth: imageContent.readUInt16LE(OFFSET_COLOR_DEPTH),
            topDown: imageContent.readInt32LE(OFFSET_IMAGE_HEIGHT) < 0,
        };
    }

    // Returns an of arrays containing RGB values of each pixels
    async decodeImage(base64Image: string): Promise<Bitmap> {
        const imageContent = Buffer.from(base64Image, 'base64');
        if (imageContent.length < MINIMAL_HEADER_SIZE) {
            throw new HttpException('Image is too small to have a header', HttpStatus.BAD_REQUEST);
        }

        const imageInfo = this.decodeHeader(imageContent);
        if (imageInfo.signature !== 'BM') {
            throw new HttpException('Image has invalid signature', HttpStatus.BAD_REQUEST);
        } else if (imageInfo.fileSize !== imageContent.length) {
            throw new HttpException('Image size does not equal size in header', HttpStatus.BAD_REQUEST);
        } else if (imageInfo.width !== IMAGE_WIDTH || imageInfo.height !== IMAGE_HEIGHT) {
            throw new HttpException('Image is not 640x480', HttpStatus.BAD_REQUEST);
        } else if (imageInfo.colorDepth !== ACCEPTED_COLOR_DEPTH) {
            throw new HttpException('Image color depth is not 24 bits', HttpStatus.BAD_REQUEST);
        }

        const rowSize = Math.ceil((imageInfo.colorDepth * imageInfo.width) / PADDING_BITS) * PADDING_BYTES;
        if (imageInfo.pixelMapStart + rowSize * imageInfo.height !== imageInfo.fileSize) {
            throw new HttpException('Image size does not equal to calculated size', HttpStatus.BAD_REQUEST);
        }

        const image: Bitmap = { imageInfo, pixels: [] };
        let offset = imageInfo.pixelMapStart;
        for (let row = 0; row < imageInfo.height; row++) {
            const rowEndOffset = offset + rowSize;
            image.pixels.push([]);
            for (let col = 0; col < imageInfo.width; col++, offset += 3) {
                image.pixels[row].push(imageContent.readUintBE(offset, 3));
            }
            offset = rowEndOffset;
        }

        if (!imageInfo.topDown) {
            image.pixels.reverse();
        }

        return image;
    }

    async deleteImageFile(imageFilename: string): Promise<void> {
        if (await this.fileService.fileExists(this.getFullPath(imageFilename))) {
            await fs.unlink(this.getFullPath(imageFilename));
        }
    }

    async decodeImages(leftImageBase64: string, rightImageBase64: string): Promise<{ leftImage: Bitmap; rightImage: Bitmap }> {
        const leftImage = await this.decodeImage(leftImageBase64);
        const rightImage = await this.decodeImage(rightImageBase64);
        return { leftImage, rightImage };
    }

    private getFullPath(path: string): string {
        return join(UPLOADS_PATH, path);
    }
}
