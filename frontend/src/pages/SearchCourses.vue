<template>
  <div class="q-pa-md">
    <q-btn
      flat
      color="primary"
      icon="arrow_back"
      label="На главную"
      @click="goToMainPage"
      class="q-mb-md"
    />
    <div class="row items-center q-mb-md">
      <q-input
        v-model="searchQuery"
        outlined
        placeholder="Продолжите поиск курсов..."
        class="col-grow"
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>

    <div v-if="loading" class="text-center q-pa-lg">
      <q-spinner size="xl" color="primary" />
    </div>

    <div v-else>
      <div v-if="route.query.predefined === 'true'" class="q-mb-lg">
        <q-banner inline-actions class="bg-blue-1 text-blue">
          <template v-slot:avatar>
            <q-icon name="info" color="blue" />
          </template>
          Просмотр созданного курса "{{ route.query.title }}"
          <template v-slot:action>
            <q-btn flat color="blue" label="Закрыть" @click="clearPredefinedView" />
          </template>
        </q-banner>
      </div>

      <div class="text-h5 q-mb-md">Найдено курсов: {{ courses.length }}</div>
      
      <q-list bordered separator>
        <template v-if="route.query.predefined === 'true'">
          <!-- Детализированный просмотр предопределенного курса -->
          <q-item>
            <q-item-section>
              <q-item-label class="text-h6">Прикладная информатика</q-item-label>
              <q-item-label caption>Информатика • 24 материалов</q-item-label>
              
              <div class="q-mt-md">
                <div v-for="(block, blockIndex) in predefinedCourseBlocks" :key="blockIndex" class="q-mb-lg">
                  <div class="text-subtitle1 q-mb-sm">Блок {{ blockIndex + 1 }}</div>
                  <q-list bordered dense>
                    <q-item v-for="(item, itemIndex) in block" :key="itemIndex">
                      <q-item-section avatar>
                        <q-icon :name="blockIcons[item.type]" :color="blockColors[item.type]" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ getBlockTitle(item.type) }}</q-item-label>
                        <q-item-label caption>{{ item.title }}</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-btn
                          color="primary"
                          icon="add"
                          label="Добавить"
                          @click="addBlock(item)"
                          outline
                        />
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </div>
            </q-item-section>
          </q-item>
        </template>
        <template v-else>
          <!-- Обычный список курсов -->
          <q-item 
            v-for="course in courses" 
            :key="course.id"
            clickable
            v-ripple
            @click="goToCourse(course.id)"
          >
            <q-item-section>
              <q-item-label>{{ course.title }}</q-item-label>
              <q-item-label caption>{{ course.discipline }} • {{ course.blocksCount }} материалов</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" />
            </q-item-section>
          </q-item>
        </template>
      </q-list>

      <div v-if="!courses.length" class="text-center q-pa-xl text-grey">
        <q-icon name="search_off" size="xl" class="q-mb-sm" />
        <div>Ничего не найдено. Попробуйте изменить параметры поиска.</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const route = useRoute();
const router = useRouter();

interface Course {
  id: number;
  title: string;
  discipline: string;
  blocksCount: number;
}

interface CourseBlock {
  type: 'lecture' | 'practice' | 'test';
  title: string;
  content: string;
}

const goToMainPage = () => {
  router.push({ name: 'MainPage' });
};

const clearPredefinedView = () => {
  router.push({ name: 'SearchCourses' });
};

const searchQuery = ref(route.query.search?.toString() || '');
const loading = ref(false);
const courses = ref<Course[]>([]);

// Настройки отображения блоков
const blockTitles = {
  lecture: 'Лекция',
  practice: 'Практическое занятие',
  test: 'Тест'
} as const;

const blockIcons = {
  lecture: 'picture_as_pdf',
  practice: 'code',
  test: 'assignment_turned_in'
};

const blockColors = {
  lecture: 'red',
  practice: 'blue',
  test: 'green'
};

