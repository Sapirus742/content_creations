import { Injectable } from '@nestjs/common';
import { join, normalize } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';

export interface FileUploadResult {
  originalname: string;
  path: string;
  size: number;
}

@Injectable()
export class FileUploadService {
  async processFiles(
    files: Express.Multer.File[],
    customPath: string,
  ): Promise<{ message: string; files: FileUploadResult[] }> {
    const results: FileUploadResult[] = [];

    for (const file of files) {
      // 1. Декодируем
      const decodedName = decodeURIComponent(file.originalname);

      // 2. Путь
      const safePath = normalize(customPath).replace(/^(\.\.(\/|\\|$))+/, '');
      const uploadDir = join(process.cwd(), 'Pull', safePath);
      
      // 3. Создаём директорию
      if (!existsSync(uploadDir)) {
        mkdirSync(uploadDir, { recursive: true });
      }

      // 4. Сохраняем файл с оригинальным именем
      const filePath = join(uploadDir, decodedName);
      writeFileSync(filePath, file.buffer);

      results.push({
        originalname: decodedName, // Возвращаем декодированное имя
        path: filePath,
        size: file.size,
      });
    }

    return {
      message: 'Files saved successfully',
      files: results,
    };
  }
}