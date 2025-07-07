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
          class="q-mb-md"
        >
          <q-item-section>
            <q-item-label class="text-h6">{{ course.name }}</q-item-label>
            <q-item-label caption>{{ course.description }}</q-item-label>
            
            <!-- Аккордеон для блоков курса -->
            <q-expansion-item
              v-for="(block, blockIndex) in course.information_blocks"
              :key="block.id"
              :label="`Блок ${blockIndex + 1}: ${block.name}`"
              class="q-mt-md"
            >
              <!-- Лекции -->
              <div v-if="block.lecture_numbers.length > 0" class="q-mb-md">
                <div class="text-subtitle1 q-mb-sm">Лекции</div>
                <q-list bordered dense>
                  <q-item 
                    v-for="lectureNum in block.lecture_numbers" 
                    :key="lectureNum"
                    clickable
                    @click="openLecture(block.name, lectureNum)"
                  >
                    <q-item-section avatar>
                      <q-icon name="menu_book" color="red" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Лекция {{ lectureNum }}</q-item-label>
                      <q-item-label caption v-if="lecturesCache[`${block.name}_${lectureNum}`]?.name">
                        {{ lecturesCache[`${block.name}_${lectureNum}`].name }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-btn flat round icon="play_circle" color="primary" />
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>

              <!-- Лабораторные работы -->
              <div v-if="block.lab_numbers.length > 0" class="q-mb-md">
                <div class="text-subtitle1 q-mb-sm">Лабораторные работы</div>
                <q-list bordered dense>
                  <q-item 
                    v-for="(labNum, index) in block.lab_numbers" 
                    :key="index"
                  >
                    <q-item-section avatar>
                      <q-icon name="science" color="blue" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Лабораторная {{ labNum }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      
                      <q-btn 
                        class="q-ml-sm" 
                        color="secondary" 
                        label="Открыть" 
                        @click="openLabResponse(block.id+'_'+block.name, labNum)"
                      />
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>

              <!-- Тесты -->
              <div v-if="block.test_numbers.length > 0" class="q-mb-md">
                <div class="text-subtitle1 q-mb-sm">Тесты</div>
                <q-list bordered dense>
                  <q-item 
                    v-for="(testNum, index) in block.test_numbers" 
                    :key="index"
                  >
                    <q-item-section avatar>
                      <q-icon name="assignment" color="green" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Тест {{ testNum }}</q-item-label>
                    </q-item-section>
                    <q-btn 
                        color="primary" 
                        label="Изменить" 
                        @click="editTest(block.id.toString()+'_'+block.name, testNum)"
                      />
                    <q-item-section side>
                      <q-btn 
                        color="primary" 
                        label="Пройти" 
                        @click="startTest(block.id.toString()+'_'+block.name, testNum)"
                      />
                      
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </q-expansion-item>
          </q-item-section>
        </q-item>
      </q-list>

      <div v-if="!courses.length" class="text-center q-pa-xl text-grey">
        <q-icon name="search_off" size="xl" class="q-mb-sm" />
        <div>Ничего не найдено. Попробуйте изменить параметры поиска.</div>
      </div>
  
      <!-- Диалог для лекции -->
      <q-dialog v-model="lectureDialog" persistent>
        <q-card v-if="currentLecture.url" style="width: 70vh; max-width: 900px;">
            <q-card-section  class="row items-center q-pb-none">
              <div class="text-h6">{{ currentLecture.title }}</div>
              <q-space />
              <q-btn icon="close" flat round dense v-close-popup />
            </q-card-section>
            <q-card-section >
              <video 
                controls 
                style="width: 100%; max-height: 70vh; object-fit: contain;"
                :src="currentLecture.url"
              ></video>
            </q-card-section>
          </q-card>
      </q-dialog>

      <q-dialog v-model="labDialog" persistent>
        <q-card style="width: 700px; max-width: 80vw;">
          <q-card-section>
            <div class="text-h6">Лабораторная работа: {{ currentLab.title }}</div>
            
            <!-- Состояние загрузки -->
            <div v-if="loadingFiles" class="text-center q-pa-md">
              <q-spinner size="md" color="primary" />
              <div>Загрузка файлов...</div>
            </div>
            
            <!-- Список файлов -->
            <div v-else>
              <div class="text-subtitle1 q-mb-sm">Файлы лабораторной:</div>
              <q-list bordered separator v-if="labFiles.length">
                <q-item 
                  v-for="(file, index) in labFiles" 
                  :key="index"
                  clickable
                  @click="downloadLabFile(file.path)"
                >
                  <q-item-section avatar>
                    <q-icon name="description" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ file.name }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn icon="download" flat round dense />
                  </q-item-section>
                </q-item>
              </q-list>
              
              <div v-else class="text-grey text-center q-pa-md">
                Нет доступных файлов
              </div>
            </div>
            
            <!-- Форма для загрузки ответа -->
            <div class="q-mt-md">
              <q-file
                v-model="labAnswerFile"
                label="Загрузить ответ"
              />
            </div>
          </q-card-section>
          
          <q-card-actions align="right">
            <q-btn flat label="Отправить" color="primary" @click="submitLab" />
            <q-btn flat label="Закрыть" color="primary" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { getAll } from '../api/courses.api';
import { CoursesDto } from '../../../backend/src/common/types';
import { ContentHandler } from './fileHandler';

const $q = useQuasar();
const route = useRoute();
const router = useRouter();

// Состояние компонента
const searchQuery = ref(route.query.q?.toString() || '');
const loading = ref(false);
const courses = ref<CoursesDto[]>([]);
const lecturesCache = ref<Record<string, LectureInfo>>({});
const labFiles = ref<{name: string, path: string}[]>([]);
const loadingFiles = ref(false);

interface LectureInfo {
  number: number;
  name: string;
  url: string;
}

// Состояние для лекций
const lectureDialog = ref(false);
const currentLecture = ref({
  title: '',
  url: ''
});

// Состояние для лабораторных работ
const labDialog = ref(false);
const currentLab = ref({
  title: '',
  path: '',
  number: 0
});
const labAnswerFile = ref<File | null>(null);



// Методы
const goToMainPage = () => {
  router.push({ name: 'MainPage' });
};

const performSearch = async () => {
  loading.value = true;
  try {
    const allCourses = await getAll();
    courses.value = allCourses.filter(course => 
      course.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
    
    // Предзагрузка информации о лекциях
    await preloadLecturesInfo();
  } catch (error) {
    console.error('Ошибка при загрузке курсов:', error);
  } finally {
    loading.value = false;
  }
};

const preloadLecturesInfo = async () => {
  try {
    for (const course of courses.value) {
      for (const block of course.information_blocks) {
        for (const num of block.lecture_numbers) {
          const lecture = await ContentHandler.getLectureInfo(block.name, num);
          if (lecture) {
            lecturesCache.value[`${block.name}_${num}`] = lecture;
          }
        }
      }
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Ошибка загрузки информации о лекциях',
      position: 'top'
    });
    console.error('Ошибка предзагрузки лекций:', error);
  } finally {
  }
};

// Методы для работы с лекциями
const openLecture = async (blockName: string, lectureNum: number) => {
  try {
    const cacheKey = `${blockName}_${lectureNum}`;

    console.log(cacheKey)
    
    // Если лекции нет в кеше, пробуем загрузить
    if (!lecturesCache.value[cacheKey]) {
      const lecture = await ContentHandler.getLectureInfo(blockName, lectureNum);
      if (!lecture) {
        throw new Error('Лекция не найдена');
      }
      lecturesCache.value[cacheKey] = lecture;
    }

    const lecture = lecturesCache.value[cacheKey];
    if (!lecture?.url) {
      throw new Error('Видео лекции недоступно');
    }

    currentLecture.value = {
      title: `${lecture.number}. ${lecture.name}`,
      url: `${lecture.url}?nocache=${Date.now()}`
    };
    
    lectureDialog.value = true;
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Не удалось открыть лекцию',
      caption: error instanceof Error ? error.message : 'Попробуйте позже',
      position: 'top'
    });
  }
};

