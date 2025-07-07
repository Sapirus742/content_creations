<template>
  <div class="q-pa-md">
    <q-btn flat color="primary" icon="arrow_back" label="Назад" @click="goBack" class="q-mb-md"/>
    <div class="text-h4 q-mb-md">Редактор теста</div>
    
    <div class="row q-mb-md">
      <q-input v-model="test.time" label="Время на тест (секунды)" type="number" class="col-3" />
       <q-input 
        v-model="test.count" 
        label="Количество случайных вопросов" 
        type="number" 
        min="0"
        :max="Object.keys(questions).length"
        class="col-3 q-ml-md" 
      />
      <div class="col q-pl-md">
        <q-btn color="primary" label="Сохранить тест" @click="saveTest" />
      </div>
      
    </div>
    
    <div class="text-h6 q-mb-sm">Всего вопросов: {{ Object.keys(questions).length }}</div>
    <div class="text-subtitle2 q-mb-md" :class="{ 'text-negative': test.count > Object.keys(questions).length }">
      Будет выбрано случайно: {{ test.count }}
      <span v-if="test.count > Object.keys(questions).length" class="q-ml-sm">(Невозможно, уменьшите значение)</span>
    </div>
    
    
    <q-list bordered separator>
      <q-item v-for="(question, id) in questions" :key="id">
        <q-item-section>
          <q-item-label>{{ question.name }}</q-item-label>
          <q-item-label caption>{{ getQuestionTypeName(question.type) }}</q-item-label>
          <q-img 
            v-if="question.image" 
            :src="imageUrls[question.image]"
            style="max-height: 100px; max-width: 200px"
            class="q-mt-sm"
          />
        </q-item-section>
        
        <q-item-section side>
          <div class="row q-gutter-sm">
            <q-btn icon="edit" color="primary" dense @click="editQuestion(id.toString())" />
            <q-btn icon="delete" color="negative" dense @click="deleteQuestion(id.toString())" />
          </div>
        </q-item-section>
      </q-item>
    </q-list>
    
    <q-btn color="positive" label="Добавить вопрос" @click="addQuestion" class="q-mt-md" />
    
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 70vw">
        <q-card-section>
          <div class="text-h6">{{ editingId === 'new' ? 'Новый вопрос' : 'Редактирование вопроса' }}</div>
        </q-card-section>
        
        <q-card-section class="scroll" style="max-height: 70vh">
          <q-select
            v-model="editingQuestion.type"
            :options="questionTypes"
            option-label="label"
            option-value="value"
            label="Тип вопроса"
            emit-value
            map-options
            class="q-mb-md"
            @update:model-value="onQuestionTypeChange"
          />
          
          <q-input v-model="editingQuestion.name" label="Текст вопроса" class="q-mb-md" />
          
          <div class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">Изображение вопроса:</div>
            <q-img 
              v-if="editingQuestion.image" 
                :src="imageUrls[editingQuestion.image.replace(/^image:/, '')]" 
              style="max-height: 200px; max-width: 100%"
              class="q-mb-sm"
            />
            <q-file
              v-model="questionImageFile"
              label="Загрузить изображение"
              accept="image/*"
              @update:model-value="uploadQuestionImage"
              class="q-mb-sm"
            />
            <q-btn 
              v-if="editingQuestion.image" 
              label="Удалить изображение" 
              color="negative" 
              @click="removeQuestionImage"
              dense
            />
          </div>
          
          <div v-if="[0, 1].includes(editingQuestion.type)" class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">Варианты ответов:</div>
            <div v-for="(choice, key) in editingQuestion.chooses" :key="key" class="row items-center q-mb-sm">
              <div class="col">
                <q-input 
                  v-model="editingQuestion.chooses[key]" 
                  :label="`Вариант ${key}`" 
                  v-if="!choiceIsImage[key]"
                />
                <div v-else class="column">
                  <q-img 
                    v-if="editingQuestion.chooses[key]"
                    :src="imageUrls[editingQuestion.chooses[key].replace(/^image:/, '')]"
                    style="max-height: 100px; max-width: 200px"
                    class="q-mb-sm"
                  />
                  <q-file
                    v-model="choiceImageFiles[key]"
                    label="Заменить изображение"
                    accept="image/*"
                    @update:model-value="uploadChoiceImage(key)"
                    class="q-mb-sm"
                  />
                </div>
                <q-checkbox 
                  v-model="choiceIsImage[key]" 
                  label="Это изображение" 
                  @update:model-value="toggleChoiceType(key)"
                />
              </div>
              <q-btn icon="delete" flat dense color="negative" @click="removeChoice(key)" class="q-ml-sm" />
            </div>
            <q-btn label="Добавить вариант" color="primary" @click="addChoice" class="q-mt-sm" />
            
            <div v-if="editingQuestion.type === 0" class="q-mt-md">
              <q-select
                v-model="editingQuestion.answer"
                :options="Object.keys(editingQuestion.chooses).map(k => ({ label: choiceIsImage[k] ? `Изображение ${k}` : `${k}: ${editingQuestion.chooses[k]}`, value: k }))"
                label="Правильный ответ"
                emit-value
                map-options
              />
            </div>
            
            <div v-else class="q-mt-md">
              <q-select
                v-model="editingQuestion.answer"
                :options="Object.keys(editingQuestion.chooses).map(k => ({ label: choiceIsImage[k] ? `Изображение ${k}` : `${k}: ${editingQuestion.chooses[k]}`, value: k }))"
                label="Правильные ответы"
                multiple
                emit-value
                map-options
              />
            </div>
          </div>
          
          <div v-else-if="editingQuestion.type === 2" class="q-mb-md">
            <q-input v-model="editingQuestion.answer" label="Правильный ответ" />
          </div>
          
          <div v-else-if="[3, 4].includes(editingQuestion.type)" class="q-mb-md">
            <div class="row q-col-gutter-md">
              <div class="col">
                <div class="text-subtitle2 q-mb-sm">Левые варианты (вопросы):</div>
                <div v-for="(choice, key) in editingQuestion.chooses1" :key="`left-${key}`" class="row items-center q-mb-sm">
                  <div class="col">
                    <q-input 
                      v-model="editingQuestion.chooses1[key]" 
                      :label="`Левый вариант ${key}`"
                      v-if="!leftChoiceIsImage[key]"
                    />
                    <div v-else class="column">
                      <q-img 
                        v-if="editingQuestion.chooses1[key] && loadImage(editingQuestion.chooses1[key])!=null"
                        :src="imageUrls[editingQuestion.chooses1[key].replace(/^image:/, '')]"
                        style="max-height: 100px; max-width: 200px"
                        class="q-mb-sm"
                      />
                      <q-file
                        v-model="leftChoiceImageFiles[key]"
                        label="Заменить изображение"
                        accept="image/*"
                        @update:model-value="uploadLeftChoiceImage(key)"
                        class="q-mb-sm"
                      />
                    </div>
                    <q-checkbox 
                      v-model="leftChoiceIsImage[key]" 
                      label="Это изображение" 
                      @update:model-value="toggleLeftChoiceType(key)"
                    />
                  </div>
                  <q-btn icon="delete" flat dense color="negative" @click="removeLeftChoice(key)" class="q-ml-sm" />
                </div>
                <q-btn label="Добавить левый вариант" color="primary" @click="addLeftChoice" class="q-mt-sm" />
              </div>
              
              <div class="col">
                <div class="text-subtitle2 q-mb-sm">Правые варианты (ответы):</div>
                <div v-for="(choice, key) in editingQuestion.chooses2" :key="`right-${key}`" class="row items-center q-mb-sm">
                  <div class="col">
                    <q-input 
                      v-model="editingQuestion.chooses2[key]" 
                      :label="`Правый вариант ${key}`"
                      v-if="!rightChoiceIsImage[key]"
                    />
                    <div v-else class="column">
                      <q-img 
                        v-if="editingQuestion.chooses2[key]"
                        :src="imageUrls[editingQuestion.chooses2[key].replace(/^image:/, '')]"
                        style="max-height: 100px; max-width: 200px"
                        class="q-mb-sm"
                      />
                      <q-file
                        v-model="rightChoiceImageFiles[key]"
                        label="Заменить изображение"
                        accept="image/*"
                        @update:model-value="uploadRightChoiceImage(key)"
                        class="q-mb-sm"
                      />
                    </div>
                    <q-checkbox 
                      v-model="rightChoiceIsImage[key]" 
                      label="Это изображение" 
                      @update:model-value="toggleRightChoiceType(key)"
                    />
                  </div>
                  <q-btn icon="delete" flat dense color="negative" @click="removeRightChoice(key)" class="q-ml-sm" />
                </div>
                <q-btn label="Добавить правый вариант" color="primary" @click="addRightChoice" class="q-mt-sm" />
              </div>
            </div>
            
            <div class="q-mt-md">
              <div class="text-subtitle2 q-mb-sm">Соответствия:</div>
              <div v-for="(left, key) in editingQuestion.chooses1" :key="`map-${key}`" class="row items-center q-mb-sm">
                <div class="col">
                  <template v-if="leftChoiceIsImage[key] && editingQuestion.chooses1[key]">
                    
                    <q-img 
                        
                      :src="imageUrls[editingQuestion.chooses1[key].replace(/^image:/, '')]"
                      style="max-height: 60px; max-width: 120px"
                    />
                  </template>
                  <template v-else>
                    {{ left }}
                  </template>
                </div>
                <q-select
                  v-model="editingQuestion.answer[key]"
                  :options="Object.keys(editingQuestion.chooses2).map(k => ({ 
                    label: rightChoiceIsImage[k] ? `Изображение ${k}` : `${k}: ${editingQuestion.chooses2[k]}`, 
                    value: k 
                  }))"
                  label="Выберите соответствие"
                  emit-value
                  map-options
                  class="col"
                />
              </div>
            </div>
          </div>
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat label="Отмена" color="negative" v-close-popup />
          <q-btn flat label="Сохранить" color="positive" @click="saveQuestion" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="confirmDeleteDialog">
    <q-card>
      <q-card-section>
        <div class="text-h6">Подтверждение удаления</div>
      </q-card-section>

      <q-card-section>
        Вы уверены, что хотите удалить этот вопрос?
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Отмена" color="primary" v-close-popup />
        <q-btn flat label="Удалить" color="negative" @click="confirmDelete" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute , useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

