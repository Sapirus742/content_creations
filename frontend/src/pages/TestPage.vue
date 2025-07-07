<template>
  <div class="q-pa-md">
    <q-btn flat color="primary" icon="arrow_back" label="Назад" @click="goBack" class="q-mb-md"/>
    
    <div v-if="loading" class="text-center q-pa-lg">
      <q-spinner size="xl" color="primary"/>
    </div>

    <div v-else>
      <div class="text-h4 q-mb-md">{{ test.name }}</div>
      <div class="text-caption q-mb-lg">Осталось времени: {{ formattedTime }}</div>

      <template v-for="(question, index) in selectedQuestions" :key="`question-${index}`">
        <!-- Тип 0: Один выбор -->
        <div v-if="question.type === 0" class="q-mb-xl">
          <div class="text-h6 q-mb-sm">{{ question.name }}</div>
          <!-- Изображение вопроса -->
          <img 
            v-if="questionImages[index]" 
            :src="questionImages[index]" 
            class="q-mb-md"
            style="max-width: 100%; max-height: 300px;"
            @error="handleImageError(index, 'question')"
          />
          <q-radio
            v-for="(option, key) in question.chooses || {}"
            :key="key"
            :val="key"
            v-model="userAnswers[index]"
            :label="optionImages[index]?.[key] ? '' : option"
              class="q-mb-xs"
            >
              <img 
                v-if="optionImages[index]?.[key]"
                :src="optionImages[index][key]" 
                style="max-width: 100%; max-height: 100px;"
              />
              
        </q-radio>
        </div>

        <!-- Тип 1: Множественный выбор -->
        <div v-else-if="question.type === 1" class="q-mb-xl">
          <div class="text-h6 q-mb-sm">{{ question.name }}</div>
          <!-- Изображение вопроса -->
          <img 
            v-if="questionImages[index]" 
            :src="questionImages[index]" 
            class="q-mb-md"
            style="max-width: 100%; max-height: 300px;"
            @error="handleImageError(index, 'question')"
          />
          <q-checkbox
              v-for="(option, key) in question.chooses || {}"
              :key="key"
              :val="key"
              v-model="userAnswers[index]"
              :label="optionImages[index]?.[key] ? '' : option"
              class="q-mb-xs"
            >
              <img 
                v-if="optionImages[index]?.[key]"
                :src="optionImages[index][key]" 
                style="max-width: 100%; max-height: 100px;"
              />
            </q-checkbox>
        </div>

        <!-- Тип 2: Текстовый ответ -->
        <div v-else-if="question.type === 2" class="q-mb-xl">
          <div class="text-h6 q-mb-sm">{{ question.name }}</div>
          <!-- Изображение вопроса -->
          <img 
            v-if="questionImages[index]" 
            :src="questionImages[index]" 
            class="q-mb-md"
            style="max-width: 100%; max-height: 300px;"
            @error="handleImageError(index, 'question')"
          />
          <q-input v-model="userTextAnswers[index]" outlined placeholder="Введите ответ"/>
        </div>

        <!-- Тип 3: Сопоставление (drag-and-drop) -->
        <div v-else-if="question.type === 3" class="q-mb-xl">
          <div class="text-h6 q-mb-sm">{{ question.name }}</div>
          <!-- Изображение вопроса -->
          <img 
            v-if="questionImages[index]" 
            :src="questionImages[index]" 
            class="q-mb-md"
            style="max-width: 100%; max-height: 300px;"
            @error="handleImageError(index, 'question')"
          />
          <div class="row q-gutter-md">
            <!-- Левый столбец (перетаскиваемые элементы) -->
            <div class="col-5">
              <div 
                v-for="(leftItem, leftKey) in question.chooses1 || {}" 
                :key="`left-${leftKey}`"
                class="drag-source q-pa-sm bg-blue-1 rounded-borders q-mb-sm"
                draggable="true"
                @dragstart="startDrag($event, leftKey)"
                @dragend="clearDropZone"
                :class="{'bg-grey-4': isLeftItemPaired(index, leftKey)}"
              >
                <template v-if="!isLeftItemPaired(index, leftKey)">
                  <div v-if="leftItemImages[index]?.[leftKey]">
                    <img 
                      :src="leftItemImages[index][leftKey]" 
                      style="max-width: 100%; max-height: 100px;"
                      @error="handleImageError(index, 'left', leftKey)"
                    />
                  </div>
                  <div v-else>{{ leftItem }}</div>
                </template>
                <template v-else>
                  <q-icon name="done" color="green"/>
                </template>
              </div>
            </div>
            
            <!-- Правый столбец (зоны для сброса) -->
            <div class="col-5">
              <div 
                v-for="(rightItem, rightKey) in question.chooses2 || {}" 
                :key="`right-${rightKey}`"
                class="drop-zone q-pa-sm rounded-borders q-mb-sm"
                :class="{'bg-green-1': isRightItemPaired(index, rightKey)}"
                @dragover.prevent
                @dragenter.prevent="highlightDropZone($event)"
                @dragleave="unhighlightDropZone($event)"
                @drop="handleDrop($event, index, rightKey)"
              >
                <template v-if="isRightItemPaired(index, rightKey)">
                  <div v-if="leftItemImages[index]?.[getLeftKeyForRight(index, rightKey)!]">
                    <img 
                      :src="leftItemImages[index][getLeftKeyForRight(index, rightKey)!]" 
                      style="max-width: 100%; max-height: 100px;"
                      @error="handleImageError(index, 'left', getLeftKeyForRight(index, rightKey)!)"
                    />
                  </div>
                  <div v-else>{{ question.chooses1?.[getLeftKeyForRight(index, rightKey)!] }}</div>
                  <q-icon 
                    name="close" 
                    class="float-right cursor-pointer"
                    @click.stop="removePair(index, rightKey)"
                  />
                </template>
                <template v-else>
                  <div v-if="rightItemImages[index]?.[rightKey]">
                    <img 
                      :src="rightItemImages[index][rightKey]" 
                      style="max-width: 100%; max-height: 100px;"
                      @error="handleImageError(index, 'right', rightKey)"
                    />
                  </div>
                  <div v-else>{{ rightItem }}</div>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- Тип 4: Выбор для каждого из списка -->
        <div v-else-if="question.type === 4" class="q-mb-xl">
          <div class="text-h6 q-mb-sm">{{ question.name }}</div>
          <!-- Изображение вопроса -->
          <img 
            v-if="questionImages[index]" 
            :src="questionImages[index]" 
            class="q-mb-md"
            style="max-width: 100%; max-height: 300px;"
            @error="handleImageError(index, 'question')"
          />
          <div v-for="(item, key) in question.chooses1 || {}" :key="key" class="row items-center q-mb-sm">
            <div class="col-5">
              <div v-if="leftItemImages[index]?.[key]">
                <img 
                  :src="leftItemImages[index][key]" 
                  style="max-width: 100%; max-height: 100px;"
                  @error="handleImageError(index, 'left', key)"
                />
              </div>
              <div v-else>{{ item }}</div>
            </div>
            <q-select
              class="col-7"
              v-model="userMatchingAnswers[index][key]"
              :options="getMatchingOptions(question.chooses2 || {})"
              outlined
              dense
              emit-value
              map-options
            />
          </div>
        </div>
      </template>

      <q-btn color="primary" label="Отправить ответы" @click="submitAnswers" :disable="isSubmitted"/>
      
      <!-- Блок с результатами -->
      <div v-if="isSubmitted" class="q-mt-lg">
        <div class="text-h6">Результаты:</div>
        <div>Правильных ответов: {{ score }}/{{ selectedQuestions.length }}</div>
        <div v-for="(question, index) in selectedQuestions" :key="`result-${index}`" class="q-mt-sm">
          <div :class="{'text-green': isAnswerCorrect(question, index), 'text-red': !isAnswerCorrect(question, index)}">
            Вопрос {{ index + 1 }}: {{ isAnswerCorrect(question, index) ? '✓' : '✗' }}
            <span v-if="!isAnswerCorrect(question, index)" class="text-caption text-grey">
              (Правильный ответ: {{ getCorrectAnswerText(question) }})
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const route = useRoute();
const router = useRouter();

