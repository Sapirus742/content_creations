<template>
  <div class="q-pa-md">
    <q-btn
      flat
      color="primary"
      icon="arrow_back"
      label="Назад"
      @click="goToMainPage"
      class="q-mb-md"
    />

    <div class="text-h4 q-mb-md">Управление информационными блоками</div>

    <q-tabs v-model="tab" class="text-primary">
      <q-tab name="create" label="Создать блок" @click="toCreate"/>
      <q-tab name="edit" label="Редактировать блок" @click="toEdit"/>
    </q-tabs>

    <q-tab-panels v-model="tab" animated>
      <!-- Панель создания нового блока -->
      <q-tab-panel name="create">
        <div class="row q-col-gutter-md">
          <div class="col-12">
            <q-input
              v-model="newBlock.name"
              label="Название блока"
              outlined
              :rules="[val => !!val || 'Обязательное поле']"
            />
          </div>
          
          <div class="col-12">
            <q-input
              v-model="newBlock.description"
              label="Описание блока"
              outlined
              type="textarea"
            />
          </div>
        
          <div class="col-12 q-mt-md">
            <q-btn
              color="primary"
              label="Создать блок"
              @click="createBlock"
              :loading="creatingBlock"
            />
          </div>
        </div>
      </q-tab-panel>

      <!-- Панель редактирования существующих блоков -->
      <q-tab-panel name="edit">
        <div class="row q-col-gutter-md">
          <div class="col-12">
           <q-select
              v-model="selectedBlock"
              :options="blockOptions"
              option-label="name"
              label="Выберите блок"
              outlined
              map-options
              emit-value
              use-input
              input-debounce="300"
              @filter="filterBlocks"
              @update:model-value="loadBlockDetails"
              
            >
              <template v-slot:selected-item="scope">
                <span>{{ scope.opt.name }} || </span>
                <span>Поиск:</span>
              </template>
              
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    Ничего не найдено
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <template v-if="selectedBlock">
            <div class="col-12">
              <q-input
                v-model="editBlock.name"
                label="Название блока"
                outlined
                :rules="[val => !!val || 'Обязательное поле']"
                :disable="!change"
              />
            </div>
            
            <div class="col-12">
              <q-input
                v-model="editBlock.description"
                label="Описание блока"
                outlined
                type="textarea"
                :disable="!change"
              />
            </div>

            <!-- Объединенный список материалов -->
            <div class="col-12">
              <div class="row items-center q-mb-sm">
                <div class="text-h6">Материалы блока</div>
                <q-space />
                <div class="col-12">
                <template v-if="change">
                  <q-btn 
                    color="primary" 
                    icon="add" 
                    label="Добавить лекцию" 
                    @click="showAddLectureDialog"
                    class="q-ml-md"
                  />
                  <q-btn 
                    color="primary" 
                    icon="add" 
                    label="Добавить лабораторную" 
                    @click="showAddLabDialog"
                    class="q-ml-md"
                  />
                  <q-btn 
                    color="primary" 
                    icon="add" 
                    label="Добавить тест" 
                    @click="showAddTestDialog"
                    class="q-ml-md"
                  />
                </template>
                </div>
              </div>
              
              <q-list bordered separator>
                <q-item v-for="item in sortedMaterials" :key="item.id + '-' + item.type">
                  <q-item-section>
                    <q-item-label>
                      {{ item.id }}. {{ item.name }}
                      <q-chip dense color="primary" text-color="white" class="q-ml-sm">
                        {{ getTypeLabel(item.type) }}
                      </q-chip>
                    </q-item-label>
                    <q-item-label v-if="item.path" caption>{{ item.path }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <div class="row q-gutter-sm">
                      <template v-if="item.type === 'lecture'">
                        <q-btn flat round icon="play_circle" color="primary" @click="openLecture(Number(item.id))" />
                      </template>
                      <template v-else-if="item.type === 'lab'">
                        <q-btn flat round icon="edit" color="primary" @click="openLabResponse(item.id)" />
                      </template>
                      <template v-else-if="item.type === 'test'">
                        <q-btn flat round icon="edit" color="primary" @click="editTest(item.id)" :disable="!change" />
                      </template>
                      <!-- В разделе q-item-section side, рядом с кнопкой удаления -->
                      <template v-if="change">
                        <q-btn flat round icon="arrow_upward" color="primary" 
                              @click.stop="moveItemUp(item)" :disable="isFirstItem(item)" />
                        <q-btn flat round icon="arrow_downward" color="primary" 
                              @click.stop="moveItemDown(item)" :disable="isLastItem(item)" />
                        <q-btn
                          flat
                          round
                          icon="delete"
                          color="negative"
                          @click="confirmDelete(item)"
                          :disable="!change"
                        />
                      </template>
                      
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <div class="col-6 q-mt-md">
              <q-btn
                color="primary"
                label="Сохранить изменения"
                @click="updateBlock"
                :loading="updatingBlock"
                :disable="!change"
              />
            </div>
            
            <div v-if="!change" class="col-6 q-mt-md">
              <q-btn
                color="primary"
                label="Сделать редактируемую копию"
                @click="copyBlock"
                :loading="updatingBlock"
                :disable="change"
              />
            </div>
            <div v-if="change" class="col-6 q-mt-md">
              <q-btn
                color="primary"
                label="Сделать нередактируемой"
                @click="updateChangeBlock"
                :loading="updatingBlock"
                :disable="!change"
              />
            </div>
          </template>
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <!-- Диалог добавления лекции -->
    <q-dialog v-model="addLectureDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Добавить новую лекцию</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="newLectureName"
            label="Название лекции"
            outlined
            class="q-mb-md"
          />
          <q-file
            v-model="newLectureFile"
            label="Видеофайл лекции"
            accept="video/*"
            outlined
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Отмена" color="primary" v-close-popup />
          <q-btn 
            flat 
            label="Добавить" 
            color="primary" 
            @click="uploadLecture"
            :disable="!newLectureName || !newLectureFile"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Диалог добавления лабораторной -->
    <q-dialog v-model="addLabDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Добавить новую лабораторную работу</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="newLabName"
            label="Название лабораторной"
            outlined
            class="q-mb-md"
          />
          <q-file
            v-model="newLabFile"
            label="Файл лабораторной"
            outlined
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Отмена" color="primary" v-close-popup />
          <q-btn 
            flat 
            label="Добавить" 
            color="primary" 
            @click="uploadLab"
            :disable="!newLabName || !newLabFile"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Диалог добавления теста -->
    <q-dialog v-model="addTestDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Добавить новый тест</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-file
            v-model="newTestFile"
            label="Файл теста (JSON)"
            accept=".json"
            outlined
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Отмена" color="primary" v-close-popup />
          <q-btn 
            flat 
            label="Добавить" 
            color="primary" 
            @click="uploadTest"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Диалог просмотра лекции -->
    <q-dialog v-model="lectureDialog" persistent>
      <q-card v-if="currentLecture.url" style="width: 70vh; max-width: 900px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ currentLecture.title }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <video 
            controls 
            style="width: 100%; max-height: 70vh; object-fit: contain;"
            :src="currentLecture.url"
          ></video>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Диалог лабораторной работы -->
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
                  <q-btn 
                    v-if="change"
                    icon="delete" 
                    flat 
                    round 
                    dense 
                    color="negative"
                    @click.stop="confirmDeleteLabFile(file)"
                  />
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
              label="Загрузить новый файл"
              :disable="!change"
            />
          </div>
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat label="Отправить" color="primary" @click="submitLab" :disable="!change"/>
          <q-btn flat label="Закрыть" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!--Диалог для удаления материала-->
    <q-dialog v-model="confirmDeleteDialog" persistent>
  <q-card style="min-width: 300px">
    <q-card-section>
      <div class="text-h6">Подтверждение удаления</div>
    </q-card-section>

    <q-card-section class="q-pt-none">
      Вы уверены, что хотите удалить этот элемент?
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat label="Отмена" color="primary" v-close-popup />
      <q-btn 
        flat 
        label="Удалить" 
        color="negative" 
        @click="executeDelete"
      />
    </q-card-actions>
  </q-card>
</q-dialog>
  <!-- Диалог подтверждения удаления файла лабораторной -->
  <q-dialog v-model="confirmFileDeleteDialog" persistent>
    <q-card style="min-width: 300px">
      <q-card-section>
        <div class="text-h6">Подтверждение удаления файла</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        Вы уверены, что хотите удалить файл "{{ fileToDelete?.name }}"?
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Отмена" color="primary" v-close-popup />
        <q-btn 
          flat 
          label="Удалить" 
          color="negative" 
          @click="deleteLabFile"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { InformBlocksStatus } from '../../../backend/src/common/types';
import { ContentHandler } from './fileHandler';

const $q = useQuasar();
const router = useRouter();
const route = useRoute();
const API_ENDPOINT = process.env.API_ENDPOINT || 'http://localhost:3000';
let change = false;

// Состояние компонента
const tab = ref(route.path.includes('edit') ? 'edit' : 'create');

//eslint-disable-next-line @typescript-eslint/no-explicit-any
let blocks = ref<any[]>([]);
//eslint-disable-next-line @typescript-eslint/no-explicit-any
const selectedBlock = ref<any>(null);
const creatingBlock = ref(false);
const updatingBlock = ref(false);
const blockId = route.params.block;
//eslint-disable-next-line @typescript-eslint/no-explicit-any
const blockOptions = ref<any[]>([]);
// Диалоговые окна
const addLectureDialog = ref(false);
const addLabDialog = ref(false);
const addTestDialog = ref(false);
const lectureDialog = ref(false);
const labDialog = ref(false);
const confirmDeleteDialog = ref(false);
const itemToDelete = ref<{id: number, type: string} | null>(null);
const confirmFileDeleteDialog = ref(false);
const fileToDelete = ref<{path: string, name: string} | null>(null);
// Текущие элементы
const currentLecture = ref({
  title: '',
  url: ''
});

const currentLab = ref({
  title: '',
  path: '',
  number: 0
});

// Данные для форм
const newBlock = ref({
  name: '',
  description: '',
  tags: [] as string[],
});

const editBlock = ref({
  name: '',
  description: '',
  tags: [] as string[],
});

// Файлы и данные для загрузки
const newLectureFile = ref<File | null>(null);
const newLectureName = ref('');
const newLabFile = ref<File | null>(null);
const newLabName = ref('');
const newTestFile = ref<File | null>(null);

// Списки элементов блока
//eslint-disable-next-line @typescript-eslint/no-explicit-any
const lectures = ref<any[]>([]);
//eslint-disable-next-line @typescript-eslint/no-explicit-any
const labs = ref<any[]>([]);
//eslint-disable-next-line @typescript-eslint/no-explicit-any
const tests = ref<any[]>([]);

// Состояние для лабораторных работ
const labFiles = ref<{name: string, path: string}[]>([]);
const loadingFiles = ref(false);
const labAnswerFile = ref<File | null>(null);

// Объединенный и отсортированный список материалов
const sortedMaterials = computed(() => {
  const materials = [
    ...lectures.value.map(lecture => ({ ...lecture, type: 'lecture' })),
    ...labs.value.map(lab => ({ ...lab, type: 'lab' })),
    ...tests.value.map(test => ({ ...test, type: 'test' }))
  ];
  return materials.sort((a, b) => a.id - b.id);
});

const getTypeLabel = (type: string) => {
  switch(type) {
    case 'lecture': return 'Лекция';
    case 'lab': return 'Лабораторная';
    case 'test': return 'Тест';
    default: return '';
  }
};

// Методы
const toCreate = () => {
  router.push(`/create-block/create/${blockId}`).then(() => {
    window.location.reload();
  });
};

const toEdit = () => {
  router.push(`/create-block/edit/${blockId}`).then(() => {
    window.location.reload();
  });
};

const goToMainPage = () => {
  router.push('/create-course');
};

const showAddLectureDialog = () => {
  newLectureName.value = '';
  newLectureFile.value = null;
  addLectureDialog.value = true;
};

const showAddLabDialog = () => {
  newLabName.value = '';
  newLabFile.value = null;
  addLabDialog.value = true;
};

const showAddTestDialog = () => {
  newTestFile.value = null;
  addTestDialog.value = true;
};

const submitLab = async() => {
  if (labAnswerFile.value && selectedBlock.value && change) {
    console.log(labs.value[currentLab.value.number-1].id)
    await uploadFile(labAnswerFile.value,`${selectedBlock.value.id}_${selectedBlock.value.name}/${labs.value[currentLab.value.number-1].id}`)
    labDialog.value = false;
    labAnswerFile.value = null;
  }
};

const uploadFile = async (file: File, Path: string): Promise<string | null> => {
  if (!file) return null;
  console.log(Path)
  try {
    const formData = new FormData();
    const encodedFileName = encodeURIComponent(file.name);
    formData.append('file', new File([file], encodedFileName, { type: file.type }));
    formData.append('path', `${(`${Path}`)}`);
    
    const response = await fetch(`${process.env.API_ENDPOINT}/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept-Charset': 'utf-8'
      }
    });
    
    if (!response.ok) throw new Error('Upload failed');
    
    const result = await response.json();
    return `image:${result.files[0].originalname}`;
  } catch (error) {
    console.error('Upload error:', error);
    return null;
  }
};

const downloadLabFile = async (filePath: string) => {
  try {
    const response = await fetch(`${process.env.API_ENDPOINT}/json-reader?path=${encodeURIComponent(filePath)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    const fileName = filePath.split('/').pop() || 'download';
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(downloadUrl);
    a.remove();
    
    return true;
  } catch (error) {
    console.error('Error downloading file:', error);
    return false;
  }
};

const openLabResponse = async (labNum: number) => {
  try {
    const blockPath = `${selectedBlock.value.id}_${selectedBlock.value.name}`;
    let cleanName = '';
    loadingFiles.value = true;
    labFiles.value = await ContentHandler.getLabFiles(blockPath, labNum);
    const filesread = labFiles.value;
    
    for (const fileName of filesread) {
      if (fileName.name.startsWith('lab_')) {
        cleanName = fileName.name.replace(/^lab_/, '').replace(/\.[^/.]+$/, '');
        console.log(cleanName);
      }
    }
    
    currentLab.value = {
      title: cleanName,
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

const openLecture = async (lectureNum: number) => {
  try {
    const blockName = selectedBlock.value.name;
    const lPath = `${selectedBlock.value.id}_${selectedBlock.value.name}`;
    const idLecture = lectures.value.findIndex(lectureh => lectureh.id === lectureNum);
    const lecture = await ContentHandler.getLectureInfo(blockName, lectureNum, lPath, idLecture);
    
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

const loadBlocks = async () => {
  try {
    const response = await fetch(`${API_ENDPOINT}/inform_blocks`);
    if (!response.ok) throw new Error('Ошибка загрузки блоков');
    const data = await response.json();
    // Сортируем блоки по id
    blocks.value = data.sort((a: {id: number}, b: {id: number}) => a.id - b.id);
  } catch (error) {
    console.error('Ошибка загрузки блоков:', error);
  }
};

const copyBlock = async () => {
  creatingBlock.value = true;
  try {
    const response = await fetch(`${API_ENDPOINT}/inform_blocks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: selectedBlock.value.name,
        description: selectedBlock.value.description,
        status: 'Changing',
        test_numbers: selectedBlock.value.test_numbers,
        lab_numbers: selectedBlock.value.lab_numbers,
        lecture_numbers: selectedBlock.value.lecture_numbers
      })
    });

    if (!response.ok) throw new Error('Ошибка создания блока');

    const data = await response.json();
    console.log(data);
    const sourcePath = String(selectedBlock.value.id) + '_' + selectedBlock.value.name;
    const destinationPath = String(data.id) + '_' + data.name;
    console.log(sourcePath);
    console.log(destinationPath);
    
    try {
      const response = await fetch(`${API_ENDPOINT}/copyfolder/copy?source=${encodeURIComponent(sourcePath)}&destination=${encodeURIComponent(destinationPath)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to copy folder');
      }
    } catch (error) {
      throw new Error('Network error occurred');
    }
    
    tab.value = 'edit';
    router.push(`/create-block/edit/${data.id}`).then(() => {
      window.location.reload();
    });
    loadBlockDetails();
  } catch (error) {
    console.error('Ошибка создания блока:', error);
  } finally {
    creatingBlock.value = false;
  }
};

const createBlock = async () => {
  if (!newBlock.value.name) {
    return;
  }

  creatingBlock.value = true;
  try {
    const response = await fetch(`${API_ENDPOINT}/inform_blocks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: newBlock.value.name,
        description: newBlock.value.description,
        status: InformBlocksStatus.changing
      })
    });

    if (!response.ok) throw new Error('Ошибка создания блока');

    const data = await response.json();
    await loadBlocks();
    tab.value = 'edit';
    selectedBlock.value = data;
    console.log(data.id)
    router.push(`/create-block/edit/${data.id}`).then(() => {
      window.location.reload();
    });
    loadBlockDetails();
  } catch (error) {
    console.error('Ошибка создания блока:', error);
  } finally {
    creatingBlock.value = false;
  }
};

const loadBlockDetails = async () => {
  if (selectedBlock.value.id != Number(blockId)) {
    router.push(`/create-block/edit/${selectedBlock.value.id}`).then(() => {
      window.location.reload();
    });
    return;
  }
  
  if (!selectedBlock.value) return;

  try {
    const response = await fetch(`${API_ENDPOINT}/inform_blocks/${selectedBlock.value.id}`);
    if (!response.ok) throw new Error('Ошибка загрузки блока');
    const block = await response.json();

    editBlock.value = {
      name: block.name,
      description: block.description,
      tags: block.tegs || [],
    };

    await loadLectures();
    await loadLabs();
    await loadTests();
  } catch (error) {
    console.error('Ошибка загрузки блока:', error);
  }
};

const loadLectures = async () => {
  if (!selectedBlock.value) return;

  try {
    const blockName = `${selectedBlock.value.id}_${selectedBlock.value.name}`;
    const response = await fetch(`${API_ENDPOINT}/listfiles/list?path=${encodeURIComponent(blockName)}`);
    if (!response.ok) throw new Error('Ошибка загрузки лекций');
    const data = await response.json();

    lectures.value = data.files
      .filter((file: string) => /^\d+_.+\.mp4$/.test(file))
      .map((file: string) => {
        const [id, ...nameParts] = file.split('_');
        return {
          id: parseInt(id),
          name: nameParts.join('_').replace('.mp4', ''),
          path: `${blockName}/${file}`
        };
      });
  } catch (error) {
    console.error('Ошибка загрузки лекций:', error);
    lectures.value = [];
  }
};

const loadLabs = async () => {
  if (!selectedBlock.value) return;

  try {
    const blockName = `${selectedBlock.value.id}_${selectedBlock.value.name}`;
    const response = await fetch(`${API_ENDPOINT}/listfiles/list?path=${encodeURIComponent(blockName)}`);
    if (!response.ok) throw new Error('Ошибка загрузки лабораторных');
    const data = await response.json();

    const labDirs = data.files.filter((file: string) => /^\d+$/.test(file));

    labs.value = await Promise.all(
      labDirs.map(async (dir: string) => {
        const labFilesResponse = await fetch(`${API_ENDPOINT}/listfiles/list?path=${encodeURIComponent(`${blockName}/${dir}`)}`);
        const labFilesData = await labFilesResponse.json();
        
        const labFile = labFilesData.files.find((file: string) => file.startsWith('lab_'));
        const hasTest = labFilesData.files.includes('test.json');
        
        if (!hasTest ? `${blockName}/${dir}/test.json` : null) {
          return {
            id: parseInt(dir),
            name: labFile ? labFile.replace('lab_', '').replace(/\.[^/.]+$/, '') : `Лабораторная ${dir}`,
            path: `${blockName}/${dir}/${labFile}`
          };
        } else {
          return {
            id: null,
            name: null,
            path: null
          }; 
        }
      })
    );
    labs.value = labs.value.filter(lab => lab.id !== null);
  } catch (error) {
    console.error('Ошибка загрузки лабораторных:', error);
    labs.value = [];
  }
};

const loadTests = async () => {
  if (!selectedBlock.value) return;

  try {
    const blockName = `${selectedBlock.value.id}_${selectedBlock.value.name}`;
    const response = await fetch(`${API_ENDPOINT}/listfiles/list?path=${encodeURIComponent(blockName)}`);
    if (!response.ok) throw new Error('Ошибка загрузки тестов');
    const data = await response.json();

    const testDirs = data.files.filter((file: string) => /^\d+$/.test(file));

    tests.value = await Promise.all(
      testDirs.map(async (dir: string) => {
        const testFilesResponse = await fetch(`${API_ENDPOINT}/listfiles/list?path=${encodeURIComponent(`${blockName}/${dir}`)}`);
        const testFilesData = await testFilesResponse.json();
        
        const hasTest = testFilesData.files.includes('test.json');
        if (hasTest ? `${blockName}/${dir}/test.json` : null) {
          return {
            id: parseInt(dir),
            name: `Тест ${dir}`,
            path: `${blockName}/${dir}/test.json`
          };
        } else {
          return {
            id: null,
            name: null,
            path: null
          };
        }
      })
    );
    tests.value = tests.value.filter(test => test.id !== null);
  } catch (error) {
    console.error('Ошибка загрузки тестов:', error);
    tests.value = [];
  }
};

const uploadLecture = async () => {
  if (!change || !newLectureName.value || !newLectureFile.value || !selectedBlock.value) {
    addLectureDialog.value = false;
    return;
  }

  try {
    const blockName = `${selectedBlock.value.id}_${selectedBlock.value.name}`;
    const nextId = getNextId();
    const fileName = `${nextId}_${newLectureName.value}.mp4`;

    const formData = new FormData();
    const file = newLectureFile.value;
    const encodedFileName = encodeURIComponent(fileName);
    formData.append('file', new File([file], encodedFileName, { type: file.type }));
    formData.append('path', blockName);

    const response = await fetch(`${API_ENDPOINT}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Ошибка загрузки лекции');
    await updateBlock();
    await loadBlockDetails();
    newLectureFile.value = null;
    newLectureName.value = '';
    addLectureDialog.value = false;
  } catch (error) {
    console.error('Ошибка загрузки лекции:', error);
  }
};

const uploadLab = async () => {
  if (!change || !newLabFile.value || !newLabName.value || !selectedBlock.value) {
    addLabDialog.value = false;
    return;
  }

  try {
    const blockName = `${selectedBlock.value.id}_${selectedBlock.value.name}`;
    const nextId = getNextId();
    const dirName = `${nextId}`;
    const fileName = `lab_${newLabName.value}.${newLabFile.value.name.split('.').pop()}`;

    const formData = new FormData();
    const file = newLabFile.value;
    const encodedFileName = encodeURIComponent(fileName);
    formData.append('file', new File([file], encodedFileName, { type: file.type }));
    formData.append('path', `${blockName}/${dirName}`);

    const response = await fetch(`${API_ENDPOINT}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Ошибка загрузки лабораторной');
    await updateBlock();
    await loadBlockDetails();
    newLabFile.value = null;
    newLabName.value = '';
    addLabDialog.value = false;
  } catch (error) {
    console.error('Ошибка загрузки лабораторной:', error);
  }
};

const getNextId = () => {
  const allIds = [
    Math.max(...lectures.value.map(l => l.id), 0),
    Math.max(...labs.value.map(l => l.id), 0),
    Math.max(...tests.value.map(t => t.id), 0),
    0
  ];
  
  return Math.max(...allIds) + 1;
};

const uploadTest = async () => {
  if (!change || !selectedBlock.value) {
    addTestDialog.value = false;
    return;
  }

  try {
    const blockName = `${selectedBlock.value.id}_${selectedBlock.value.name}`;
    const nextId = getNextId();
    const dirName = `${nextId}`;
    const formData = new FormData();
    const filedata = {};
    const test = newTestFile.value != null ? newTestFile.value : filedata;
    console.log(newTestFile.value?.name);
    formData.append('file', new Blob([JSON.stringify(test)], { type: 'application/json' }), 'test.json');
    formData.append('path', `${blockName}/${dirName}`);

    const response = await fetch(`${API_ENDPOINT}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Ошибка загрузки теста');
    await updateBlock();
    await loadBlockDetails();
    newTestFile.value = null;
    addTestDialog.value = false;
  } catch (error) {
    console.error('Ошибка загрузки теста:', error);
  }
};

const deleteItem = async (id: number, type: string) => {
  if (!change || !selectedBlock.value) return;
  try {
    let nameL;
     if(type=='lecture'){
          
          const lecture = sortedMaterials.value.find(item => 
              item.type === 'lecture' && item.id === id
          );
          nameL=`${lecture.name}.mp4`;
        }
      console.log(nameL);
    const materialsToShift = sortedMaterials.value.filter(m => m.id > id);
     for (const material of materialsToShift) {
        await moveItemUp(material);
     }
     const idDelete =getNextId()-1;
     try {
        const blockPath = `${selectedBlock.value.id}_${selectedBlock.value.name}`;
        let pathToDelete = '';
        pathToDelete = `${idDelete}`;
        if(type=='lecture'){
          pathToDelete=`${idDelete}_${nameL}`;
        }
        // Определяем путь в зависимости от типа элемента
        
        if (!pathToDelete) {
          throw new Error('Не удалось определить путь для удаления');
        }
        pathToDelete=`${blockPath}/${pathToDelete}`
        // Отправляем запрос на удаление
        console.log(pathToDelete);
        const response = await fetch(`${API_ENDPOINT}/deletefiles?path=${encodeURIComponent(pathToDelete)}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Ошибка при удалении');
        }
        await updateBlock();
        await loadBlockDetails();
    } catch (error) {
        console.error(`Ошибка удаления ${type}:`, error);
    }
  } catch (error) {
    console.error(`Ошибка удаления ${type}:`, error);
  }
};

const editTest = (id: number) => {
  if (change) {
    const test = tests.value.find(t => t.id === id);
    if (!test || !test.path) return;
    router.push(`/edit/${test.path.replace('/test.json', '')}`);
  }
};

const updateBlock = async () => {
  if (!change || !selectedBlock.value) return;
  await loadBlockDetails();
  updatingBlock.value = true;
  try {
    const response = await fetch(`${API_ENDPOINT}/inform_blocks/${selectedBlock.value.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: editBlock.value.name,
        description: editBlock.value.description,
        lecture_numbers: lectures.value.map(l => l.id),
        lab_numbers: labs.value.map(l => l.id),
        test_numbers: tests.value.map(l => l.id),
      })
    });

    if (!response.ok) throw new Error('Ошибка обновления блока');

    
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Ошибка обновления блока',
      position: 'top'
    });
    console.error('Ошибка обновления блока:', error);
  } finally {
    updatingBlock.value = false;
  }
};

const updateChangeBlock = async () => {
  if (!change || !selectedBlock.value) return;

  updatingBlock.value = true;
  try {
    const response = await fetch(`${API_ENDPOINT}/inform_blocks/${selectedBlock.value.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: editBlock.value.name,
        description: editBlock.value.description,
        lecture_numbers: lectures.value.map(l => l.id),
        lab_numbers: labs.value.map(l => l.id),
        test_numbers: tests.value.map(l => l.id),
        status: InformBlocksStatus.ready,
      })
    });

    if (!response.ok) throw new Error('Ошибка обновления блока');

    await loadBlocks();
    window.location.reload();
  } catch (error) {
    console.error('Ошибка обновления блока:', error);
  } finally {
    updatingBlock.value = false;
  }
};

// Проверка, является ли элемент первым в общем списке
const isFirstItem = (item: {id: number, type: string}) => {
  return sortedMaterials.value[0].id === item.id && 
         sortedMaterials.value[0].type === item.type;
};

// Проверка, является ли элемент последним в общем списке
const isLastItem = (item: {id: number, type: string}) => {
  const last = sortedMaterials.value[sortedMaterials.value.length - 1];
  return last.id === item.id && last.type === item.type;
};

// Получение предыдущего элемента любого типа
const getPreviousItem = (item: {id: number, type: string}) => {
  const index = sortedMaterials.value.findIndex(
    m => m.id === item.id && m.type === item.type
  );
  return index > 0 ? sortedMaterials.value[index - 1] : null;
};

// Получение следующего элемента любого типа
const getNextItem = (item: {id: number, type: string}) => {
  const index = sortedMaterials.value.findIndex(
    m => m.id === item.id && m.type === item.type
  );
  return index < sortedMaterials.value.length - 1 
    ? sortedMaterials.value[index + 1] 
    : null;
};

// Основной метод для перемещения элементов
const swapItems = async (item1: {id: number, type: string}, item2: {id: number, type: string}) => {
  if (!change || !selectedBlock.value) return;

  const blockPath = `${selectedBlock.value.id}_${selectedBlock.value.name}`;
  
  try {
    // Временные пути для избежания конфликтов
    const tempPath1 = `${blockPath}/temp_${Date.now()}_${item1.id}`;
    
    // Получаем реальные пути
    const path1 = getFullPath(item1);
    const path2 = getFullPath(item2);
    const path1new =getFullPathNew(item1,item2);
    const path2new =getFullPathNew(item2,item1);
    if (!path1 || !path2||!path1new||!path2new) return;
    // 1. Перемещаем первый элемент во временное место
    await renameItem(path1, tempPath1);
    
    // 2. Перемещаем второй элемент на место первого
    await renameItem(path2, path2new);
    
    // 3. Перемещаем первый элемент из временного места на место второго
    await renameItem(tempPath1, path1new);
    
    // Обновляем данные
    await updateBlock();
    await loadBlockDetails();
  } catch (error) {
    console.error('Ошибка при перемещении элементов:', error);
  }
};
//Новый путь
const getFullPathNew = (item: {id: number, type: string},item2: {id: number, type: string}) => {
  const blockPath=`${selectedBlock.value.id}_${selectedBlock.value.name}`;
  if (item.type === 'lecture') {
    const lecture = lectures.value.find(l => l.id === item.id);
    return lecture ? `${blockPath}/${item2.id}_${lecture.name}.mp4` : null;
  } else {
    return `${blockPath}/${item2.id}`;
  }
};
// Вспомогательный метод для получения полного пути
const getFullPath = (item: {id: number, type: string}) => {
  const blockPath=`${selectedBlock.value.id}_${selectedBlock.value.name}`;
  if (item.type === 'lecture') {
    const lecture = lectures.value.find(l => l.id === item.id);
    return lecture ? `${blockPath}/${lecture.path.split('/').pop()}` : null;
  } else {
    return `${blockPath}/${item.id}`;
  }
};

// Метод для переименования через API
const renameItem = async (oldPath: string, newPath: string) => {
  try {
    const response = await fetch(`${API_ENDPOINT}/rename`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        oldPath,
        newName: newPath.split('/').pop()
      })
    });
    
    if (!response.ok) throw new Error('Rename failed');
  } catch (error) {
    console.error('Rename error:', error);
    throw error;
  }
};

// Методы для кнопок вверх/вниз
const moveItemUp = async (item: {id: number, type: string}) => {
  const prevItem = getPreviousItem(item);
  if (prevItem) {
    await swapItems(item, prevItem);
  }
};

const moveItemDown = async (item: {id: number, type: string}) => {
  const nextItem = getNextItem(item);
  if (nextItem) {
    await swapItems(nextItem, item);
  }
};

const confirmDelete = (item: {id: number, type: string}) => {
  itemToDelete.value = item;
  confirmDeleteDialog.value = true;
};

const executeDelete = async () => {
  if (itemToDelete.value) {
    await deleteItem(itemToDelete.value.id, itemToDelete.value.type);
    confirmDeleteDialog.value = false;
    itemToDelete.value = null;
  }
};
const confirmDeleteLabFile = (file: {path: string, name: string}) => {
  fileToDelete.value = file;
  confirmFileDeleteDialog.value = true;
};
const deleteLabFile = async () => {
  if (!fileToDelete.value) return;

  try {
    const response = await fetch(`${API_ENDPOINT}/deletefiles?path=${encodeURIComponent(fileToDelete.value.path)}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('Ошибка при удалении файла');

    // Обновляем список файлов
    await openLabResponse(currentLab.value.number);
   
  } catch (error) {
    console.error('Ошибка удаления файла:', error);
  } finally {
    fileToDelete.value = null;
  }
};
const filterBlocks = (val: string, update: (callback: () => void) => void) => {
  if (val === '') {
    update(() => {
      blockOptions.value = blocks.value;
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    blockOptions.value = blocks.value.filter(
      block => block.name.toLowerCase().includes(needle)
    );
  });
};
// Инициализация
onMounted(async () => {
  await loadBlocks();
  blockOptions.value = blocks.value;
  if (blockId != '0') {
    selectedBlock.value = blocks.value.find(block => block.id ===Number(blockId));
    loadBlockDetails();
  }
  change = InformBlocksStatus.changing == selectedBlock.value?.status;
});
</script>

<style scoped>
.q-tab-panel {
  padding: 16px 0;
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
.q-btn--round {
  margin: 0 2px;
}
</style>