import { Controller, Delete, Query, HttpException, HttpStatus } from '@nestjs/common';
import { DeleteFilesService } from './deletefiles.service';

@Controller('deletefiles')
export class DeleteFilesController {
  constructor(private readonly deleteService: DeleteFilesService) {}

  @Delete()
  async deleteFileOrDirectory(@Query('path') filePath: string) {
    // Проверяем, что путь передан
    if (!filePath) {
      throw new HttpException(
        'Необходим параметр path',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      // Вызываем сервис для удаления
      await this.deleteService.deleteFileOrDirectory(filePath);
      // Возвращаем успешный ответ
      return { message: 'Успешно удалено', path: filePath };
    } catch (error) {
      // Обрабатываем возможные ошибки
      throw new HttpException(
        error.message || 'Ошибка при удалении файла или директории',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}