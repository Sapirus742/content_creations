import { Controller, Put, Body, HttpException, HttpStatus } from '@nestjs/common';
import { RenameService } from './rename.service';

@Controller('rename')
export class RenameController {
  constructor(private readonly renameService: RenameService) {}

  @Put()
  async renameItem(
    @Body('oldPath') oldPath: string,
    @Body('newName') newName: string,
  ) {
    if (!oldPath || !newName) {
      throw new HttpException(
        'Both oldPath and newName are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      await this.renameService.renameItem(oldPath, newName);
      return { success: true, message: 'Item renamed successfully' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to rename item',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}