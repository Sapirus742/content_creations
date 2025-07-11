import { MigrationInterface, QueryRunner } from "typeorm";

export class PopulateCoursesAndInformationBlocks1751619322656 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
    // Вставляем начальные данные в таблицу 'courses'
    await queryRunner.query(`
      INSERT INTO courses (name, description) VALUES
      ('Алгоритмы и структуры данных', 'Курс для начинающих, охватывающий фундаментальные концепции алгоритмизации. Вы освоите ключевые структуры данных и алгоритмы, научитесь анализировать их сложность и применять в реальных задачах'),
      ('Алгебра и геометрия', 'Курс объединяет основы линейной алгебры и аналитической геометрии, формируя математическую базу для изучения инженерных дисциплин, физики и компьютерных наук. Студенты освоят аппарат векторных пространств, линейных преобразований и геометрических структур.'),
      ('Дискретная математика', 'Курс изучает дискретные структуры, важные для компьютерных наук и криптографии. Темы включают логику, комбинаторику и теорию графов, формируя основу для алгоритмических задач.'),
      ('Информатика', 'Курс направлен на формирование базовой цифровой грамотности, алгоритмического мышления и навыков работы с информационными технологиями. Учащиеся знакомятся с основами программирования, принципами функционирования компьютеров, а также этическими и практическими аспектами использования цифровых ресурсов.'),
      ('Математический анализ', 'Курс охватывает дифференциальное и интегральное исчисление, исследуя пределы, непрерывность и ряды. Приложения включают физику, экономику и машинное обучение.');
    `);

    // Вставляем начальные данные в таблицу 'information_blocks'
    await queryRunner.query(`
      INSERT INTO information_blocks (name, description, status, test_numbers, lecture_numbers, lab_numbers) VALUES
      ('Введение в алгоритмы, асимптотика и анализ', 'Понимание и анализ алгоритмов, их асимптотика.', 'Ready', '{3,5}', '{1,2,4}', '{}'),
      ('Рекурсия и алгоритмы сортировки', 'Изучение различных сортировок данных и понятие о рекурсии.', 'Ready', '{4,9,12,13}', '{1,5,7,10}', '{2,3,6,8,11}'),
      ('Динамические структуры и алгоритмы их обработки', 'Изучение различных динамических структур, алгоритмов их обработки и способов использования.', 'Ready', '{11}', '{1,3,5,7,9}', '{2,4,6,8,10}'),
      ('Жадные алгоритмы и динамическое программирование', 'Объяснение "жадных алгоритмов" и изучение методов динамического программирования.', 'Ready', '{2,4,13}', '{1,3,5,7,9,11}', '{6,8,10,12}'),
      ('Хеш-таблицы, хеш-функции и их применение', 'Изучение хеширования и его применения в алгоритмах.', 'Ready', '{2,4,9}', '{1,3,5,7}', '{6,8}'),
      ('Основы алгоритмов на графах и деревьях', 'Изучение алгоритмов на графах и методов работы с ними.', 'Ready', '{2,4,9}', '{1,3,5,7}', '{6,8}'),
      ('Куча, пирамидальная сортировка и декартово дерево поиска', 'Понятие о куче, пирамидальной сортировке и декартовом дереве, а так же способах их применения.', 'Ready', '{2,4,7,10,12}', '{1,3,6,9}', '{5,8,11}'),
      ('Алгоритмы балансировки деревьев поиска', 'Изучение методов балансировки деревьев поиска.', 'Ready', '{2,4,6,9}', '{1,3,5,7}', '{8}'),
      ('Линейная алгебра; матрицы, определители и ранг', '', 'Ready', '{}', '{1,2,3,4,5,6,7}', '{}'),
      ('Методы решения систем линейных уравнений', '', 'Ready', '{}', '{1,2,3,4,5,6}', '{}'),
      ('Основные понятия и определения векторной алгебры', '', 'Ready', '{}', '{1,2,3,4,5}', '{}'),
      ('Векторная алгебра; скалярное, векторное и смешанное произведения', '', 'Ready', '{}', '{1,2,3,4,5,6}', '{}'),
      ('Аналитическая геометрия; системы координат и прямые на плоскости', '', 'Ready', '{}', '{1,2,3}', '{}'),
      ('Аналитическая геометрия; уравнения плоскостей, прямых, взаимное расположение объектов и кривые второго порядка', '', 'Ready', '{}', '{1,2,3,4,5,6,7,8,9,10}', '{}'),
      ('Дискретная математика; множества, комбинаторика и теория графов', '', 'Ready', '{}', '{1,2,3}', '{}'),
      ('Теория множеств; алгебраические структуры и нечеткие множества', '', 'Ready', '{}', '{1,2}', '{}'),
      ('Теория множеств; декартово произведение как основа отношений', '', 'Ready', '{}', '{1,2}', '{}'),
      ('Бинарные отношения; свойства, эквивалентность, частичный порядок и диаграммы Хассе', '', 'Ready', '{}', '{1,2,3,4,5,6,7}', '{}'),
      ('Дискретная математика; функции, графы и их представление в структурах данных', '', 'Ready', '{}', '{1,2,3,4,5,6,7}', '{}'),
      ('Структура графов; операции, изоморфизм и матричные модели', '', 'Ready', '{}', '{1,2,3,4,5,6}', '{}'),
      ('Классические задачи и алгоритмы теории графов; циклы, деревья, раскраски и оптимизация', '', 'Ready', '{}', '{1,2,3,4,5,6,7,8}', '{}'),
      ('Основы информатики; понятие информации, её виды, свойства и кодирование данных', '', 'Ready', '{}', '{1,2,3,4,5,6,7}', '{}'),
      ('Основы информатики; системы счисления, математическая логика и логические элементы ЭВМ', '', 'Ready', '{}', '{1,2,3,4,5}', '{}'),
      ('Информатика; история вычислительной техники и основы работы в Microsoft Word', '', 'Ready', '{}', '{1,2,3,4,5,6,7,8,9,10}', '{}'),
      ('Программное обеспечение; классификация, операционные системы и работа с Windows и Unix', '', 'Ready', '{}', '{1,2,3,4}', '{}'),
      ('Освоение Word и Excel; документы, таблицы и визуализация', '', 'Ready', '{}', '{1,2,3,4}', '{}'),
      ('Создание презентаций, работа с графикой и базами данных; профессиональные инструменты в Microsoft Office', '', 'Ready', '{}', '{1,2,3,4,5,6,7,8}', '{}'),
      ('Эволюция компьютерных сетей от локальных экспериментов к глобальному интернету', '', 'Ready', '{}', '{1,2}', '{}'),
      ('Функции в математическом анализе; определение, свойства, классификация, графики и преобразования', '', 'Ready', '{}', '{1,2,3,4,5,6,7,8,9}', '{}'),
      ('Теория пределов; числовые последовательности, функции, замечательные пределы и методы вычислений', '', 'Ready', '{}', '{1,2,3}', '{}'),
      ('Дифференциальное исчисление функций нескольких переменных и основы непрерывности', '', 'Ready', '{}', '{1,2,3,4,5,6,7,8}', '{}'),
      ('Дифференцирование функций; методы вычисления производных, дифференциалы и их практическое применение', '', 'Ready', '{}', '{1,2,3,4,5,6,7,8}', '{}'),
      ('Дифференциальное исчисление от фундаментальных теорем до экстремумов функций с методом Лагранжа', '', 'Ready', '{}', '{1,2,3,4,5,6,7,8,9,10}', '{}'),
      ('Математический анализ; аппроксимация Тейлора, правило Лопиталя, исследование функций и оптимизация', '', 'Ready', '{}', '{1,2,3,4,5,6,7}', '{}');
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
      ((SELECT id FROM courses WHERE name = 'Алгоритмы и структуры данных'), (SELECT id FROM information_blocks WHERE name = 'Алгоритмы балансировки деревьев поиска')),
      ((SELECT id FROM courses WHERE name = 'Алгебра и геометрия'), (SELECT id FROM information_blocks WHERE name = 'Линейная алгебра; матрицы, определители и ранг')),
      ((SELECT id FROM courses WHERE name = 'Алгебра и геометрия'), (SELECT id FROM information_blocks WHERE name = 'Методы решения систем линейных уравнений')),
      ((SELECT id FROM courses WHERE name = 'Алгебра и геометрия'), (SELECT id FROM information_blocks WHERE name = 'Основные понятия и определения векторной алгебры')),
      ((SELECT id FROM courses WHERE name = 'Алгебра и геометрия'), (SELECT id FROM information_blocks WHERE name = 'Векторная алгебра; скалярное, векторное и смешанное произведения')),
      ((SELECT id FROM courses WHERE name = 'Алгебра и геометрия'), (SELECT id FROM information_blocks WHERE name = 'Аналитическая геометрия; системы координат и прямые на плоскости')),
      ((SELECT id FROM courses WHERE name = 'Алгебра и геометрия'), (SELECT id FROM information_blocks WHERE name = 'Аналитическая геометрия; уравнения плоскостей, прямых, взаимное расположение объектов и кривые второго порядка')),
      ((SELECT id FROM courses WHERE name = 'Дискретная математика'), (SELECT id FROM information_blocks WHERE name = 'Дискретная математика; множества, комбинаторика и теория графов')),
      ((SELECT id FROM courses WHERE name = 'Дискретная математика'), (SELECT id FROM information_blocks WHERE name = 'Теория множеств; алгебраические структуры и нечеткие множества')),
      ((SELECT id FROM courses WHERE name = 'Дискретная математика'), (SELECT id FROM information_blocks WHERE name = 'Теория множеств; декартово произведение как основа отношений')),
      ((SELECT id FROM courses WHERE name = 'Дискретная математика'), (SELECT id FROM information_blocks WHERE name = 'Бинарные отношения; свойства, эквивалентность, частичный порядок и диаграммы Хассе')),
      ((SELECT id FROM courses WHERE name = 'Дискретная математика'), (SELECT id FROM information_blocks WHERE name = 'Дискретная математика; функции, графы и их представление в структурах данных')),
      ((SELECT id FROM courses WHERE name = 'Дискретная математика'), (SELECT id FROM information_blocks WHERE name = 'Структура графов; операции, изоморфизм и матричные модели')),
      ((SELECT id FROM courses WHERE name = 'Дискретная математика'), (SELECT id FROM information_blocks WHERE name = 'Классические задачи и алгоритмы теории графов; циклы, деревья, раскраски и оптимизация')),
      ((SELECT id FROM courses WHERE name = 'Информатика'), (SELECT id FROM information_blocks WHERE name = 'Основы информатики; понятие информации, её виды, свойства и кодирование данных')),
      ((SELECT id FROM courses WHERE name = 'Информатика'), (SELECT id FROM information_blocks WHERE name = 'Основы информатики; системы счисления, математическая логика и логические элементы ЭВМ')),
      ((SELECT id FROM courses WHERE name = 'Информатика'), (SELECT id FROM information_blocks WHERE name = 'Информатика; история вычислительной техники и основы работы в Microsoft Word')),
      ((SELECT id FROM courses WHERE name = 'Информатика'), (SELECT id FROM information_blocks WHERE name = 'Программное обеспечение; классификация, операционные системы и работа с Windows и Unix')),
      ((SELECT id FROM courses WHERE name = 'Информатика'), (SELECT id FROM information_blocks WHERE name = 'Освоение Word и Excel; документы, таблицы и визуализация')),
      ((SELECT id FROM courses WHERE name = 'Информатика'), (SELECT id FROM information_blocks WHERE name = 'Создание презентаций, работа с графикой и базами данных; профессиональные инструменты в Microsoft Office')),
      ((SELECT id FROM courses WHERE name = 'Информатика'), (SELECT id FROM information_blocks WHERE name = 'Эволюция компьютерных сетей от локальных экспериментов к глобальному интернету')),
      ((SELECT id FROM courses WHERE name = 'Математический анализ'), (SELECT id FROM information_blocks WHERE name = 'Функции в математическом анализе; определение, свойства, классификация, графики и преобразования')),
      ((SELECT id FROM courses WHERE name = 'Математический анализ'), (SELECT id FROM information_blocks WHERE name = 'Теория пределов; числовые последовательности, функции, замечательные пределы и методы вычислений')),
      ((SELECT id FROM courses WHERE name = 'Математический анализ'), (SELECT id FROM information_blocks WHERE name = 'Дифференциальное исчисление функций нескольких переменных и основы непрерывности')),
      ((SELECT id FROM courses WHERE name = 'Математический анализ'), (SELECT id FROM information_blocks WHERE name = 'Дифференцирование функций; методы вычисления производных, дифференциалы и их практическое применение')),
      ((SELECT id FROM courses WHERE name = 'Математический анализ'), (SELECT id FROM information_blocks WHERE name = 'Дифференциальное исчисление от фундаментальных теорем до экстремумов функций с методом Лагранжа')),
      ((SELECT id FROM courses WHERE name = 'Математический анализ'), (SELECT id FROM information_blocks WHERE name = 'Математический анализ; аппроксимация Тейлора, правило Лопиталя, исследование функций и оптимизация'));
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