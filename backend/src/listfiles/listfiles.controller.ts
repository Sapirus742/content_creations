import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ListFilesService } from './listfiles.service';

@Controller('listfiles')
export class ListFilesController {
  constructor(private readonly directoryReaderService: ListFilesService) {}

  @Get('list')
  async listFiles(@Query('path') dirPath: string) {
    try {
      const files = await this.directoryReaderService.listFiles(dirPath || '');
      return { path: dirPath || '', files };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to list files',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}