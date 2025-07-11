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
    <div class="text-h4 q-mb-md">Редактор курсов</div>
        <div class="row q-col-gutter-md">
          <div class="col-12">
            <q-select
              v-model="selectedCourse"
              :options="courseOptions"
              option-label="name"
              label="Выберите курс"
              outlined
              map-options
              emit-value
              use-input
              input-debounce="300"
              @filter="filterCourses"
              @update:model-value="loadCourseDetails"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    Ничего не найдено
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <template v-if="selectedCourse">
            <div class="col-12">
              <q-input
                v-model="editCourse.name"
                label="Название курса"
                outlined
                :rules="[val => !!val || 'Обязательное поле']"
              />
            </div>
            
            <div class="col-12">
              <q-input
                v-model="editCourse.description"
                label="Описание курса"
                outlined
                type="textarea"
              />
            </div>

            <div class="col-12">
              <div class="row items-center q-mb-sm">
                <div class="text-h6">Блоки курса</div>
                <q-space/>
                <div class="row q-gutter-md q-mb-md">
                <q-btn
                    color="secondary"
                    label="Редактор блоков"
                    to="create-block/create/0"
                />
                <q-btn
                  color="primary" 
                  icon="add" 
                  label="Добавить блок" 
                  @click="showEditBlockDialog = true"
                />
                </div>
              </div>
              
              <q-list bordered separator>
                <q-item v-for="(block, index) in editCourse.blocks" :key="index">
                  <q-item-section avatar>
                    <q-icon name="widgets" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ block.name }}</q-item-label>
                    <q-item-label caption v-if="block.description">{{ block.description }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <div class="row q-gutter-sm">
                      <q-btn 
                        flat 
                        round 
                        icon="arrow_upward" 
                        color="primary" 
                        @click.stop="moveBlockUp(index)" 
                        :disable="index === 0" 
                      />
                      <q-btn 
                        flat 
                        round 
                        icon="arrow_downward" 
                        color="primary" 
                        @click.stop="moveBlockDown(index)" 
                        :disable="index === editCourse.blocks.length - 1" 
                      />
                      <q-btn 
                        icon="delete" 
                        flat 
                        round 
                        @click="confirmDeleteBlock(index)" 
                      />
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <div class="col-12 q-mt-md">
              <q-btn
                color="primary"
                label="Сохранить изменения"
                @click="updateCourse"
                :loading="updatingCourse"
              />
              <q-btn
                color="negative"
                label="Удалить курс"
                @click="confirmDeleteCourse"
                class="q-ml-sm"
              />
            </div>
          </template>
        </div>

        <!-- Диалог добавления блока при редактировании -->
        <q-dialog v-model="showEditBlockDialog" persistent>
          <q-card style="min-width: 500px">
            <q-card-section>
              <div class="text-h6">Выберите информационный блок</div>
            </q-card-section>

            <q-card-section>
              <q-select
                v-model="selectedEditInfoBlock"
                :options="infoBlocks"
                option-label="name"
                label="Информационный блок"
                outlined
                use-input
                input-debounce="300"
                @filter="filterBlocks"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      Ничего не найдено
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat label="Отмена" color="primary" v-close-popup />
              <q-btn 
                flat 
                label="Добавить" 
                color="primary" 
                @click="addEditInfoBlock"
                :disable="!selectedEditInfoBlock"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>

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

    <!-- Диалог подтверждения удаления блока -->
    <q-dialog v-model="showDeleteBlockDialog" persistent>
      <q-card>
        <q-card-section>
          <div class="text-h6">Подтверждение удаления</div>
        </q-card-section>

        <q-card-section>
          Вы уверены, что хотите удалить этот блок из курса?
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Отмена" color="primary" v-close-popup />
          <q-btn flat label="Удалить" color="negative" @click="deleteBlock" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Диалог подтверждения удаления курса -->
    <q-dialog v-model="showDeleteCourseDialog" persistent>
      <q-card>
        <q-card-section>
          <div class="text-h6">Подтверждение удаления</div>
        </q-card-section>

        <q-card-section>
          Вы уверены, что хотите удалить курс "{{ selectedCourse?.name }}"?
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Отмена" color="primary" v-close-popup />
          <q-btn flat label="Удалить" color="negative" @click="deleteCourse" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { getAll, create, update, remove, get} from '../api/courses.api';

const router = useRouter();
const $q = useQuasar();

// Состояние компонента
const step = ref<'basic' | 'content'>('basic');
const isSubmitting = ref(false);
const updatingCourse = ref(false);
const showConfirmDialog = ref(false);
const showEditBlockDialog = ref(false);
const showDeleteBlockDialog = ref(false);
const showDeleteCourseDialog = ref(false);
const blockToDelete = ref<number | null>(null);

// Данные курсов
const course = ref({
  title: '',
  description: '',
  blocks: [] as CourseBlock[]
});

const editCourse = ref({
  name: '',
  description: '',
  blocks: [] as CourseBlock[]
});

// Списки блоков и курсов
//eslint-disable-next-line @typescript-eslint/no-explicit-any
const infoBlocks = ref<any[]>([]);
//eslint-disable-next-line @typescript-eslint/no-explicit-any
const allInfoBlocks = ref<any[]>([]);
//eslint-disable-next-line @typescript-eslint/no-explicit-any
const courses = ref<any[]>([]);
//eslint-disable-next-line @typescript-eslint/no-explicit-any
const allCourses = ref<any[]>([]);
//eslint-disable-next-line @typescript-eslint/no-explicit-any
const selectedCourse = ref<any>(null);
//eslint-disable-next-line @typescript-eslint/no-explicit-any
const selectedEditInfoBlock = ref<any>(null);

interface CourseBlock {
  id: number;
  name: string;
  description: string;
}

// Загрузка данных
onMounted(async () => {
  await loadInfoBlocks();
  await loadCourses();
});

const loadInfoBlocks = async () => {
  try {
    const response = await fetch(`${process.env.API_ENDPOINT || 'http://localhost:3000'}/inform_blocks`);
    if (!response.ok) throw new Error('Ошибка загрузки информационных блоков');
    allInfoBlocks.value = await response.json();
    infoBlocks.value = allInfoBlocks.value.filter(block => block.status === 'Ready');
  } catch (error) {
    console.error('Ошибка загрузки информационных блоков:', error);
    $q.notify({
      type: 'negative',
      message: 'Не удалось загрузить информационные блоки',
      position: 'top'
    });
  }
};

const loadCourses = async () => {
  try {
    const data = await getAll();
    allCourses.value = data;
    courses.value = data;
  } catch (error) {
    console.error('Ошибка загрузки курсов:', error);
    $q.notify({
      type: 'negative',
      message: 'Не удалось загрузить список курсов',
      position: 'top'
    });
  }
};

const loadCourseDetails = async () => {
  if (!selectedCourse.value) return;

  try {
    console.log(selectedCourse.value)
    const courseData = await get(selectedCourse.value);
    console.log(courseData?.information_blocks)
    if (!courseData) throw new Error('Курс не найден');

    editCourse.value = {
      name: courseData.name,
      description: courseData.description,
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
      blocks: courseData.information_blocks.map((block: any) => ({
        id: block.id,
        name: block.name,
        description: block.description
      }))
    };
  } catch (error) {
    console.error('Ошибка загрузки деталей курса:', error);
    $q.notify({
      type: 'negative',
      message: 'Не удалось загрузить данные курса',
      position: 'top'
    });
  }
};

// Методы для перемещения блоков
const moveBlockUp = (index: number) => {
  if (index <= 0) return;
  
  const blocks = [...editCourse.value.blocks];
  // Меняем местами текущий блок с предыдущим
  [blocks[index - 1], blocks[index]] = [blocks[index], blocks[index - 1]];
  editCourse.value.blocks = blocks;
};

const moveBlockDown = (index: number) => {
  if (index >= editCourse.value.blocks.length - 1) return;
  
  const blocks = [...editCourse.value.blocks];
  // Меняем местами текущий блок со следующим
  [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]];
  editCourse.value.blocks = blocks;
};

