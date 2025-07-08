import { Injectable } from '@nestjs/common';
import { stat, createReadStream } from 'fs';
import { join, normalize } from 'path';
import { Response } from 'express';
import { promisify } from 'util';

const statAsync = promisify(stat);

@Injectable()
export class VideoStreamService {
  private readonly BASE_DIR = join(process.cwd(), 'Pull'); // Папка

  async streamVideo(relativePath: string, res: Response): Promise<void> {
    // Защита от Directory Traversal
    const safePath = normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, '');
    const fullPath = join(this.BASE_DIR, safePath);

    try {
      const stats = await statAsync(fullPath);
      
      const fileSize = stats.size;
      const videoRange = res.req.headers.range;
      
      if (videoRange) {
        // Частичный запрос (streaming)
        const parts = videoRange.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        
        const file = createReadStream(fullPath, { start, end });
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/mp4',
        };
        
        res.writeHead(206, head);
        file.pipe(res);
      } else {
        // Полный запрос
        const head = {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
        };
        
        res.writeHead(200, head);
        createReadStream(fullPath).pipe(res);
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error('Video file not found');
      }
      throw error;
    }
  }
}