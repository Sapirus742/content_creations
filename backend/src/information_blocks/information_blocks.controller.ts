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
import { Information_blocksService } from './information_blocks.service';
import { Information_blocks } from 'src/orm/information_blocks.entity';
import { CreateInformationBlocksDto, UpdateInformationBlocksDto } from 'src/common/types';

@Controller('inform_blocks')

export class Inform_blocksController {
    private readonly logger = new Logger(Inform_blocksController.name);

    constructor(private inform_blocksService: Information_blocksService) {}

    @Get()
    async findAll(): Promise<Information_blocks[]> {
        return this.inform_blocksService.findAll();
    }
    
    @Get(':id')
    async findOne(@Param('id') id: number): Promise<Information_blocks> {
        return this.inform_blocksService.findOne(id);
    }

    @Post()
    async create(@Body() inform_blocks: CreateInformationBlocksDto): Promise<Information_blocks> {
        return this.inform_blocksService.create(
            inform_blocks.name,
            inform_blocks.description,
            inform_blocks.status,
            inform_blocks.test_numbers,
            inform_blocks.lecture_numbers,
            inform_blocks.lab_numbers,
        );
    }
    
    @Patch(':id')
    async update(@Param('id') id: number, @Body() updateInform_blocksDto: UpdateInformationBlocksDto): Promise<Information_blocks> {
        return this.inform_blocksService.update(id, updateInform_blocksDto);
    }
    
    @Delete(':id')
    async remove(@Param('id') id: number): Promise<void> {
        return this.inform_blocksService.remove(id);
    }
}