// Фильтрация
const filterBlocks = (val: string, update: (callback: () => void) => void) => {
  if (val === '') {
    update(() => {
      infoBlocks.value = allInfoBlocks.value.filter(block => block.status === 'Ready');
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    infoBlocks.value = allInfoBlocks.value.filter(
      block => block.status === 'Ready' && block.name.toLowerCase().includes(needle)
    );
  });
};

const filterCourses = (val: string, update: (callback: () => void) => void) => {
  if (val === '') {
    update(() => {
      courses.value = allCourses.value;
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    courses.value = allCourses.value.filter(
      course => course.name.toLowerCase().includes(needle)
    );
  });
};

// Работа с блоками
const addEditInfoBlock = () => {
  if (selectedEditInfoBlock.value && selectedEditInfoBlock.value.status == 'Ready') {
    const alreadyAdded = editCourse.value.blocks.some(
      block => block.id === selectedEditInfoBlock.value.id
    );
    
    if (!alreadyAdded) {
      editCourse.value.blocks.push({
        id: selectedEditInfoBlock.value.id,
        name: selectedEditInfoBlock.value.name,
        description: selectedEditInfoBlock.value.description
      });
    } else {
      $q.notify({
        type: 'warning',
        message: 'Этот информационный блок уже добавлен в курс',
        position: 'top'
      });
    }
    
    selectedEditInfoBlock.value = null;
    showEditBlockDialog.value = false;
  }
};

const confirmDeleteBlock = (index: number) => {
  blockToDelete.value = index;
  showDeleteBlockDialog.value = true;
};

const deleteBlock = () => {
  if (blockToDelete.value !== null) {
    editCourse.value.blocks.splice(blockToDelete.value, 1);
    blockToDelete.value = null;
    showDeleteBlockDialog.value = false;
  }
};

// Работа с курсами
const goToMainPage = () => {
  router.push('/');
};

const submitCourse = async () => {
  showConfirmDialog.value = false;
  isSubmitting.value = true;
  
  try {
    const courseData = {
      name: course.value.title,
      description: course.value.description,
      information_blocks: course.value.blocks.map(block => block.id)
    };
    
    await create(courseData);
    
    $q.notify({
      type: 'positive',
      message: 'Курс успешно создан!',
      position: 'top',
      timeout: 2000
    });
    
    // Сброс формы
    course.value = {
      title: '',
      description: '',
      blocks: []
    };
    step.value = 'basic';
    
    // Обновление списка курсов
    await loadCourses();
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

const updateCourse = async () => {
  if (!selectedCourse.value) return;
  
  updatingCourse.value = true;
  
  try {
    const courseData = {
      name: editCourse.value.name,
      description: editCourse.value.description,
      information_blocks: editCourse.value.blocks.map(block => block.id)
    };
    const courseIsNull={information_blocks:[editCourse.value.blocks.map(block => block.id)[0]]}
    await update(selectedCourse.value, courseIsNull);
    await update(selectedCourse.value, courseData);
    
    $q.notify({
      type: 'positive',
      message: 'Курс успешно обновлен!',
      position: 'top',
      timeout: 2000
    });
    
    // Обновление списка курсов
    await loadCourses();
  } catch (error) {
    console.error('Ошибка обновления курса:', error);
    
    $q.notify({
      type: 'negative',
      message: 'Ошибка обновления курса',
      caption: error instanceof Error ? error.message : 'Неизвестная ошибка',
      position: 'top'
    });
  } finally {
    updatingCourse.value = false;
  }
};

const confirmDeleteCourse = () => {
  showDeleteCourseDialog.value = true;
};

const deleteCourse = async () => {
  if (!selectedCourse.value) return;
  
  try {
    await remove(selectedCourse.value);
    
    $q.notify({
      type: 'positive',
      message: 'Курс успешно удален!',
      position: 'top',
      timeout: 2000
    });
    
    // Сброс формы
    selectedCourse.value = null;
    editCourse.value = {
      name: '',
      description: '',
      blocks: []
    };
    showDeleteCourseDialog.value = false;
    
    // Обновление списка курсов
    await loadCourses();
  } catch (error) {
    console.error('Ошибка удаления курса:', error);
    
    $q.notify({
      type: 'negative',
      message: 'Ошибка удаления курса',
      caption: error instanceof Error ? error.message : 'Неизвестная ошибка',
      position: 'top'
    });
  }
};

// Вычисляемые свойства
const courseOptions = computed(() => {
  return courses.value.map(course => ({
    ...course,
    label: course.name,
    value: course.id
  }));
});
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

.q-item {
  transition: all 0.3s ease;
}

.q-item:hover {
  background-color: #f5f5f5;
}
</style>