interface Question {
  id: string;
  name: string;
  type: number;
  answer: string | string[] | Record<string, string>;
  chooses?: Record<string, string>;
  chooses1?: Record<string, string>;
  chooses2?: Record<string, string>;
  image?: string;
}

interface Test {
  name: string;
  count: number;
  time: number;
  [key: string]: unknown;
}

const loading = ref(true);
const test = ref<Test>({ name: '', count: 0, time: 0 });
const allQuestions = ref<Question[]>([]);
const selectedQuestions = ref<Question[]>([]);
const userAnswers = ref<(string | string[])[]>([]);
const userTextAnswers = ref<string[]>([]);
const userMatchingAnswers = ref<Record<number, Record<string, string>>>({});
const timeLeft = ref(0);
const timer = ref<NodeJS.Timeout>();
const isSubmitted = ref(false);
const score = ref(0);

// Изображения
const questionImages = ref<Record<number, string>>({});
const optionImages = ref<Record<number, Record<string, string>>>({});
const leftItemImages = ref<Record<number, Record<string, string>>>({});
const rightItemImages = ref<Record<number, Record<string, string>>>({});

// Drag-and-drop состояние
const dragItem = ref<string | null>(null);
const activeDropZone = ref<HTMLElement | null>(null);

const goBack = () => router.go(-1);

