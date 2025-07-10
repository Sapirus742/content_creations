import { Module } from '@nestjs/common';
import { DeleteFilesController } from './deletefiles.controller';
import { DeleteFilesService } from './deletefiles.service';

@Module({
  controllers: [DeleteFilesController],
  providers: [DeleteFilesService],
})
export class DeleteFilesModule {}