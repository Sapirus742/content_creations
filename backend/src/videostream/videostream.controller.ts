import { Controller, Get, Query, Res, HttpStatus, HttpException, Header } from '@nestjs/common';
import { Response } from 'express';
import { VideoStreamService } from './videostream.service';

@Controller('video-stream')
export class  VideoStreamController {
  constructor(private readonly videoStreamService: VideoStreamService) {}
 
  @Get()
  @Header('Accept-Ranges', 'bytes')
  async streamVideo(
    @Query('path') filePath: string,
    @Res() res: Response,
  ) {
    if (!filePath) {
      throw new HttpException('Path parameter is required', HttpStatus.BAD_REQUEST);
    }

    try {
      await this.videoStreamService.streamVideo(filePath, res); 
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to stream video',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}