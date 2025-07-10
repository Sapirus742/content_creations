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
          <q-btn 
            @click="step = 'method'" 
            color="primary" 
            label="Продолжить" 
          />
        </q-stepper-navigation>
      </q-step>

      <!-- Шаг 2: Методика создания курса -->
      <q-step name="method" title="Методика создания курса" icon="construction">
        <div class="text-h6 q-mb-md">Выберите способ создания курса:</div>
        
        <div class="row q-gutter-md q-mb-md">
          <q-btn 
            color="primary" 
            icon="edit" 
            label="Создать вручную" 
            @click="startManualCreation"
            class="col"
            size="lg"
          />
          <q-btn 
            color="primary" 
            icon="auto_awesome" 
            label="Создать автоматически" 
            @click="startAutoCreation"
            class="col"
            size="lg"
          />
          <q-btn 
            color="secondary" 
            icon="collections_bookmark" 
            label="Посмотреть созданные курсы" 
            @click="viewExistingCourses"
            class="col"
            size="lg"
          />
        </div>
        
        <q-stepper-navigation>
          <q-btn @click="step = 'basic'" color="grey" label="Назад" class="q-mr-sm" />
        </q-stepper-navigation>
      </q-step>

      <!-- Шаг 3: Контент (ручное создание) -->
      <q-step name="manual-content" title="Содержание курса" icon="library_books" v-if="selectedMethod === 'manual'">
        <div class="text-h6 q-mb-md">Добавьте материалы курса</div>
        <div class="row q-gutter-md q-mb-md">
          <q-btn
              color="secondary"
              label="Редактор блоков"
              to="create-block/create/0"
            />
          <q-btn 
            color="primary" 
            icon="add" 
            label="Блок" 
            @click="addBlock('lecture')"
          />
        </div>
        
        <q-list bordered separator>
          <q-item v-for="(block, index) in course.blocks" :key="index">
            <q-item-section avatar>
              <q-icon :name="blockIcons[block.type]" :color="blockColors[block.type]" />
            </q-item-section>
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
          <q-btn @click="step = 'method'" color="grey" label="Назад" class="q-mr-sm" />
          <q-btn 
            @click="confirmSubmit" 
            color="primary" 
            label="Создать курс"
            :loading="isSubmitting"
            :disable="isSubmitting || !course.title || course.blocks.length === 0"
          />
        </q-stepper-navigation>
      </q-step>

      <!-- Шаг 3: Контент (автоматическое создание) -->
      <q-step name="auto-content" title="Автоматическое создание курса" icon="auto_awesome" v-if="selectedMethod === 'auto'">
        <div v-if="autoCreationInProgress" class="text-center q-pa-lg">
          <q-spinner size="xl" color="primary" class="q-mb-md" />
          <div>Идет создание курса... Пожалуйста, подождите.</div>
          <div class="q-mt-md">Прогресс: {{ autoCreationProgress }}%</div>
          <q-linear-progress 
            :value="autoCreationProgress / 100" 
            color="primary" 
            class="q-mt-md"
            animated
          />
        </div>
        
        <div v-else>
          <div class="text-h6 q-mb-md">Автоматически созданные блоки курса:</div>
          
          <q-list bordered separator>
            <q-item v-for="(blockGroup, idx) in autoCreatedBlocks" :key="idx" class="q-pa-md">
              <q-item-section>
                <div class="text-h6 q-mb-sm">Блок {{ idx + 1 }}: {{ blockGroup.title }}</div>
                
                <q-card flat bordered class="q-mb-sm" v-for="block in blockGroup.items" :key="block.type">
                  <q-item>
                    <q-item-section avatar>
                      <q-icon :name="blockIcons[block.type]" :color="blockColors[block.type]" size="md" />
                    </q-item-section>
                    
                    <q-item-section>
                      <q-item-label>{{ blockTitles[block.type] }}</q-item-label>
                      <q-item-label caption>{{ block.title }}</q-item-label>
                    </q-item-section>
                    
                    <q-item-section side>
                      <q-btn 
                        color="primary" 
                        icon="add" 
                        label="Добавить" 
                        @click="addAutoBlock(block)"
                        outline
                      />
                    </q-item-section>
                  </q-item>
                </q-card>
              </q-item-section>
            </q-item>
          </q-list>
          
          <div class="q-mt-md text-center">
            <q-btn 
              color="primary" 
              icon="auto_awesome" 
              label="Добавить все блоки" 
              @click="addAllBlocks"
              class="q-mr-sm"
            />
            <q-btn 
              color="secondary" 
              icon="save" 
              label="Сохранить курс" 
              @click="confirmSubmit"
              :loading="isSubmitting"
              :disable="isSubmitting || !course.title || course.blocks.length === 0"
            />
          </div>
          
          <q-stepper-navigation class="q-mt-md">
            <q-btn @click="step = 'method'" color="grey" label="Назад" class="q-mr-sm" />
          </q-stepper-navigation>
        </div>
      </q-step>
    </q-stepper>

    <!-- Диалог подтверждения создания курса -->
    <q-dialog v-model="showConfirmDialog" persistent>
      <q-card>
        <q-card-section>
          <div class="text-h6">Подтверждение</div>
        </q-card-section>

        <q-card-section>
          Вы точно хотите создать курс "{{ course.title }}"?
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Отмена" color="primary" v-close-popup />
          <q-btn flat label="Создать" color="positive" @click="submitCourse" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useCoursesStore } from '../stores/courses.store';


