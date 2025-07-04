import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Courses } from 'src/orm/courses.entity';
import { Information_blocks } from 'src/orm/information_blocks.entity';
import { Information_blocksService } from './information_blocks.service';
import { Inform_blocksController } from './information_blocks.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Courses, Information_blocks])],
  providers: [Information_blocksService],
  exports: [Information_blocksService],
  controllers: [Inform_blocksController],
})
export class Information_blocksModule {}