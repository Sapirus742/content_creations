export enum InformBlocksStatus {
  changing = 'Changing',
  ready = 'Ready',
}

export type CoursesDto = {
    id: number;
    name: string;
    description: string;
    information_blocks: InformationBlocksDto[];
}

export interface CreateCoursesDto {
    name: string;
    description: string;
    information_blocks: number[];
}

export interface UpdateCoursesDto {
    name?: string;
    description?: string;
    information_blocks?: number[];
}

export type InformationBlocksDto = {
    id: number;
    name: string;
    description: string;
    status: InformBlocksStatus;
    test_numbers: number[];
    lecture_numbers: number[];
    lab_numbers: number[];
    courses: CoursesDto[];
}

export interface CreateInformationBlocksDto {
    name: string;
    description: string;
    status: InformBlocksStatus;
    test_numbers: number[];
    lecture_numbers: number[];
    lab_numbers: number[];
}

export interface UpdateInformationBlocksDto {
    name?: string;
    description?: string;
    status?: InformBlocksStatus;
    test_numbers?: number[];
    lecture_numbers?: number[];
    lab_numbers?: number[];
    courses?: number[];
}