const router = useRouter();
const $q = useQuasar();
const coursesStore = useCoursesStore();

const step = ref<'basic' | 'method' | 'manual-content' | 'auto-content'>('basic');
const selectedMethod = ref<'manual' | 'auto' | null>(null);
const isSubmitting = ref(false);
const autoCreationInProgress = ref(false);
const autoCreationProgress = ref(0);
const autoCreatedBlocks = ref<AutoBlockGroup[]>([]);
const showConfirmDialog = ref(false);

type BlockType = 'lecture' | 'practice' | 'test';

interface CourseBlock {
  type: BlockType;
  title?: string;
  content?: string;
}

interface AutoBlockGroup {
  title: string;
  items: CourseBlock[];
}

interface Course {
  title: string;
  description: string;
  blocks: CourseBlock[];
}

const course = ref<Course>({
  title: '',
  description: '',
  blocks: []
});

const blockTitles: Record<BlockType, string> = {
  lecture: 'Блок',
  practice: 'Практическое задание',
  test: 'Тест'
};

const blockIcons: Record<BlockType, string> = {
  lecture: 'picture_as_pdf',
  practice: 'code',
  test: 'assignment_turned_in'
};

const blockColors: Record<BlockType, string> = {
  lecture: 'red',
  practice: 'blue',
  test: 'green'
};

const informaticsTopics = [
  'Основы алгоритмизации',
  'Программирование на Python',
  'Базы данных и SQL',
  'Веб-разработка',
  'Компьютерные сети',
  'Кибербезопасность',
  'Искусственный интеллект',
  'Анализ данных',
  'Операционные системы',
  'Компьютерная графика'
];

watch(course, (newVal) => {
  localStorage.setItem('courseDraft', JSON.stringify(newVal));
}, { deep: true });

const startManualCreation = () => {
  selectedMethod.value = 'manual';
  step.value = 'manual-content';
};

const startAutoCreation = () => {
  selectedMethod.value = 'auto';
  autoCreationInProgress.value = true;
  autoCreationProgress.value = 0;
  step.value = 'auto-content';
  
  const interval = setInterval(() => {
    autoCreationProgress.value += 5;
    if (autoCreationProgress.value >= 100) {
      clearInterval(interval);
      autoCreationInProgress.value = false;
      generateAutoCreatedBlocks();
    }
  }, 200);
};

const generateAutoCreatedBlocks = () => {
  autoCreatedBlocks.value = informaticsTopics.map((topic) => ({
    title: topic,
    items: [
      {
        type: 'lecture',
        title: `Теоретические основы "${topic}"`,
        content: `Лекционный материал по теме "${topic}"`
      },
      {
        type: 'practice',
        title: `Практикум по теме "${topic}"`,
        content: `Практические задания по теме "${topic}"`
      },
      {
        type: 'test',
        title: `Контроль знаний по теме "${topic}"`,
        content: `Тестовые вопросы по теме "${topic}"`
      }
    ]
  }));
};

const addBlock = (type: BlockType) => {
  course.value.blocks.push({
    type,
    title: '',
    content: ''
  });
};

const editBlock = (index: number) => {
  console.log('Редактирование блока:', index);
};

const removeBlock = (index: number) => {
  course.value.blocks.splice(index, 1);
};

const addAutoBlock = (block: CourseBlock) => {
  course.value.blocks.push({ ...block });
};

const addAllBlocks = () => {
  autoCreatedBlocks.value.forEach(group => {
    group.items.forEach(block => {
      course.value.blocks.push({ ...block });
    });
  });
};

const viewExistingCourses = () => {
  router.push({ 
    name: 'SearchCourses',
    query: { 
      predefined: 'true',
      title: 'Прикладная информатика'
    }
  });
};

const goToMainPage = () => {
  if (course.value.blocks.length > 0 || course.value.title || course.value.description) {
    $q.dialog({
      title: 'Подтверждение',
      message: 'У вас есть несохранённые изменения. Вы уверены, что хотите выйти?',
      cancel: true,
      persistent: true
    }).onOk(() => {
      localStorage.removeItem('courseDraft');
      router.push('/');
    });
  } else {
    router.push('/');
  }
};

const confirmSubmit = () => {
  showConfirmDialog.value = true;
};

const submitCourse = async () => {
  showConfirmDialog.value = false;
  isSubmitting.value = true;
  
  try {
    const blockIds = await Promise.all(
      course.value.blocks.map(async (block, index) => {
        const blockData = {
          name: block.title || `${blockTitles[block.type]} ${index + 1}`,
          description: block.content || '',
          tegs: [],
          test_numbers: [],
          lecture_numbers: [],
          lab_numbers: []
        };
        
        const createdBlock = await coursesStore.createInformationBlock(blockData);
        return createdBlock.id;
      })
    );

    const courseData = {
      name: course.value.title,
      description: course.value.description,
      information_blocks: blockIds
    };
    
    await coursesStore.createNewCourse(courseData);
    
    $q.notify({
      type: 'positive',
      message: 'Курс успешно создан!',
      position: 'top',
      timeout: 2000
    });
    
    localStorage.removeItem('courseDraft');
    router.push('/');
  } catch (error) {
    console.error('Ошибка создания курса:', error);
    
    $q.notify({
      type: 'negative',
      message: 'Ошибка создания курса',
      caption: error instanceof Error ? error.message : 'Неизвестная ошибка',
      position: 'top'
    });
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.q-card {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.q-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
</style>