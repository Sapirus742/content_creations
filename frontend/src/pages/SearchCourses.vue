<!-- eslint-disable vue/no-parsing-error -->
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
        @keyup.enter="ReSearch"
        clearable  
      >
        <template v-slot:append>
          <q-icon name="search" @click="ReSearch" />  <!-- Поиск при клике на иконку -->
        </template>
      </q-input>
      <q-btn
        color="primary"
        icon="search"
        label="Поиск"
        @click="ReSearch"
        class="q-ml-sm"
      />
    </div>

    <div v-if="loading" class="text-center q-pa-lg">
      <q-spinner size="xl" color="primary" />
    </div>

    <div v-else>
      <div class="text-h5 q-mb-md">Найдено курсов: {{ courses.length }}</div>
      
      <q-list bordered separator>
        <q-expansion-item
          v-for="course in courses" 
          :key="course.id"
          class="q-mb-md course-item"
          style = "margin-bottom: 0px;"
          :label="course.name"
          :caption="course.description"
        >
          <template v-slot:header>
            <q-item-section>
              <q-item-label class="text-h6">{{ course.name }}</q-item-label>
              <q-item-label caption>{{ course.description }}</q-item-label>
            </q-item-section>
          </template>
            
            <!-- Аккордеон для блоков курса -->
            <q-expansion-item
              v-for="(block, blockIndex) in course.information_blocks"
              :key="block.id"
              :label="`Блок ${blockIndex + 1}: ${block.name}`"
              class="q-mt-md"
            >
              <div class="q-mb-md">
                <q-list bordered dense>
                  <template v-for="item in getSortedBlockItems(block)" :key="`${item.type}_${item.number}`">
                    <!-- Лекция -->
                    <q-item 
                      v-if="item.type === 'lecture'"
                      clickable
                      @click="openLecture(item.blockName, item.number, `${item.blockId}_${item.blockName}`,block.lecture_numbers.indexOf(item.number))"
                    >
                      <q-item-section avatar>
                        <q-icon name="menu_book" color="red" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ item.number }}. Лекция: {{ lecturesCache[`${item.blockName}_${item.number}`].name }}</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-btn flat round icon="play_circle" color="primary" />
                      </q-item-section>
                    </q-item>

                    <!-- Лабораторная -->
                    <q-item 
                      v-else-if="item.type === 'lab'"
                    >
                      <q-item-section avatar>
                        <q-icon name="science" color="blue" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ item.number }}. Лабораторная работа №{{ block.lab_numbers.indexOf(item.number)+1}} </q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-btn 
                          class="q-ml-sm" 
                          color="secondary" 
                          label="Открыть" 
                          @click="openLabResponse(`${item.blockId}_${item.blockName}`,item.number, block.lab_numbers.indexOf(item.number)+1)"
                        />
                      </q-item-section>
                    </q-item>

                    <!-- Тест -->
                    <q-item 
                      v-else-if="item.type === 'test'"
                    >
                      <q-item-section avatar>
                        <q-icon name="assignment" color="green" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ item.number }}. Тест </q-item-label>
                      </q-item-section>
                      <q-btn 
                        color="primary" 
                        label="Изменить" 
                        @click="editTest(`${item.blockId}_${item.blockName}`, item.number)"
                      />
                      <q-item-section side>
                        <q-btn 
                          color="primary" 
                          label="Пройти" 
                          @click="startTest(`${item.blockId}_${item.blockName}`, item.number)"
                        />
                      </q-item-section>
                    </q-item>
                  </template>
                </q-list>
              </div>
            </q-expansion-item>
        </q-expansion-item>
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
            <div class="text-h6"> {{ currentLab.title }}</div>
            
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

interface BlockItem {
  type: 'lecture' | 'lab' | 'test';
  number: number;
  blockName: string;
  blockId: string | number;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getSortedBlockItems = (block: { 
  lecture_numbers: number[];
  lab_numbers: number[];
  test_numbers: number[];
  name: string;
  id: string | number;
}): BlockItem[] => {
  const items: BlockItem[] = [];
  
  // Добавляем лекции
  block.lecture_numbers.forEach((num: number) => {
    items.push({
      type: 'lecture',
      number: num,
      blockName: block.name,
      blockId: block.id
    });
  });
  
  // Добавляем лабораторные
  block.lab_numbers.forEach((num: number) => {
    items.push({
      type: 'lab',
      number: num,
      blockName: block.name,
      blockId: block.id
    });
  });
  
  // Добавляем тесты
  block.test_numbers.forEach((num: number) => {
    items.push({
      type: 'test',
      number: num,
      blockName: block.name,
      blockId: block.id
    });
  });
  
  // Сортируем ТОЛЬКО по номеру (не учитывая тип)
  return items.sort((a, b) => a.number - b.number);
};

// Методы
const goToMainPage = () => {
  router.push({ name: 'MainPage' });
};
const ReSearch = () => {
 if (searchQuery.value.trim()) {
  console.log(searchQuery.value);
    router.push({ name: 'SearchCourses', query: { q: searchQuery.value } });
    performSearch();
  }
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
          const lecture = await ContentHandler.getLectureInfo(block.name, num,`${block.id}_${block.name}`,block.lecture_numbers.indexOf(num));
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
const openLecture = async (blockName: string, lectureNum: number,lPath:string, idLecture: number) => {
  try {
    const cacheKey = `${blockName}_${lectureNum}`;

    console.log(lPath)
    
    // Если лекции нет в кеше, пробуем загрузить
    if (!lecturesCache.value[cacheKey]) {
      const lecture = await ContentHandler.getLectureInfo(blockName, lectureNum,lPath,idLecture);
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
      url: `${lecture.url}`
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
    const response = await fetch(`${process.env.API_ENDPOINT}/json-reader?path=${encodeURIComponent(filePath)}`);
    
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


const openLabResponse = async (blockPath: string, labNum: number, idLab:number) => {
  try {
    let cleanName ='';
    loadingFiles.value = true;
    labFiles.value = await ContentHandler.getLabFiles(blockPath, labNum);
    const filesread =labFiles.value;
    for (const fileName of filesread) {
    if (fileName.name.startsWith('lab_')) {
      cleanName = fileName.name.replace(/^lab_/, '').replace(/\.[^/.]+$/, '');
      console.log(cleanName);
    }
}
    currentLab.value = {
      title: `Лабораторная работа ${idLab}:`+cleanName,
      path: blockPath,
      number: labNum
    };
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

<style lang="scss" scoped>
// Оставляем только специфичные стили
.video-container iframe,
.video-container video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>