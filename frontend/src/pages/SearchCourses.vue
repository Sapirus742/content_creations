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
        @keyup.enter="performSearch"
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
      <q-btn
        color="primary"
        icon="search"
        label="Поиск"
        @click="performSearch"
        class="q-ml-sm"
      />
    </div>

    <div v-if="loading" class="text-center q-pa-lg">
      <q-spinner size="xl" color="primary" />
    </div>

    <div v-else>
      <div class="text-h5 q-mb-md">Найдено курсов: {{ courses.length }}</div>
      
      <q-list bordered separator>
        <q-item 
          v-for="course in courses" 
          :key="course.id"
          clickable
          v-ripple
          @click="goToCourse(course.id)"
        >
          <q-item-section>
            <q-item-label>{{ course.name }}</q-item-label>
            <q-item-label caption>{{ course.description }}</q-item-label>
            
            <div class="q-mt-md">
              <div v-for="(block, index) in course.information_blocks" :key="block.id" class="q-mb-lg">
                <div class="text-subtitle1 q-mb-sm">Блок {{ index + 1 }}: {{ block.name }}</div>
                <q-list bordered dense>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="menu_book" color="red" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Лекции</q-item-label>
                      <q-item-label caption>Количество: {{ block.lecture_numbers.length }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="assignment" color="green" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Тесты</q-item-label>
                      <q-item-label caption>Количество: {{ block.test_numbers.length }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  
                  <q-item v-if="block.lab_numbers.length > 0">
                    <q-item-section avatar>
                      <q-icon name="science" color="blue" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Лабораторные работы</q-item-label>
                      <q-item-label caption>Количество: {{ block.lab_numbers.length }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>
          </q-item-section>
          <q-item-section side>
            <q-icon name="chevron_right" />
          </q-item-section>
        </q-item>
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
import { getAll } from '../api/courses.api';
import { CoursesDto } from '../../../backend/src/common/types';

const $q = useQuasar();
const route = useRoute();
const router = useRouter();

const goToMainPage = () => {
  router.push({ name: 'MainPage' });
};

const searchQuery = ref(route.query.q?.toString() || '');
const loading = ref(false);
const courses = ref<CoursesDto[]>([]);

onMounted(async () => {
  await performSearch();
});

const performSearch = async () => {
  loading.value = true;
  try {
    const allCourses = await getAll();
    // Фильтруем курсы по поисковому запросу (в данном случае показываем все)
    courses.value = allCourses.filter(course => 
      course.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
    
    // Если ничего не найдено, но есть курс "Алгоритмы и структуры данных", показываем его
    if (courses.value.length === 0 && allCourses.length > 0) {
      courses.value = allCourses;
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Ошибка при загрузке курсов',
      position: 'top'
    });
    console.error('Ошибка при загрузке курсов:', error);
  } finally {
    loading.value = false;
  }
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