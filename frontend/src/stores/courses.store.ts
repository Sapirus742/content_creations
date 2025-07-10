import { defineStore } from 'pinia';
import { 
  getAll as getAllCourses, 
  get as getCourse,
  create as createCourse,
  update as updateCourse,
  remove as deleteCourse 
} from '../api/courses.api';
import { api } from '../api/axios';
import { 
  CoursesDto, 
  CreateCoursesDto, 
  UpdateCoursesDto,
  InformationBlocksDto,
  CreateInformationBlocksDto
} from '../../../backend/src/common/types';

export const useCoursesStore = defineStore('courses', {
  state: () => ({
    courses: [] as CoursesDto[],
    currentCourse: null as CoursesDto | null,
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    getCourseById: (state) => (id: number) => {
      return state.courses.find(course => course.id === id);
    },
    sortedCourses: (state) => {
      return [...state.courses].sort((a, b) => a.name.localeCompare(b.name));
    },
  },

  actions: {
    async loadCourses() {
      this.isLoading = true;
      this.error = null;
      try {
        this.courses = await getAllCourses();
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Не удалось загрузить курсы';
        console.error('Ошибка загрузки курсов:', error);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchCourse(id: number): Promise<CoursesDto | null> {
      this.isLoading = true;
      this.error = null;
      try {
        const course = await getCourse(id);
        this.currentCourse = course || null;
        return course || null;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Ошибка загрузки курса';
        console.error('Ошибка загрузки курса:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async createNewCourse(courseData: CreateCoursesDto) {
      this.isLoading = true;
      try {
        const newCourse = await createCourse(courseData);
        if (!newCourse) {
          throw new Error('Не удалось создать курс: сервер вернул пустой ответ');
        }
        this.courses.push(newCourse);
        return newCourse;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Ошибка создания курса';
        console.error('Ошибка создания курса:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async createInformationBlock(blockData: CreateInformationBlocksDto): Promise<InformationBlocksDto> {
      this.isLoading = true;
      try {
        const response = await api.post('/inform_blocks', blockData);
        return response.data;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Ошибка создания блока';
        console.error('Ошибка создания блока:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async updateExistingCourse(id: number, updateData: UpdateCoursesDto) {
      this.isLoading = true;
      try {
        const updatedCourse = await updateCourse(id, updateData);
        const index = this.courses.findIndex(c => c.id === id);
        if (index !== -1) {
          this.courses[index] = updatedCourse;
        }
        return updatedCourse;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Ошибка обновления курса';
        console.error('Ошибка обновления курса:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteCourse(id: number) {
      this.isLoading = true;
      try {
        await deleteCourse(id);
        this.courses = this.courses.filter(course => course.id !== id);
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Ошибка удаления курса';
        console.error('Ошибка удаления курса:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    setCurrentCourse(id: number) {
      this.currentCourse = this.getCourseById(id) || null;
    },
  },
});