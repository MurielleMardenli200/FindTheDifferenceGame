import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import { join } from 'path';

@Injectable()
export class FileService {
    async fileExists(path: string): Promise<boolean> {
        try {
            await fs.stat(path);
        } catch (e: unknown) {
            // We rethrow the error only if it's not "file not found"
            if (!(typeof e === 'object') || e === null || !('code' in e) || e.code !== 'ENOENT') {
                throw e;
            }

            return false;
        }
        return true;
    }

    async saveFile(fileContent: Buffer | string, extension: string, path: string): Promise<string> {
        let filename = '';
        do {
            filename = `${randomUUID()}.${extension}`;
        } while (await this.fileExists(join(path, filename)));
        await fs.writeFile(join(path, filename), fileContent);
        return filename;
    }
}
