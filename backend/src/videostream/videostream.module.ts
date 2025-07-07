import { Module } from '@nestjs/common';
import { VideoStreamController } from './videostream.controller';
import { VideoStreamService } from './videostream.service';

@Module({
  controllers: [VideoStreamController],
  providers: [VideoStreamService],
})
export class VideoStreamModule{}