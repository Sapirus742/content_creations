import { MigrationInterface, QueryRunner } from "typeorm";

export class PopulateCoursesAndInformationBlocks1751619322656 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
    // Вставляем начальные данные в таблицу 'courses'
    await queryRunner.query(`
      INSERT INTO courses (name, description) VALUES
      ('Алгоритмы и структуры данных', 'Курс для начинающих, охватывающий фундаментальные концепции алгоритмизации. Вы освоите ключевые структуры данных и алгоритмы, научитесь анализировать их сложность и 
      применять в реальных задачах');
    `);

    // Вставляем начальные данные в таблицу 'information_blocks'
    await queryRunner.query(`
      INSERT INTO information_blocks (name, description, tegs, link_to_folder, test_numbers, lecture_numbers, lab_numbers) VALUES
      ('Введение в алгоритмы, асимптотика и анализ', 'Понимание и анализ алгоритмов, их асимптотика.', '{"алгоритмы", "основы"}', 'content_creations\\database\\Пул инфоблоков\\Введение в алгоритмы, асимптотика и анализ', '{3,5}', '{1,2,4}', '{}'),
      ('Рекурсия и алгоритмы сортировки', 'Изучение различных сортировок данных и понятие о рекурсии.', '{"алгоритмы", "основы", "сортировки", "программирование"}', 'content_creations\\database\\Пул инфоблоков\\Рекурсия и алгоритмы сортировки', '{1,5,7,10}', '{4,9,12,13}', '{2,3,6,8,11}'),
      ('Динамические структуры и алгоритмы их обработки', 'Изучение различных динамических структур, алгоритмов их обработки и способов использования.', '{"алгоритмы", "основы", "структуры данных", "программирование"}', 'content_creations\\database\\Пул инфоблоков\\Динамические структуры и алгоритмы их обработки', '{1,3,5,7,9}', '{11}', '{2,4,6,8,10}'),
      ('Жадные алгоритмы и динамическое программирование', 'Объяснение "жадных алгоритмов" и изучение методов динамического программирования.', '{"алгоритмы", "основы", "программирование"}', 'content_creations\\database\\Пул инфоблоков\\Жадные алгоритмы и динамическое программирование', '{1,3,5,7,9,11}', '{2,4,13}', '{6,8,10,12}'),
      ('Хеш-таблицы, хеш-функции и их применение', 'Изучение хеширования и его применения в алгоритмах.', '{"алгоритмы", "основы", "хеширование", "программирование"}', 'content_creations\\database\\Пул инфоблоков\\Хеш-таблицы, хеш-функции и их применение', '{1,3,5,7}', '{2,4,9}', '{6,8}'),
      ('Основы алгоритмов на графах и деревьях', 'Изучение алгоритмов на графах и методов работы с ними.', '{"алгоритмы", "основы", "графы"}', 'content_creations\\database\\Пул инфоблоков\\Основы алгоритмов на графах и деревьях', '{1,3,5,7}', '{2,4,9}', '{6,8}'),
      ('Куча, пирамидальная сортировка и декартово дерево поиска', 'Понятие о куче, пирамидальной сортировке и декартовом дереве, а так же способах их применения.', '{"алгоритмы", "основы", "сортировки", "графы", "программирование"}', 'content_creations\\database\\Пул инфоблоков\\Куча, пирамидальная сортировка и декартово дерево поиска', '{1,3,6,9}', '{2,4,7,10,12}', '{5,8,11}'),
      ('Алгоритмы балансировки деревьев поиска', 'Изучение методов балансировки деревьев поиска.', '{"алгоритмы", "основы", "графы", "программирование"}', 'content_creations\\database\\Пул инфоблоков\\Алгоритмы балансировки деревьев поиска', '{1,3,5,7}', '{2,4,6,9}', '{8}');
    `);

    // Устанавливаем отношения между курсами и информационными блоками
    // Пример: 'Введение в программирование' включает 'Переменные и типы данных'
    await queryRunner.query(`
      INSERT INTO courses_information_blocks (course_id, information_block_id) VALUES
      ((SELECT id FROM courses WHERE name = 'Алгоритмы и структуры данных'), (SELECT id FROM information_blocks WHERE name = 'Введение в алгоритмы, асимптотика и анализ')),
      ((SELECT id FROM courses WHERE name = 'Алгоритмы и структуры данных'), (SELECT id FROM information_blocks WHERE name = 'Рекурсия и алгоритмы сортировки')),
      ((SELECT id FROM courses WHERE name = 'Алгоритмы и структуры данных'), (SELECT id FROM information_blocks WHERE name = 'Динамические структуры и алгоритмы их обработки')),
      ((SELECT id FROM courses WHERE name = 'Алгоритмы и структуры данных'), (SELECT id FROM information_blocks WHERE name = 'Жадные алгоритмы и динамическое программирование')),
      ((SELECT id FROM courses WHERE name = 'Алгоритмы и структуры данных'), (SELECT id FROM information_blocks WHERE name = 'Хеш-таблицы, хеш-функции и их применение')),
      ((SELECT id FROM courses WHERE name = 'Алгоритмы и структуры данных'), (SELECT id FROM information_blocks WHERE name = 'Основы алгоритмов на графах и деревьях')),
      ((SELECT id FROM courses WHERE name = 'Алгоритмы и структуры данных'), (SELECT id FROM information_blocks WHERE name = 'Куча, пирамидальная сортировка и декартово дерево поиска')),
      ((SELECT id FROM courses WHERE name = 'Алгоритмы и структуры данных'), (SELECT id FROM information_blocks WHERE name = 'Алгоритмы балансировки деревьев поиска'));
    `);

    // Дополнительные отношения можно добавить при необходимости
    // Пример: Добавим 'Переменные и типы данных' также к 'Структуры данных и алгоритмы'.
    /*await queryRunner.query(`
      INSERT INTO courses_information_blocks (course_id, information_block_id) VALUES
    `);*/
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