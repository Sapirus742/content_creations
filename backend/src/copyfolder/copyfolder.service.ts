import { Injectable } from '@nestjs/common';
import { copyFile, mkdir, readdir, stat } from 'fs/promises';
import { join, normalize, dirname, basename } from 'path';

@Injectable()
export class CopyFolderService {
  private readonly BASE_DIR = join(process.cwd(), 'Pull');

  private async copyRecursive(source: string, destination: string): Promise<void> {
    const stats = await stat(source);
    
    if (stats.isDirectory()) {
      await mkdir(destination, { recursive: true });
      const files = await readdir(source);
      
      for (const file of files) {
        const srcPath = join(source, file);
        const destPath = join(destination, file);
        await this.copyRecursive(srcPath, destPath);
      }
    } else {
      await copyFile(source, destination);
    }
  }

  async copyFolder(relativeSourcePath: string, relativeDestinationPath: string): Promise<void> {
    // Очищаем пути от потенциально опасных конструкций
    const safeSourcePath = normalize(relativeSourcePath || '').replace(/^(\.\.(\/|\\|$))+/, '');
    const safeDestinationPath = normalize(relativeDestinationPath || '').replace(/^(\.\.(\/|\\|$))+/, '');
    
    const fullSourcePath = join(this.BASE_DIR, safeSourcePath);
    const fullDestinationPath = join(this.BASE_DIR, safeDestinationPath);

    try {
      // Проверяем, что исходный путь существует и это директория
      const sourceStat = await stat(fullSourcePath);
      if (!sourceStat.isDirectory()) {
        throw new Error('Source path is not a directory');
      }

      // Копируем рекурсивно
      await this.copyRecursive(fullSourcePath, fullDestinationPath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error('Source directory not found');
      }
      throw error;
    }
  }
}