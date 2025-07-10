import { api } from './axios';
import { CreateInformationBlocksDto, InformationBlocksDto, UpdateInformationBlocksDto } from '../../../backend/src/common/types';

export async function getAll(): Promise<InformationBlocksDto[]> {
  const response = await api.get('/inform_blocks');
  if (response.status == 200) {
    return response.data;
  }
  return [];
}

export async function get(id: number): Promise<InformationBlocksDto | undefined> {
  const response = await api.get('/inform_blocks/' + id);
  if (response.status == 200) {
    return response.data;
  }
  return;
}

export async function create(
  newBlock: CreateInformationBlocksDto
): Promise<InformationBlocksDto> {
  const response = await api.post('/inform_blocks', newBlock);
  if (response.status == 201) {
    return response.data;
  }
  throw new Error('Ошибка создания блока');
}

export async function update(
  id: number,
  payload: UpdateInformationBlocksDto
): Promise<InformationBlocksDto> {
  const response = await api.patch(`/inform_blocks/${id}`, payload);
  return response.data;
}

export async function remove(id: number): Promise<void> {
  try {
    const response = await api.delete('/inform_blocks/' + id);
    if (response.status !== 200 && response.status !== 204) {
      throw new Error(response.data?.message || 'Ошибка удаления команды');
    }
  } catch (error) {
    console.error('[API] Ошибка удаления команды:', error);
    throw error;
  }
}