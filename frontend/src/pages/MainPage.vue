<template>
  <div class="fullscreen bg-grey-2 flex flex-center">
    <div class="container q-pa-md" style="max-width: 800px;">
      <!-- Логотип и заголовок платформы -->
      <div class="text-center q-mb-xl">
        <div class="text-h3 text-primary q-mb-sm">Платформа непрерывного образования</div>
        <div class="text-subtitle1 text-grey-8">Автоматизированное создание учебных курсов</div>
      </div>

      <!-- Основной поисковый блок -->
      <q-card class="q-pa-lg">
        <q-card-section class="text-center">
          <div class="text-h5 q-mb-md">Создать курс</div>
          
          <q-input
            v-model="searchQuery"
            outlined
            placeholder="Введите название курса или ключевые слова"
            class="q-mb-md"
            @keyup.enter="handleSearch"
            :error="isSearchError"
            error-message="Введите поисковый запрос"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>

          <div class="row justify-center q-gutter-sm">
            <q-btn
              color="primary"
              label="Найти курс"
              icon="search"
              @click="handleSearch"
            />
            <q-item-label class="text-h4"></q-item-label>
            <q-btn
              color="secondary"
              label="Создать новый"
              icon="add"
              to="/create-course"
            />
            <q-btn
              color="secondary"
              label="Редактировать созданные"
              icon="edit"
              to="/edit-course"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

const router = useRouter();
const $q = useQuasar();
const searchQuery = ref('');
const isSearchError = ref(false);

const handleSearch = () => {
  if (!searchQuery.value.trim()) {
    isSearchError.value = true;
    $q.notify({
      type: 'negative',
      message: 'Пожалуйста, введите поисковый запрос',
      position: 'top'
    });
    return;
  }
  
  isSearchError.value = false;
  searchCourses();
};

const searchCourses = () => {
  if (searchQuery.value.trim()) {
    router.push({ name: 'SearchCourses', query: { q: searchQuery.value } });
  }
};

</script>

<style scoped>
.container {
  width: 100%;
  height: 50%;
}
</style>