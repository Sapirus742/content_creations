import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Courses } from 'src/orm/courses.entity';
import { Information_blocks } from 'src/orm/information_blocks.entity';
import { InformBlocksStatus, UpdateCoursesDto, UpdateInformationBlocksDto } from 'src/common/types';

@Injectable()
export class Information_blocksService {
    constructor(
        @InjectRepository(Courses)
        private readonly coursesRepository: Repository<Courses>,
        @InjectRepository(Information_blocks)
        private readonly inform_blocksRepository: Repository<Information_blocks>,
    ) {}

    async findAll(): Promise<Information_blocks[]> {
        return this.inform_blocksRepository.find({ relations: ['courses'] });
    }
  
    async findOne(id: number): Promise<Information_blocks | any> {
        const inform_blocks = await this.inform_blocksRepository.findOne({
        where: { id },
        relations: ['courses'],
        });
        return inform_blocks;
    }

    async create(
        name: string,
        description: string,
        status: InformBlocksStatus,
        test_numbers: number[],
        lecture_numbers: number[],
        lab_numbers: number[],
    ): Promise<Information_blocks> {
        const inform_blocks = new Information_blocks();
        inform_blocks.name = name;
        inform_blocks.description = description;
        inform_blocks.status = status;
        inform_blocks.test_numbers = test_numbers;
        inform_blocks.lecture_numbers = lecture_numbers;
        inform_blocks.lab_numbers = lab_numbers;
        return this.inform_blocksRepository.save(inform_blocks);
    }

    async update(id: number, updateInformationBlocksDto: UpdateInformationBlocksDto): Promise<Information_blocks> {
        const inform_blocks = await this.inform_blocksRepository.findOne({ where: { id } });

        if (!inform_blocks) {
            throw new NotFoundException(`Inform_blocks with id ${id} not found`);
        }

        Object.assign(inform_blocks, updateInformationBlocksDto);

        if (updateInformationBlocksDto.courses) {
        const courses = await this.coursesRepository.find({where: {id: In(updateInformationBlocksDto.courses)}});
        inform_blocks.courses = courses;
        }

        return this.inform_blocksRepository.save(inform_blocks);
    }

    async remove(id: number): Promise<void> {
        const inform_blocks = await this.inform_blocksRepository.findOne({ where: { id } });

        if (!inform_blocks) {
            throw new NotFoundException(`Inform_blocks with id ${id} not found`);
        }

        await this.inform_blocksRepository.remove(inform_blocks);
    }
}