interface Test {
  count: number;
  time: number;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface Question {
  name: string;
  type: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  answer: any;
  chooses: Record<string, string>;
  chooses1: Record<string, string>;
  chooses2: Record<string, string>;
  image?: string;
}

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const test = ref<Test>({
  count: 0,
  time: 60
});

const questions = computed(() => {
  const result: Record<string, Question> = {};
  for (const key in test.value) {
    if (!['count', 'time'].includes(key)) {
      result[key] = test.value[key];
    }
  }
  return result;
});

const questionTypes = [
  { value: 0, label: 'Один правильный ответ' },
  { value: 1, label: 'Несколько правильных ответов' },
  { value: 2, label: 'Текстовый ответ' },
  { value: 3, label: 'Сопоставление' },
  { value: 4, label: 'Выбор для каждого' }
];

const showDialog = ref(false);
const editingId = ref('');
const editingQuestion = ref<Question>({
  name: '',
  type: 0,
  answer: '',
  chooses: {},
  chooses1: {},
  chooses2: {},
  image: ''
});

const questionImageFile = ref<File | null>(null);
const choiceImageFiles = ref<Record<string, File | null>>({});
const leftChoiceImageFiles = ref<Record<string, File | null>>({});
const rightChoiceImageFiles = ref<Record<string, File | null>>({});

const choiceIsImage = ref<Record<string, boolean>>({});
const leftChoiceIsImage = ref<Record<string, boolean>>({});
const rightChoiceIsImage = ref<Record<string, boolean>>({});

const goBack = () => router.go(-1);

const getQuestionTypeName = (type: number) => {
  const typeObj = questionTypes.find(t => t.value === type);
  
  return typeObj ? typeObj.label : 'Неизвестный тип';
  
};

const imageUrls = ref<Record<string, string>>({});

const loadImage = async (filename: string): Promise<string> => {
  // Удаляем префикс "image:" если он есть
  const cleanFilename = filename.replace(/^image:/, '');
  
  if (!cleanFilename) return '';
  if (imageUrls.value[cleanFilename]) return imageUrls.value[cleanFilename];

  try {
    const { blockName, testId } = route.params;
    const response = await fetch(
      `http://localhost:3000/json-reader?path=${encodeURIComponent(
        `${blockName}/${testId}/${cleanFilename}`
      )}`
    );
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    imageUrls.value[cleanFilename] = url;
    return url;
  } catch (error) {
    console.error('Error loading image:', error);
    return '';
  }
};
const uploadFile = async (file: File): Promise<string | null> => {
  if (!file) return null;
  
  try {
    const { blockName, testId } = route.params;
    const formData = new FormData();
    
    // 1. Кодируем имя файла для передачи
    const encodedFileName = encodeURIComponent(file.name);
    formData.append('file', new File([file], encodedFileName, { type: file.type }));
    formData.append('path', `${(`${blockName}/${testId}`)}`);
    
    const response = await fetch('http://localhost:3000/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept-Charset': 'utf-8'
      }
    });
    
