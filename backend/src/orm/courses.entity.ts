import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    JoinTable,
    ManyToMany,
} from 'typeorm';   
import { Information_blocks } from './information_blocks.entity';
import { CoursesDto } from 'src/common/types';
  

@Entity()
export class Courses {
  
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    name: string;
    
    @Column({default:''})
    description: string;

    @ManyToMany(() => Information_blocks, ib => ib.courses)
    @JoinTable({
        name: 'courses_information_blocks', // Явное имя таблицы связи
        joinColumn: { name: 'course_id' },
        inverseJoinColumn: { name: 'information_block_id' }
    })
    information_blocks: Information_blocks[];

    getCoursesDto(): CoursesDto {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            information_blocks: (this.information_blocks || []).map(ib => {
                try {
                    return ib.getInformationBlocksDto();
                } catch {
                    return null; // Обработка случаев, когда связи не загружены
                }
            }).filter(ib => ib !== null)
        };
    }
}