// Предопределенные блоки курса "Прикладная информатика"
const predefinedCourseBlocks: CourseBlock[][] = [
  // Блок 1
  [
    { type: 'lecture', title: 'Введение в информатику', content: 'Основные понятия и термины' },
    { type: 'practice', title: 'Установка ПО', content: 'Установка и настройка необходимого программного обеспечения' },
    { type: 'test', title: 'Тест по основам', content: 'Проверка базовых знаний' }
  ],
  // Блок 2
  [
    { type: 'lecture', title: 'Алгоритмы и структуры данных', content: 'Основные алгоритмы и структуры данных' },
    { type: 'practice', title: 'Реализация алгоритмов', content: 'Практическое написание простых алгоритмов' },
    { type: 'test', title: 'Тест по алгоритмам', content: 'Проверка понимания алгоритмов' }
  ],
  // Блок 3
  [
    { type: 'lecture', title: 'Основы программирования', content: 'Введение в программирование' },
    { type: 'practice', title: 'Написание первой программы', content: 'Создание простой программы' },
    { type: 'test', title: 'Тест по основам программирования', content: 'Проверка базовых навыков программирования' }
  ],
  // Блок 4
  [
    { type: 'lecture', title: 'Базы данных', content: 'Основы работы с базами данных' },
    { type: 'practice', title: 'Создание простой БД', content: 'Разработка и наполнение базы данных' },
    { type: 'test', title: 'Тест по базам данных', content: 'Проверка знаний по БД' }
  ],
  // Блок 5
  [
    { type: 'lecture', title: 'Веб-разработка', content: 'Основы создания веб-приложений' },
    { type: 'practice', title: 'Создание веб-страницы', content: 'Разработка простого веб-сайта' },
    { type: 'test', title: 'Тест по веб-разработке', content: 'Проверка знаний по вебу' }
  ],
  // Блок 6
  [
    { type: 'lecture', title: 'Мобильная разработка', content: 'Основы создания мобильных приложений' },
    { type: 'practice', title: 'Прототип мобильного приложения', content: 'Создание простого мобильного приложения' },
    { type: 'test', title: 'Тест по мобильной разработке', content: 'Проверка знаний по мобильной разработке' }
  ],
  // Блок 7
  [
    { type: 'lecture', title: 'Искусственный интеллект', content: 'Введение в ИИ и машинное обучение' },
    { type: 'practice', title: 'Простой алгоритм ML', content: 'Реализация простого алгоритма машинного обучения' },
    { type: 'test', title: 'Тест по ИИ', content: 'Проверка базовых знаний по ИИ' }
  ],
  // Блок 8
  [
    { type: 'lecture', title: 'Кибербезопасность', content: 'Основы информационной безопасности' },
    { type: 'practice', title: 'Защита данных', content: 'Практические методы защиты информации' },
    { type: 'test', title: 'Тест по кибербезопасности', content: 'Проверка знаний по безопасности' }
  ]
];

const getBlockTitle = (type: 'lecture' | 'practice' | 'test'): string => {
  return blockTitles[type];
};

const addBlock = (block: CourseBlock) => {
  $q.notify({
    type: 'positive',
    message: `Добавлен блок: ${block.title}`,
    position: 'top'
  });
  // Здесь можно добавить логику для сохранения блока
  console.log('Добавлен блок:', block);
};

onMounted(async () => {
  if (route.query.predefined === 'true') {
    // Загружаем предопределенный курс
    courses.value = [{
      id: 1,
      title: 'Прикладная информатика',
      discipline: 'Информатика',
      blocksCount: 24 // 8 блоков × 3 элемента
    }];
  } else {
    await performSearch();
  }
});

const performSearch = async () => {
  loading.value = true;
  
  // Здесь будет запрос к API
  
  // Заглушка для демонстрации
  setTimeout(() => {
    courses.value = [
      { id: 1, title: 'Основы алгоритмов', discipline: 'Программирование', blocksCount: 12 },
      { id: 2, title: 'Линейная алгебра', discipline: 'Математика', blocksCount: 8 },
    ].filter(c => 
      c.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
    loading.value = false;
  }, 500);
};

const goToCourse = (id: number) => {
  router.push(`/course/${id}`);
};
</script>

<style scoped>
.q-item {
  transition: all 0.3s ease;
}

.q-item:hover {
  background-color: #f5f5f5;
}

.q-btn--outline {
  border: 1px solid currentColor;
}
</style>