import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Courses } from 'src/orm/courses.entity';
import { Information_blocks } from 'src/orm/information_blocks.entity';
import { UpdateCoursesDto } from 'src/common/types';

@Injectable()
export class CoursesService {
    constructor(
        @InjectRepository(Courses)
        private readonly coursesRepository: Repository<Courses>,
        @InjectRepository(Information_blocks)
        private readonly inform_blocksRepository: Repository<Information_blocks>,
    ) {}

    async findAll(): Promise<Courses[]> {
        return this.coursesRepository.find({ relations: ['information_blocks'] });
    }
  
    async findOne(id: number): Promise<Courses | any> {
        const course = await this.coursesRepository.findOne({
        where: { id },
        relations: ['information_blocks'],
        });
        return course;
    }

    async create(
        name: string,
        description: string,
        information_blocks: number[],
    ): Promise<Courses> {
        const course = new Courses();
        course.name = name;
        course.description = description;
        const information_blocksEntities = await this.inform_blocksRepository.find({where: {id: In(information_blocks)}});
        if (information_blocksEntities.length == 0) {throw new NotFoundException(`No information_blocks found with ids ${information_blocks.join(', ')}`)}
        course.information_blocks = information_blocksEntities;
        return this.coursesRepository.save(course);
    }

    async update(id: number, updateCoursesDto: UpdateCoursesDto): Promise<Courses> {
        const course = await this.coursesRepository.findOne({ where: { id } });

        if (!course) {
            throw new NotFoundException(`Course with id ${id} not found`);
        }

        Object.assign(course, updateCoursesDto);

        if (updateCoursesDto.information_blocks) {
        const information_blocks = await this.inform_blocksRepository.find({where: {id: In(updateCoursesDto.information_blocks)}});
        course.information_blocks = information_blocks; // Установите связь
        }

        return this.coursesRepository.save(course);
    }

    async remove(id: number): Promise<void> {
        const course = await this.coursesRepository.findOne({ where: { id } });

        if (!course) {
            throw new NotFoundException(`Course with id ${id} not found`);
        }

        await this.coursesRepository.remove(course);
    }
}