import { Controller, Post, Query, HttpException, HttpStatus } from '@nestjs/common';
import { CopyFolderService } from './copyfolder.service';

@Controller('copyfolder')
export class CopyFolderController {
  constructor(private readonly copyFolderService: CopyFolderService) {}

  @Post('copy')
  async copyFolder(
    @Query('source') sourcePath: string,
    @Query('destination') destinationPath: string,
  ) {
    try {
      await this.copyFolderService.copyFolder(decodeURIComponent(sourcePath) || '', decodeURIComponent(destinationPath) || '');
      return { 
        message: 'Folder copied successfully',
        source: sourcePath,
        destination: destinationPath
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to copy folder',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}