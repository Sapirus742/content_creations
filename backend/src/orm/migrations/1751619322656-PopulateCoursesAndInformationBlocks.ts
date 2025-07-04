import { MigrationInterface, QueryRunner } from "typeorm";

export class PopulateCoursesAndInformationBlocks1751619322656 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
    // Вставляем начальные данные в таблицу 'courses'
    await queryRunner.query(`
      INSERT INTO courses (name, description) VALUES
      ('Введение в программирование', 'Курс для начинающих, охватывающий фундаментальные концепции программирования.'),
      ('Структуры данных и алгоритмы', 'Продвинутый курс по эффективной организации данных и алгоритмическим техникам.'),
      ('Веб-разработка с React', 'Узнайте, как создавать современные веб-приложения с использованием React.');
    `);

    // Вставляем начальные данные в таблицу 'information_blocks'
    await queryRunner.query(`
      INSERT INTO information_blocks (name, description, tegs, link_to_folder, test_numbers, lecture_numbers, lab_numbers) VALUES
      ('Переменные и типы данных', 'Понимание переменных и основных типов данных в программировании.', '{"программирование", "основы"}', '/path/to/variables', '{1,2}', '{1}', '{}'),
      ('Массивы и связные списки', 'Изучение различных структур данных для хранения коллекций данных.', '{"структуры данных", "массивы", "связные списки"}', '/path/to/arrays', '{3}', '{2}', '{1}'),
      ('React Компоненты', 'Создание многократно используемых UI-компонентов с помощью React.', '{"react", "компоненты", "frontend"}', '/path/to/react', '{4,5}', '{3}', '{2}');
    `);

    // Устанавливаем отношения между курсами и информационными блоками
    // Пример: 'Введение в программирование' включает 'Переменные и типы данных'
    await queryRunner.query(`
      INSERT INTO courses_information_blocks (course_id, information_block_id) VALUES
      ((SELECT id FROM courses WHERE name = 'Введение в программирование'), (SELECT id FROM information_blocks WHERE name = 'Переменные и типы данных')),
      ((SELECT id FROM courses WHERE name = 'Структуры данных и алгоритмы'), (SELECT id FROM information_blocks WHERE name = 'Массивы и связные списки')),
      ((SELECT id FROM courses WHERE name = 'Веб-разработка с React'), (SELECT id FROM information_blocks WHERE name = 'React Компоненты'));
    `);

    // Дополнительные отношения можно добавить при необходимости
    // Пример: Добавим 'Переменные и типы данных' также к 'Структуры данных и алгоритмы'.
    await queryRunner.query(`
      INSERT INTO courses_information_blocks (course_id, information_block_id) VALUES
      ((SELECT id FROM courses WHERE name = 'Структуры данных и алгоритмы'), (SELECT id FROM information_blocks WHERE name = 'Переменные и типы данных'))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Сначала удаляем отношения
    await queryRunner.query(`DELETE FROM courses_information_blocks`);

    // Удаляем вставленные данные из 'information_blocks'
    await queryRunner.query(`DELETE FROM information_blocks`);

    // Удаляем вставленные данные из 'courses'
    await queryRunner.query(`DELETE FROM courses`);
  }
}