const getMatchingOptions = (chooses: Record<string, string>) => {
  return Object.entries(chooses).map(([value, label]) => ({ 
    label, 
    value 
  }));
};

const startTimer = () => {
  if (timer.value) clearInterval(timer.value);
  timeLeft.value = test.value.time as number || 600;
  timer.value = setInterval(() => {
    timeLeft.value--;
    if (timeLeft.value <= 0) {
      clearInterval(timer.value);
      submitAnswers();
    }
  }, 1000);
};

const formattedTime = computed(() => {
  const mins = Math.floor(timeLeft.value / 60);
  const secs = timeLeft.value % 60;
  return `${mins}:${secs < 10 ? '0' + secs : secs}`;
});

function getRandomQuestions(questions: Question[], count: number): Question[] {
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

async function fetchJsonTable(path: string) {
  const response = await fetch(`http://localhost:3000/json-reader?path=${encodeURIComponent(path)}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

async function loadImage(basePath: string, imageName: string): Promise<string | null> {
  if (!imageName) return null;
  try {
    const response = await fetch(`http://localhost:3000/json-reader?path=${encodeURIComponent(`${basePath}/${imageName}`)}`);
    if (response.ok) {
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    }
    return null;
  } catch (error) {
    console.error('Error loading image:', error);
    return null;
  }
}

const handleImageError = (questionIndex: number, type: 'question' | 'option' | 'left' | 'right', key?: string) => {
  console.error(`Error loading image for question ${questionIndex}, type: ${type}, key: ${key}`);
  // Можно добавить логику для отображения placeholder изображения
};

// Drag-and-drop методы
const startDrag = (event: DragEvent, leftKey: string) => {
  dragItem.value = leftKey;
  event.dataTransfer!.setData('text/plain', leftKey);
  event.dataTransfer!.effectAllowed = 'move';
};

const highlightDropZone = (event: DragEvent) => {
  const zone = event.currentTarget as HTMLElement;
  if (!isRightItemPaired(getQuestionIndexFromElement(zone), getRightKeyFromElement(zone))) {
    zone.classList.add('bg-grey-3');
    activeDropZone.value = zone;
  }
};

const unhighlightDropZone = (event: DragEvent) => {
  const zone = event.currentTarget as HTMLElement;
  zone.classList.remove('bg-grey-3');
  if (zone === activeDropZone.value) {
    activeDropZone.value = null;
  }
};

const clearDropZone = () => {
  if (activeDropZone.value) {
    activeDropZone.value.classList.remove('bg-grey-3');
    activeDropZone.value = null;
  }
  dragItem.value = null;
};

const handleDrop = (event: DragEvent, questionIndex: number, rightKey: string) => {
  event.preventDefault();
  const leftKey = dragItem.value || event.dataTransfer!.getData('text/plain');
  
  if (!userMatchingAnswers.value[questionIndex]) {
    userMatchingAnswers.value[questionIndex] = {};
  }
  
  // Удаляем предыдущее сопоставление для этого leftKey
  if (userMatchingAnswers.value[questionIndex][leftKey]) {
    delete userMatchingAnswers.value[questionIndex][leftKey];
  }
  
  // Удаляем предыдущее сопоставление для этого rightKey
  Object.keys(userMatchingAnswers.value[questionIndex]).forEach(key => {
    if (userMatchingAnswers.value[questionIndex][key] === rightKey) {
      delete userMatchingAnswers.value[questionIndex][key];
    }
  });
  
  // Устанавливаем новое сопоставление
  userMatchingAnswers.value[questionIndex][leftKey] = rightKey;
  
  clearDropZone();
};

const removePair = (questionIndex: number, rightKey: string) => {
  if (userMatchingAnswers.value[questionIndex]) {
    Object.keys(userMatchingAnswers.value[questionIndex]).forEach(key => {
      if (userMatchingAnswers.value[questionIndex][key] === rightKey) {
        delete userMatchingAnswers.value[questionIndex][key];
      }
    });
  }
};

const isLeftItemPaired = (questionIndex: number, leftKey: string): boolean => {
  return !!userMatchingAnswers.value[questionIndex]?.[leftKey];
};

const isRightItemPaired = (questionIndex: number, rightKey: string): boolean => {
  return !!getLeftKeyForRight(questionIndex, rightKey);
};

const getLeftKeyForRight = (questionIndex: number, rightKey: string): string | null => {
  if (!userMatchingAnswers.value[questionIndex]) return null;
  
  for (const [leftKey, value] of Object.entries(userMatchingAnswers.value[questionIndex])) {
    if (value === rightKey) return leftKey;
  }
  return null;
};

const getQuestionIndexFromElement = (element: HTMLElement): number => {
  // Логика определения индекса вопроса по элементу
  return parseInt(element.closest('[data-question-index]')?.getAttribute('data-question-index') || '0');
};

const getRightKeyFromElement = (element: HTMLElement): string => {
  // Логика определения rightKey по элементу
  return element.getAttribute('data-right-key') || '';
};

onMounted(async () => {
  const { blockName, testId } = route.params;
  try {
    const testData = await fetchJsonTable(`${blockName}/${testId}/test.json`);
    test.value = testData;
    allQuestions.value = Object.keys(testData)
      .filter(key => !['count', 'time', 'name'].includes(key))
      .map(key => testData[key] as Question);
    
    selectedQuestions.value = getRandomQuestions(allQuestions.value, test.value.count as number);
    
    userAnswers.value = selectedQuestions.value.map(q => q.type === 1 ? [] : '');
    userTextAnswers.value = selectedQuestions.value.map(() => '');
    userMatchingAnswers.value = selectedQuestions.value.map(() => ({}));
    
    // Загрузка изображений
    const basePath = `${blockName}/${testId}`;
    const imageLoadPromises = selectedQuestions.value.map(async (question, index) => {
      // Загрузка изображения вопроса
      if (question.image) {
        const imageUrl = await loadImage(basePath, question.image);
        if (imageUrl) {
          questionImages.value[index] = imageUrl;
        }
      }
      
      // Загрузка изображений для вариантов ответов (типы 0 и 1)
      if (question.chooses) {
        optionImages.value[index] = {};
        for (const [key, value] of Object.entries(question.chooses)) {
          if (value.startsWith('image:')) {
            const imageName = value.substring(6);
            const imageUrl = await loadImage(basePath, imageName);
            if (imageUrl) {
              optionImages.value[index][key] = imageUrl;
            }
          }
        }
      }
      
      // Загрузка изображений для левой колонки (типы 3 и 4)
      if (question.chooses1) {
        leftItemImages.value[index] = {};
        for (const [key, value] of Object.entries(question.chooses1)) {
          if (value.startsWith('image:')) {
            const imageName = value.substring(6);
            const imageUrl = await loadImage(basePath, imageName);
            if (imageUrl) {
              leftItemImages.value[index][key] = imageUrl;
            }
          }
        }
      }
      
      // Загрузка изображений для правой колонки (тип 3)
      if (question.chooses2) {
        rightItemImages.value[index] = {};
        for (const [key, value] of Object.entries(question.chooses2)) {
          if (value.startsWith('image:')) {
            const imageName = value.substring(6);
            const imageUrl = await loadImage(basePath, imageName);
            if (imageUrl) {
              rightItemImages.value[index][key] = imageUrl;
            }
          }
        }
      }
    });
    
    await Promise.all(imageLoadPromises);
    
    startTimer();
  } catch (error) {
    console.error('Ошибка:', error);
    $q.notify({
      type: 'negative',
      message: 'Не удалось загрузить тест',
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  if (timer.value) clearInterval(timer.value);
  
  // Освобождение URL объектов
  Object.values(questionImages.value).forEach(URL.revokeObjectURL);
  Object.values(optionImages.value).forEach(images => Object.values(images).forEach(URL.revokeObjectURL));
  Object.values(leftItemImages.value).forEach(images => Object.values(images).forEach(URL.revokeObjectURL));
  Object.values(rightItemImages.value).forEach(images => Object.values(images).forEach(URL.revokeObjectURL));
});

const getCorrectAnswerText = (question: Question): string => {
  if (question.type === 0 || question.type === 2) {
    return question.answer.toString();
  }
  if (question.type === 1) {
    return (question.answer as string[]).join(', ');
  }
  if (question.type === 3 || question.type === 4) {
    const answerObj = question.answer as Record<string, string>;
    const chooses1 = question.chooses1 as Record<string, string> || {};
    const chooses2 = question.chooses2 as Record<string, string> || {};
    
    return Object.entries(answerObj)
      .map(([key, value]) => {
        const left = chooses1[key] || `[${key}]`;
        const right = chooses2[value] || `[${value}]`;
        return `${left} → ${right}`;
      })
      .join('; ');
  }
  return '';
};

const isAnswerCorrect = (question: Question, index: number): boolean => {
  const userAnswer = getCurrentAnswer(question.type, index);
  return checkAnswer(question, userAnswer);
};

const submitAnswers = () => {
  if (isSubmitted.value) return;
  isSubmitted.value = true;
  clearInterval(timer.value);
  
  score.value = selectedQuestions.value.reduce((acc, question, index) => {
    return acc + (isAnswerCorrect(question, index) ? 1 : 0);
  }, 0);
  
  $q.notify({
    type: 'positive',
    message: `Тест завершен! Правильных ответов: ${score.value}/${selectedQuestions.value.length}`,
    position: 'top'
  });
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getCurrentAnswer = (type: number, index: number): any => {
  switch (type) {
    case 2: return userTextAnswers.value[index];
    case 3: // Для типа 3 используем userMatchingAnswers
    case 4: return userMatchingAnswers.value[index];
    default: return userAnswers.value[index];
  }
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const checkAnswer = (question: Question, userAnswer: any): boolean => {
  const correctAnswer = question.answer;
  
  switch (question.type) {
    case 0: return userAnswer === correctAnswer;
    case 1: return arraysEqual(userAnswer as string[], correctAnswer as string[]);
    case 2: return (userAnswer as string)?.toLowerCase() === (correctAnswer as string)?.toLowerCase();
    case 3: // Сопоставление (drag-and-drop)
    case 4: // Выбор из списка
      if (typeof correctAnswer !== 'object') return false;
      
      const userPairs = userAnswer as Record<string, string>;
      const correctPairs = correctAnswer as Record<string, string>;
      
      const userKeys = Object.keys(userPairs).sort();
      const correctKeys = Object.keys(correctPairs).sort();
      
      if (!arraysEqual(userKeys, correctKeys)) return false;
      
      return userKeys.every(key => userPairs[key] === correctPairs[key]);
    default: return false;
  }
};

const arraysEqual = (a: string[], b: string[]): boolean => {
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  return JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
};
</script>

<style scoped>
.text-green {
  color: #21BA45;
}
.text-red {
  color: #C10015;
}
.drag-source {
  cursor: grab;
  user-select: none;
  border: 1px dashed #1976d2;
  transition: background-color 0.2s;
}
.drag-source:active {
  cursor: grabbing;
}
.drop-zone {
  min-height: 40px;
  border: 1px dashed #666;
  transition: background-color 0.2s;
}
.drop-zone.bg-grey-3 {
  background-color: #eee;
}
</style>