    if (!response.ok) throw new Error('Upload failed');
    
    const result = await response.json();
    loadImage(result.files[0].originalname);
    return `image:${result.files[0].originalname}`; // Возвращаем оригинальное имя
  } catch (error) {
    console.error('Upload error:', error);
    return null;
  }
};

const loadTest = async () => {
  try {
    const { blockName, testId } = route.params;
    const response = await fetch(
      `http://localhost:3000/json-reader?path=${encodeURIComponent(
        `${blockName}/${testId}/test.json`
      )}`
    );
    
    test.value = await response.json();
    
    // Предзагрузка всех изображений
    for (const key in test.value) {
      if (!['count', 'time'].includes(key)) {
        const question = test.value[key];
        
        // Загрузка основного изображения вопроса
        if (question.image) {
          await loadImage(question.image);
        }
        
        // Загрузка изображений для вариантов ответов
        const loadChoicesImages = async (choices: Record<string, string>) => {
          for (const choiceKey in choices) {
            if (choices[choiceKey].startsWith('image:')) {
              await loadImage(choices[choiceKey]);
            }
          }
        };
        if (question.chooses) await loadChoicesImages(question.chooses);
        if (question.chooses1) await loadChoicesImages(question.chooses1);
        if (question.chooses2) await loadChoicesImages(question.chooses2);
      }
    }
  } catch (error) {
    console.error('Error loading test:', error);
  }
};

