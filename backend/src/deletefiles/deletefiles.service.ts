import { Injectable } from '@nestjs/common';
import { rm, stat } from 'fs/promises';
import { join, normalize } from 'path';

@Injectable()
export class DeleteFilesService {
  // Базовый каталог (аналогично модулю listfiles)
  private readonly BASE_DIR = join(process.cwd(), 'Pull');

  /**
   * Преобразует относительный путь в безопасный абсолютный путь
   * @param relativePath Относительный путь
   * @returns Абсолютный путь внутри BASE_DIR
   */
  private getSafePath(relativePath: string): string {
    // Нормализуем путь и защищаемся от directory traversal
    const safePath = normalize(relativePath || '').replace(/^(\.\.(\/|\\|$))+/, '');
    return join(this.BASE_DIR, safePath);
  }

  /**
   * Удаляет файл или директорию
   * @param relativePath Относительный путь к удаляемому файлу/директории
   * @throws {Error} Если файл/директория не существует или произошла ошибка удаления
   */
  async deleteFileOrDirectory(relativePath: string): Promise<void> {
    const fullPath = this.getSafePath(relativePath);

    try {
      // Проверяем, что путь существует
      await stat(fullPath);
      // Удаляем с опциями recursive (для директорий) и force (игнорировать ошибки)
      await rm(fullPath, { recursive: true, force: true });
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error('Файл или директория не найдены');
      }
      throw error;
    }
  }
}