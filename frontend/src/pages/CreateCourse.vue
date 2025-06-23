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
    <div class="text-h4 q-mb-md">Создание нового курса</div>
    
    <q-stepper v-model="step" vertical color="primary" animated>
      <!-- Шаг 1: Основная информация -->
      <q-step name="basic" title="Основная информация" icon="info">
        <q-input
          v-model="course.title"
          label="Название курса*"
          outlined
          class="q-mb-md"
          :rules="[val => !!val || 'Обязательное поле']"
        />
        
        <q-input
          v-model="course.description"
          label="Описание курса"
          type="textarea"
          outlined
        />
        
        <q-stepper-navigation>
          <q-btn @click="step = 'content'" color="primary" label="Продолжить" />
        </q-stepper-navigation>
      </q-step>

      <!-- Шаг 2: Контент -->
      <q-step name="content" title="Содержание курса" icon="library_books">
        <div class="text-h6 q-mb-md">Добавьте материалы курса</div>
        
        <div class="row q-gutter-md q-mb-md">
          <q-btn 
            color="primary" 
            icon="add" 
            label="Лекция" 
            @click="addBlock('lecture')"
          />
          <q-btn 
            color="primary" 
            icon="add" 
            label="Практика" 
            @click="addBlock('practice')"
          />
          <q-btn 
            color="primary" 
            icon="add" 
            label="Тест" 
            @click="addBlock('test')"
          />
        </div>
        
        <q-list bordered separator>
          <q-item v-for="(block, index) in course.blocks" :key="index">
            <q-item-section>
              <q-item-label>{{ blockTitles[block.type] }} {{ index + 1 }}</q-item-label>
              <q-item-label caption v-if="block.title">{{ block.title }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn icon="edit" flat round @click="editBlock(index)" />
              <q-btn icon="delete" flat round @click="removeBlock(index)" />
            </q-item-section>
          </q-item>
        </q-list>
        
        <q-stepper-navigation>
          <q-btn @click="step = 'basic'" color="grey" label="Назад" class="q-mr-sm" />
          <q-btn @click="submitCourse" color="primary" label="Создать курс" />
        </q-stepper-navigation>
      </q-step>
    </q-stepper>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const step = ref<'basic' | 'content'>('basic'); // Явно указываем возможные значения

const goToMainPage = () => {
  router.push('/');
};

// Типы для блока курса
type BlockType = 'lecture' | 'practice' | 'test';

interface CourseBlock {
  type: BlockType;
  title?: string;
  content?: string;
}

interface Course {
  title: string;
  discipline: string;
  description: string;
  blocks: CourseBlock[];
}

const course = ref<Course>({
  title: '',
  discipline: '',
  description: '',
  blocks: []
});

// Явно типизируем blockTitles и используем Record
const blockTitles: Record<BlockType, string> = {
  lecture: 'Лекция',
  practice: 'Практическое задание',
  test: 'Тест'
};

const addBlock = (type: BlockType) => {
  course.value.blocks.push({
    type,
    title: '',
    content: ''
  });
};

const editBlock = (index: number) => {
  // Реализация редактирования блока
  console.log('Редактирование блока:', index);
};

const removeBlock = (index: number) => {
  course.value.blocks.splice(index, 1);
};

const submitCourse = async () => {
  // Отправка данных на сервер
  console.log('Создание курса:', course.value);
  router.push('/courses');
};
</script>