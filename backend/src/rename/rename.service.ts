import { Injectable } from '@nestjs/common';
import { rename } from 'fs/promises';
import { join, normalize } from 'path';

@Injectable()
export class RenameService {
  private readonly BASE_DIR = join(process.cwd(), 'Pull');

  async renameItem(oldRelativePath: string, newName: string): Promise<void> {
    // Защита от directory traversal
    const safeOldPath = normalize(oldRelativePath || '').replace(/^(\.\.(\/|\\|$))+/, '');
    const fullOldPath = join(this.BASE_DIR, safeOldPath);

    // Получаем родительскую директорию и формируем новый путь
    const parentDir = join(fullOldPath, '..');
    const fullNewPath = join(parentDir, newName);

    try {
      await rename(fullOldPath, fullNewPath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error('Item not found');
      }
      if (error.code === 'EEXIST') {
        throw new Error('Target name already exists');
      }
      throw new Error(`Failed to rename: ${error.message}`);
    }
  }
}