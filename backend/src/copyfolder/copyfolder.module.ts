import { Module } from '@nestjs/common';
import { CopyFolderController } from './copyfolder.controller';
import { CopyFolderService } from './copyfolder.service';

@Module({
  controllers: [CopyFolderController],
  providers: [CopyFolderService],
})
export class CopyFolderModule {}