// Метод для скачивания лабораторной работы
const downloadLabFile = async (filePath: string) => {
  try {
    const response = await fetch(`http://localhost:3000/json-reader?path=${encodeURIComponent(filePath)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Получаем blob (бинарные данные файла)
    const blob = await response.blob();
    
    // Создаем URL для скачивания
    const downloadUrl = window.URL.createObjectURL(blob);
    
    // Создаем временную ссылку для скачивания
    const a = document.createElement('a');
    a.href = downloadUrl;
    
    // Извлекаем имя файла из пути
    const fileName = filePath.split('/').pop() || 'download';
    a.download = fileName;
    
    // Добавляем ссылку в DOM и кликаем
    document.body.appendChild(a);
    a.click();
    
    // Убираем ссылку после скачивания
    window.URL.revokeObjectURL(downloadUrl);
    a.remove();
    
    return true; // Успешное скачивание
  } catch (error) {
    console.error('Error downloading file:', error);
    return false; // Ошибка при скачивании
  }
};


const openLabResponse = async (blockPath: string, labNum: number) => {
  try {
    currentLab.value = {
      title: `Лабораторная работа ${labNum}`,
      path: blockPath,
      number: labNum
    };
    
    loadingFiles.value = true;
    labFiles.value = await ContentHandler.getLabFiles(blockPath, labNum);
    labDialog.value = true;
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Ошибка загрузки файлов лабораторной работы',
      position: 'top'
    });
    console.error('Ошибка загрузки файлов:', error);
  } finally {
    loadingFiles.value = false;
  }
};

const submitLab = () => {
  if (labAnswerFile.value) {
    $q.notify({
      type: 'positive',
      message: 'Ответ на лабораторную работу отправлен',
      position: 'top'
    });
    labDialog.value = false;
    labAnswerFile.value = null;
  } else {
    $q.notify({
      type: 'negative',
      message: 'Пожалуйста, загрузите файл с ответом',
      position: 'top'
    });
  }
};

// Методы для работы с тестами
const startTest = async (blockName: string, testNum: number) => {
  try {
    router.push(`/test/${blockName}/${testNum}`);
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Ошибка загрузки теста',
      position: 'top'
    });
    console.error('Ошибка загрузки теста:', error);
  }
};
const editTest = async (blockName: string, testNum: number) => {
  try {
    router.push(`/edit/${blockName}/${testNum}`);
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Ошибка загрузки теста',
      position: 'top'
    });
    console.error('Ошибка загрузки теста:', error);
  }
};

onMounted(async () => {
  try {
    await ContentHandler.initialize();
    await performSearch();
  } catch (error) {
    console.error('Ошибка инициализации:', error);
  }
});
</script>

<style scoped>
.video-wrapper {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 соотношение сторон */
  height: 0;
  overflow: hidden;
}

.q-item {
  transition: all 0.3s ease;
}

.q-item:hover {
  background-color: #f5f5f5;
}

.q-btn--outline {
  border: 1px solid currentColor;
}

.video-container {
  padding: 16px;
  background: #000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.q-card {
  overflow: visible; /* Важно для корректного отображения */
}

.video-container iframe,
.video-container video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.q-item__label--caption {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
  display: block;
}

@media (max-width: 800px) {
  .q-card {
    width: 95vw !important;
  }
  
  .video-container {
    padding: 8px;
  }
}
</style>