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
            <q-item-label>{{ course.title }}</q-item-label>
            <q-item-label caption>{{ course.discipline }} • {{ course.blocksCount }} материалов</q-item-label>
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

const route = useRoute();
const router = useRouter();

const goToMainPage = () => {
  router.push({ name: 'MainPage' });
};

const searchQuery = ref(route.query.search?.toString() || '');
const selectedDiscipline = ref('');
const loading = ref(false);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const courses = ref<Array<any>>([]);

onMounted(async () => {
  await performSearch();
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
      c.title.toLowerCase().includes(searchQuery.value.toLowerCase()) &&
      (selectedDiscipline.value === '' || c.discipline === selectedDiscipline.value)
    );
    loading.value = false;
  }, 500);
};

const goToCourse = (id: number) => {
  router.push(`/course/${id}`);
};
</script>