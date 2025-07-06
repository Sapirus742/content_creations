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
                        color="primary" 
                        label="Скачать" 
                        @click="downloadLab(block.link_to_folder, labNum)"
                      />
                      <q-btn 
                        class="q-ml-sm" 
                        color="secondary" 
                        label="Ответить" 
                        @click="openLabResponse(block.link_to_folder, labNum)"
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
                    <q-item-section side>
                      <q-btn 
                        color="primary" 
                        label="Пройти" 
                        @click="startTest(block.link_to_folder, testNum)"
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

      <!-- Диалог для лабораторной работы -->
      <q-dialog v-model="labDialog" persistent>
        <q-card style="width: 700px; max-width: 80vw;">
          <q-card-section>
            <div class="text-h6">Лабораторная работа: {{ currentLab.title }}</div>
          </q-card-section>
          <q-card-section>
            <q-btn 
              color="primary" 
              icon="download" 
              label="Скачать задание" 
              @click="downloadLab(currentLab.path, currentLab.number)"
            />
            <q-file
              v-model="labAnswerFile"
              label="Загрузить ответ"
              class="q-mt-md"
            />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Отправить" color="primary" @click="submitLab" />
            <q-btn flat label="Закрыть" color="primary" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Диалог для теста -->
      <q-dialog v-model="testDialog" full-width persistent>
        <q-card>
          <q-card-section>
            <div class="text-h6">Тест: {{ currentTest.title }}</div>
            <div class="text-caption">
              Осталось времени: {{ minutes }}:{{ seconds < 10 ? '0' + seconds : seconds }}
            </div>
          </q-card-section>

          <q-card-section>
            <div v-for="(question, qIndex) in currentTest.questions" :key="qIndex" class="q-mb-lg">
              <div class="text-subtitle1 q-mb-sm">{{ qIndex + 1 }}. {{ question.name }}</div>
              
              <!-- Вопрос с одним вариантом ответа -->
              <div v-if="question.type === 0">
                <q-radio
                  v-for="(choice, cIndex) in Object.entries(question.chooses || {})"
                  :key="cIndex"
                  v-model="testAnswers[qIndex]"
                  :val="cIndex.toString()"
                  :label="choice[1] as string"
                  class="q-mb-xs"
                />
              </div>
              
              <!-- Вопрос с множественным выбором -->
              <div v-if="question.type === 1">
                <q-checkbox
                  v-for="(choice, cIndex) in Object.entries(question.chooses || {})"
                  :key="cIndex"
                  v-model="testAnswers[qIndex]"
                  :val="cIndex.toString()"
                  :label="choice[1] as string"
                  class="q-mb-xs"
                />
              </div>
              
              <!-- Вопрос с вводом текста -->
              <div v-if="question.type === 2">
                <q-input v-model="testAnswers[qIndex]" type="textarea" />
              </div>
              
              <!-- Вопрос на соответствие -->
              <div v-if="question.type === 3" class="row">
                <div class="col-md-6 q-pr-md">
                  <div v-for="(choice1, c1Index) in Object.entries(question.chooses1 || {})" :key="c1Index">
                    {{ choice1[1] }}
                  </div>
                </div>
                <div class="col-md-6">
                  <template v-for="(choice1, c1Index) in Object.entries(question.chooses1 || {})" :key="c1Index">
                    <q-select
                      v-model="testAnswers[qIndex][c1Index]"
                      :options="Object.entries(question.chooses2 || {}).map(([key, val]) => ({ 
                        label: val as string, 
                        value: key 
                      }))"
                      :label="`Соответствие для ${choice1[1] as string}`"
                      class="q-mb-sm"
                    />
                  </template>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Отправить" color="primary" @click="submitTest" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
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

// Состояние для тестов
const testDialog = ref(false);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const currentTest = ref<any>({
  title: '',
  questions: [],
  timeLimit: 0
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const testAnswers = ref<any[]>([]);
const testTimer = ref(0);
const testInterval = ref<NodeJS.Timeout | null>(null);

// Вычисляемые свойства для таймера теста
const minutes = computed(() => Math.floor(testTimer.value / 60));
const seconds = computed(() => testTimer.value % 60);

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
const downloadLab = (blockName: string, labNum: number) => {
  const labUrl = ContentHandler.getLabUrl(blockName, labNum);
  window.open(labUrl, '_blank');
};


const openLabResponse = (blockPath: string, labNum: number) => {
  currentLab.value = {
    title: `Лабораторная работа ${labNum}`,
    path: blockPath,
    number: labNum
  };
  labDialog.value = true;
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
    const testData = await ContentHandler.getTestData(blockName, testNum);
    
    currentTest.value = {
      title: `Тест ${testNum}`,
      questions: testData.questions,
      timeLimit: testData.time
    };
    
    testAnswers.value = Array(currentTest.value.questions.length).fill(null);
    testTimer.value = currentTest.value.timeLimit;
    
    // Запускаем таймер
    if (testInterval.value) clearInterval(testInterval.value);
    testInterval.value = setInterval(() => {
      testTimer.value--;
      if (testTimer.value <= 0) {
        submitTest();
      }
    }, 1000);
    
    testDialog.value = true;
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Ошибка загрузки теста',
      position: 'top'
    });
    console.error('Ошибка загрузки теста:', error);
  }
};

const submitTest = () => {
  if (testInterval.value) clearInterval(testInterval.value);
  
  // Проверка ответов
  let score = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentTest.value.questions.forEach((question: any, index: number) => {
    if (question.type === 0 || question.type === 1) {
      // Для вопросов с выбором одного/нескольких вариантов
      if (JSON.stringify(testAnswers.value[index]) === JSON.stringify(question.answer)) {
        score += question.mark;
      }
    } else if (question.type === 3) {
      // Для вопросов на соответствие
      const userAnswer = testAnswers.value[index];
      const correctAnswer = question.answer;
      if (JSON.stringify(userAnswer) === JSON.stringify(correctAnswer)) {
        score += question.mark;
      }
    }
    // Для вопросов с текстовым ответом (type 2) нужна ручная проверка
  });
  
  $q.notify({
    type: 'positive',
    message: `Тест завершен! Ваш результат: ${score} баллов`,
    position: 'top',
    timeout: 5000
  });
  
  testDialog.value = false;
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