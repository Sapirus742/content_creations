import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToMany,
} from 'typeorm';   
import { Courses } from './courses.entity';
import { InformationBlocksDto } from 'src/common/types';
  

@Entity()
export class Information_blocks {
  
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    name: string;
    
    @Column({default:''})
    description: string;

    @Column({type: 'varchar', array: true, default: '{}'})
    tegs: string[];

    @Column({type: 'varchar', array: true, default: '{}'})
    test_numbers: number[];

    @Column({type: 'varchar', array: true, default: '{}'})
    lecture_numbers: number[];

    @Column({type: 'varchar', array: true, default: '{}'})
    lab_numbers: number[];

    @ManyToMany(() => Courses, courses => courses.information_blocks)
    courses: Courses[];

    getInformationBlocksDto(): InformationBlocksDto {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            tegs: this.tegs,
            test_numbers: this.test_numbers,
            lecture_numbers: this.lecture_numbers,
            lab_numbers: this.lab_numbers,
            courses: (this.courses || []).map(course => {
                try {
                    return course.getCoursesDto();
                } catch {
                    return null; // Обработка несвязанных объектов
                }
            }).filter(course => course !== null)
        };
    }
}