const saveTest = async () => {
  try {
    const { blockName, testId } = route.params;
    
    const formData = new FormData();
    formData.append('file', new Blob([JSON.stringify(test.value)], { type: 'application/json' }), 'test.json');
    formData.append('path', `${(`${blockName}/${testId}`)}`);
    //formData.append('path', `test/1`);
    console.log(`${blockName}/${testId}`);
    
    const response = await fetch('http://localhost:3000/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) throw new Error('Failed to save test');
    
    $q.notify({
      type: 'positive',
      message: 'Тест успешно сохранен'
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Ошибка сохранения теста: ' + (error as Error).message
    });
  }
};

const addQuestion = () => {
  editingId.value = 'new';
  editingQuestion.value = {
    name: '',
    type: 0,
    answer: '',
    chooses: { '0': '', '1': '' },
    chooses1: { '0': '', '1': '' },
    chooses2: { '0': '', '1': '' },
    image: ''
  };
   if (editingQuestion.value.type === 1) {
    editingQuestion.value.answer = [];
  }
  choiceIsImage.value = {};
  leftChoiceIsImage.value = {};
  rightChoiceIsImage.value = {};
  showDialog.value = true;
};
// Добавьте этот метод в раздел script
const onQuestionTypeChange = () => {
  if (editingQuestion.value.type === 0) {
    // Один правильный ответ - строка
    if (Array.isArray(editingQuestion.value.answer)) {
      editingQuestion.value.answer = editingQuestion.value.answer[0] || '';
    }
  } else if (editingQuestion.value.type === 1) {
    // Несколько правильных ответов - массив
    if (!Array.isArray(editingQuestion.value.answer)) {
      editingQuestion.value.answer = editingQuestion.value.answer ? [editingQuestion.value.answer] : [];
    }
  }
};
const editQuestion = (id: string) => {
  editingId.value = id;
  editingQuestion.value = JSON.parse(JSON.stringify(test.value[id]));
  initChoiceTypes();
  showDialog.value = true;
};

const confirmDeleteDialog = ref(false);
const questionToDelete = ref<string | null>(null);

const deleteQuestion = (id: string) => {
  questionToDelete.value = id;
  confirmDeleteDialog.value = true;
};

const confirmDelete = () => {
  if (questionToDelete.value) {
    delete test.value[questionToDelete.value];
    saveTest();
    questionToDelete.value = null;
  }
};

const saveQuestion = () => {
  if (editingId.value === 'new') {
    const newId = test.value.count.toString();
    test.value[newId] = editingQuestion.value;
  } else {
    test.value[editingId.value] = editingQuestion.value;
  }
  
  showDialog.value = false;
  saveTest();
};

const initChoiceTypes = () => {
  for (const key in editingQuestion.value.chooses) {
    choiceIsImage.value[key] = isImageFile(editingQuestion.value.chooses[key]);
  }
  
  for (const key in editingQuestion.value.chooses1) {
    leftChoiceIsImage.value[key] = isImageFile(editingQuestion.value.chooses1[key]);
  }
  
  for (const key in editingQuestion.value.chooses2) {
    rightChoiceIsImage.value[key] = isImageFile(editingQuestion.value.chooses2[key]);
  }
};

const isImageFile = (filename: string): boolean => {
  if (!filename) return false;
  // Учитываем префикс "image:"
  const cleanFilename = filename.replace(/^image:/, '');
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  return imageExtensions.some(ext => cleanFilename.toLowerCase().endsWith(ext));
};

const uploadQuestionImage = async () => {
  if (!questionImageFile.value) return;
  const filename = await uploadFile(questionImageFile.value);
  console.log('Uploading file:', filename);
  if (filename) {
    editingQuestion.value.image = filename;
    questionImageFile.value = null;
  }
};

const uploadChoiceImage = async (key: string) => {
  const file = choiceImageFiles.value[key];
  if (!file) return;
  const filename = await uploadFile(file);
  console.log('Uploading file:', filename);
  if (filename) {
    editingQuestion.value.chooses[key] = filename;
    choiceImageFiles.value[key] = null;
  }
};

const uploadLeftChoiceImage = async (key: string) => {
  const file = leftChoiceImageFiles.value[key];
  if (!file) return;
  const filename = await uploadFile(file);
  console.log('Uploading file:', filename);
  if (filename) {
    editingQuestion.value.chooses1[key] = filename;
    leftChoiceImageFiles.value[key] = null;
  }
};

const uploadRightChoiceImage = async (key: string) => {
  const file = rightChoiceImageFiles.value[key];
  if (!file) return;
  const filename = await uploadFile(file);
  console.log('Uploading file:', filename);
  if (filename) {
    editingQuestion.value.chooses2[key] = filename;
    rightChoiceImageFiles.value[key] = null;
  }
};

const removeQuestionImage = () => {
  editingQuestion.value.image = '';
};

const addChoice = () => {
  const keys = Object.keys(editingQuestion.value.chooses);
  const newKey = keys.length ? (Math.max(...keys.map(k => parseInt(k))) + 1).toString() : '0';
  editingQuestion.value.chooses[newKey] = '';
  choiceIsImage.value[newKey] = false;
};

const toggleChoiceType = (key: string) => {
  if (!choiceIsImage.value[key]) {
    editingQuestion.value.chooses[key] = '';
  }
};

const removeChoice = (key: string) => {
  if (Object.keys(editingQuestion.value.chooses).length <= 2) {
    $q.notify('Должно быть хотя бы 2 варианта ответа');
    return;
  }
  
  delete editingQuestion.value.chooses[key];
  delete choiceIsImage.value[key];
  
  if (editingQuestion.value.type === 0) {
    if (editingQuestion.value.answer === key) {
      editingQuestion.value.answer = '';
    }
  } else {
    if (Array.isArray(editingQuestion.value.answer)) {
      editingQuestion.value.answer = editingQuestion.value.answer.filter((a: string) => a !== key);
    }
  }
};

const addLeftChoice = () => {
  const keys = Object.keys(editingQuestion.value.chooses1);
  const newKey = keys.length ? (Math.max(...keys.map(k => parseInt(k))) + 1).toString() : '0';
  editingQuestion.value.chooses1[newKey] = '';
  leftChoiceIsImage.value[newKey] = false;
  
  editingQuestion.value.answer = editingQuestion.value.answer || {};
  editingQuestion.value.answer[newKey] = '';
};

const toggleLeftChoiceType = (key: string) => {
  if (!leftChoiceIsImage.value[key]) {
    editingQuestion.value.chooses1[key] = '';
  }
};

const removeLeftChoice = (key: string) => {
  if (Object.keys(editingQuestion.value.chooses1).length <= 2) {
    $q.notify('Должно быть хотя бы 2 варианта');
    return;
  }
  
  delete editingQuestion.value.chooses1[key];
  delete leftChoiceIsImage.value[key];
  
  editingQuestion.value.answer = editingQuestion.value.answer || {};
  delete editingQuestion.value.answer[key];
};

const addRightChoice = () => {
  const keys = Object.keys(editingQuestion.value.chooses2);
  const newKey = keys.length ? (Math.max(...keys.map(k => parseInt(k))) + 1).toString() : '0';
  editingQuestion.value.chooses2[newKey] = '';
  rightChoiceIsImage.value[newKey] = false;
};

const toggleRightChoiceType = (key: string) => {
  if (!rightChoiceIsImage.value[key]) {
    editingQuestion.value.chooses2[key] = '';
  }
};


const removeRightChoice = (key: string) => {
  if (Object.keys(editingQuestion.value.chooses2).length <= 2) {
    $q.notify('Должно быть хотя бы 2 варианта');
    return;
  }
  
  delete editingQuestion.value.chooses2[key];
  delete rightChoiceIsImage.value[key];
  
  editingQuestion.value.answer = editingQuestion.value.answer || {};
  for (const leftKey in editingQuestion.value.answer) {
    if (editingQuestion.value.answer[leftKey] === key) {
      editingQuestion.value.answer[leftKey] = '';
    }
  }
};

onMounted(() => {
  loadTest();
});
</script>

<style scoped>
.q-item {
  cursor: pointer;
}
.q-item:hover {
  background-color: #f5f5f5;
}
</style>