import { Module } from '@nestjs/common';
import { ListFilesController } from './listfiles.controller';
import { ListFilesService } from './listfiles.service';

@Module({
  controllers: [ListFilesController],
  providers: [ListFilesService],
})
export class ListFilesModule {}