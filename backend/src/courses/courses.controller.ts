import {
    Body,
    Controller,
    Delete,
    Get,
    Logger,
    Param,
    Patch,
    Post,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { Courses } from 'src/orm/courses.entity';
import { CreateCoursesDto, UpdateCoursesDto } from 'src/common/types';

@Controller('course')

export class CourseController {
    private readonly logger = new Logger(CourseController.name);

    constructor(private coursesService: CoursesService) {}

    @Get()
    async findAll(): Promise<Courses[]> {
        return this.coursesService.findAll();
    }
    
    @Get(':id')
    async findOne(@Param('id') id: number): Promise<Courses> {
        return this.coursesService.findOne(id);
    }

    @Post()
    async create(@Body() courses: CreateCoursesDto): Promise<Courses> {
        return this.coursesService.create(
            courses.name,
            courses.description,
            courses.information_blocks,
        );
    }
    
    @Patch(':id')
    async update(@Param('id') id: number, @Body() updateCoursesDto: UpdateCoursesDto): Promise<Courses> {
        return this.coursesService.update(id, updateCoursesDto);
    }
    
    @Delete(':id')
    async remove(@Param('id') id: number): Promise<void> {
        return this.coursesService.remove(id);
    }
}