// json-reader.controller.ts
import { Controller, Get, Query, Res, HttpStatus, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { JsonReaderService } from './json-reader.service';

@Controller('json-reader')
export class JsonReaderController {
  constructor(private readonly jsonReaderService: JsonReaderService) {}
 
  @Get()
  async getFile(
    @Query('path') filePath: string,
    @Res() res: Response,
  ) {
    if (!filePath) {
      throw new HttpException('Path parameter is required', HttpStatus.BAD_REQUEST);
    }

    try {
      await this.jsonReaderService.getFile(filePath, res); 
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to read file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}