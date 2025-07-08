import { Injectable } from '@nestjs/common';
import { readdir, stat } from 'fs/promises';
import { join, normalize } from 'path';

@Injectable()
export class ListFilesService {
  private readonly BASE_DIR = join(process.cwd(), 'Pull');

  async listFiles(relativePath: string): Promise<string[]> {
    const safePath = normalize(relativePath || '').replace(/^(\.\.(\/|\\|$))+/, '');
    const fullPath = join(this.BASE_DIR, safePath);
     

    try {
      const pathStat = await stat(fullPath);
      if (!pathStat.isDirectory()) {
        throw new Error('Path is not a directory');
      }

      return await readdir(fullPath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error('Directory not found');
      }
      throw error;
    }
  }
}