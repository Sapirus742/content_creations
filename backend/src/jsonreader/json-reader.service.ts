// json-reader.service.ts
import { Injectable } from '@nestjs/common';
import { readFile, stat } from 'fs/promises';
import { join, normalize, extname } from 'path';
import { createReadStream } from 'fs';
import { Response } from 'express';

@Injectable()
export class JsonReaderService {
  private readonly BASE_DIR = join(process.cwd(), 'Pull'); // Папка с файлами

  async getFile(relativePath: string, res: Response): Promise<void> {
    // Защита от Directory Traversal
    const safePath = normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, '');
    const fullPath = join(this.BASE_DIR, safePath);

    try {
      // Проверяем существование файла
      await stat(fullPath);
      
      const ext = extname(fullPath).toLowerCase();
      
      // Если это JSON - читаем и парсим
      if (ext === '.json') {
        const fileContent = await readFile(fullPath, 'utf-8');
        const jsonData = JSON.parse(fileContent);
        res.status(200).json(jsonData);
      } 
      // Если это изображение или другой файл - отправляем как поток
      else {
        const fileStream = createReadStream(fullPath);
        
        // Устанавливаем соответствующий Content-Type
        const mimeTypes = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.gif': 'image/gif',
          '.webp': 'image/webp',
          '.svg': 'image/svg+xml',
          '.pdf': 'application/pdf',
          '.txt': 'text/plain',
        };
        
        const contentType = mimeTypes[ext] || 'application/octet-stream';
        res.setHeader('Content-Type', contentType);
        
        fileStream.pipe(res);
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error('File not found in ' + fullPath);
      }
      throw error;
    }
  }
}