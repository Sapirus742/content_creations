import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Req,
  Header,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { FileUploadService, FileUploadResult } from './file-upload.service';
import { Request } from 'express';

@Controller('upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post()
  @Header('Content-Type', 'application/json; charset=utf-8')
  @UseInterceptors(AnyFilesInterceptor())
  async uploadFile(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request,
  ): Promise<{ message: string; files: FileUploadResult[] }> {
    if (!files || files.length === 0) {
      throw new Error('At least one file is required');
    }

    const path = req.body?.path ? req.body.path : '';
    return this.fileUploadService.processFiles(files, path);
  }
}