import { Module } from '@nestjs/common';
import { JsonReaderController } from './json-reader.controller';
import { JsonReaderService } from './json-reader.service';

@Module({
  controllers: [JsonReaderController],
  providers: [JsonReaderService],
})
export class JsonReaderModule {}