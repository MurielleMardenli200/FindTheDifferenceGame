import { join } from 'path';

export const OFFSET_FILE_SIZE = 2;
export const OFFSET_PIXEL_MAP = 10;
export const OFFSET_IMAGE_WIDTH = 18;
export const OFFSET_IMAGE_HEIGHT = 22;
export const OFFSET_COLOR_DEPTH = 28;

// The number of bytes in a row must be a multiple of 4 bytes
export const PADDING_BYTES = 4;
export const PADDING_BITS = 32;

export const UPLOADS_PATH = join(process.cwd(), './uploads/');
export const MINIMAL_HEADER_SIZE = 54;

export const ACCEPTED_COLOR_DEPTH = 24;
