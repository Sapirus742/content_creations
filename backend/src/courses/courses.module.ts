import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Courses } from 'src/orm/courses.entity';
import { Information_blocks } from 'src/orm/information_blocks.entity';
import { CoursesService } from './courses.service';
import { CourseController } from './courses.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Courses, Information_blocks])],
  providers: [CoursesService],
  exports: [CoursesService],
  controllers: [CourseController],
})
export class CoursesModule {}