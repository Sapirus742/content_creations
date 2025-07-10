import { api } from './axios';
import { CoursesDto, CreateCoursesDto, UpdateCoursesDto } from '../../../backend/src/common/types';

export async function getAll(): Promise<CoursesDto[]> {
  const response = await api.get('/course');
  if (response.status == 200) {
    return response.data;
  }
  return [];
}

export async function get(id: number): Promise<CoursesDto | undefined> {
  const response = await api.get('/course/' + id);
  if (response.status == 200) {
    return response.data;
  }
  return;
}

export async function create(
  newCourse: CreateCoursesDto
): Promise<CoursesDto> {  // Убрали undefined из возвращаемого типа
  const response = await api.post('/course', newCourse);
  if (response.status !== 201) {
    throw new Error(response.data?.message || 'Ошибка создания курса');
  }
  return response.data;
}

export async function update(
  id: number,
  payload: UpdateCoursesDto
): Promise<CoursesDto> {
  const response = await api.patch(`/course/${id}`, payload);
  return response.data;
}

export async function remove(id: number): Promise<void> {
  try {
    const response = await api.delete('/course/' + id);
    if (response.status !== 200 && response.status !== 204) {
      throw new Error(response.data?.message || 'Ошибка удаления команды');
    }
  } catch (error) {
    console.error('[API] Ошибка удаления команды:', error);
    throw error;
  }
}