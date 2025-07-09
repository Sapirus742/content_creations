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
              :options="blocks"
              option-label="name"
              label="Выберите блок"
              outlined
              map-options
              emit-value
              @update:model-value="loadBlockDetails"
            />
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

            <!-- Управление лекциями -->
            <div class="col-12">
              <div class="text-h6 q-mb-sm">Лекции</div>
              <q-list bordered separator>
                <q-item v-for="lecture in lectures" :key="lecture.id">
                  <q-item-section>
                    <q-item-label>{{ lecture.id }}. {{ lecture.name }}</q-item-label>
                    <q-item-label caption>{{ lecture.path }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn
                      flat
                      round
                      icon="delete"
                      color="negative"
                      @click="deleteLecture(lecture.id)"
                      :disable="!change"
                    />
                  </q-item-section>
                </q-item>
              </q-list>
              <div class="row q-col-gutter-md q-mt-md">
              <div class="col-8">
                  <q-input
                    v-model="newTestName"
                    label="Название лекции"
                    outlined
                    :disable="!change"
                  />
                </div>
              <div class="col-4">
                <q-file
                  v-model="newLectureFile"
                  label="Загрузить лекцию (видео)"
                  accept="video/*"
                  :disable="!change"
                  outlined
                >
                </q-file>
              </div>
              <q-btn
                      flat
                      label="Добавить"
                      icon="cloud_upload"
                      @click="uploadLecture"
                      :disable="!change||!newTestName || !newLectureFile"
                    />
              </div>
            </div>

            <!-- Управление лабораторными -->
            <div class="col-12">
              <div class="text-h6 q-mb-sm">Лабораторные работы</div>
              <q-list bordered separator>
                <q-item v-for="lab in labs" :key="lab.id">
                  <q-item-section>
                    <q-item-label>{{ lab.id }}. {{ lab.name }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn
                      flat
                      round
                      icon="delete"
                      color="negative"
                      @click="deleteLab(lab.id)"
                      :disable="!change"
                    />
                  </q-item-section>
                </q-item>
              </q-list>
              
              <div class="row q-col-gutter-md q-mt-md">
                <div class="col-8">
                  <q-input
                    v-model="newLabName"
                    label="Название лабораторной"
                    outlined
                    :disable="!change"
                  />
                </div>
                <div class="col-4">
                  <q-file
                    v-model="newLabFile"
                    label="Файл"
                    outlined
                    :disable="!change"
                  />
                </div>
                <div class="col-12">
                  <q-btn
                    color="primary"
                    label="Добавить"
                    @click="uploadLab"
                    :disable="!change||!newLabFile || !newLabName"
                  />
                </div>
              </div>
            </div>

            <!-- Управление тестами -->
            <div class="col-12">
              <div class="text-h6 q-mb-sm">Тесты</div>
              <q-list bordered separator>
                <q-item v-for="test in tests" :key="test.id">
                  <q-item-section>
                    <q-item-label>{{ test.id }}. {{ test.name }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <div class="row q-gutter-sm">
                      <q-btn
                        flat
                        round
                        icon="edit"
                        color="primary"
                        @click="editTest(test.id)"
                        :disable="!change"
                      />
                      <q-btn
                        flat
                        round
                        icon="delete"
                        color="negative"
                        @click="deleteTest(test.id)"
                        :disable="!change"
                      />
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
              
              <div class="row q-col-gutter-md q-mt-md">
                
                <div class="col-4">
                  <q-file
                    v-model="newTestFile"
                    label="Файл теста (JSON)"
                    accept=".json"
                    outlined
                    :disable="!change"
                  />
                </div>
                <div class="col-12">
                  <q-btn
                    color="primary"
                    label="Добавить"
                    @click="uploadTest"
                    :disable="!change"
                  />
                </div>
              </div>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import{InformBlocksStatus} from '../../../backend/src/common/types';

const $q = useQuasar();
const router = useRouter();
const route =useRoute();
const API_ENDPOINT = process.env.API_ENDPOINT || 'http://localhost:3000';
let change= false;
// Состояние компонента
const tab=ref(route.path.includes('edit') ? 'edit' : 'create');

//eslint-disable-next-line @typescript-eslint/no-explicit-any
let blocks = ref<any[]>([]);
//eslint-disable-next-line @typescript-eslint/no-explicit-any
const selectedBlock = ref<any>(null);
const creatingBlock = ref(false);
const updatingBlock = ref(false);
const blockId =route.params.block;

// Данные для нового блока
const newBlock = ref({
  name: '',
  description: '',
  tags: [] as string[],
});

// Данные для редактирования блока
const editBlock = ref({
  name: '',
  description: '',
  tags: [] as string[],
});

// Файлы и данные для загрузки
const newLectureFile = ref<File | null>(null);
const newLabFile = ref<File | null>(null);
const newLabName = ref('');
const newTestFile = ref<File | null>(null);
const newTestName = ref('');

// Списки элементов блока
//eslint-disable-next-line @typescript-eslint/no-explicit-any
const lectures = ref<any[]>([]);
//eslint-disable-next-line @typescript-eslint/no-explicit-any
const labs = ref<any[]>([]);
//eslint-disable-next-line @typescript-eslint/no-explicit-any
const tests = ref<any[]>([]);

// Методы
const toCreate=()=>
{
  router.push(`/create-block/create/${blockId}`).then(() => {
  window.location.reload();
});
}
const toEdit=()=>
{
  router.push(`/create-block/edit/${blockId}`).then(() => {
  window.location.reload();
});
}
const goToMainPage = () => {
  router.push('MainPage');
};

// Загрузка всех блоков
const loadBlocks = async () => {
  try {
    const response = await fetch(`${API_ENDPOINT}/inform_blocks`);
    if (!response.ok) throw new Error('Ошибка загрузки блоков');
    blocks.value = await response.json();
  } catch (error) {
    console.error('Ошибка загрузки блоков:', error);
  }
};
//Создание редактируемой копии блока
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
        status:'Changing',
        test_numbers:selectedBlock.value.test_numbers,
        lab_numbers:selectedBlock.value.lab_numbers,
        lecture_numbers:selectedBlock.value.lecture_numbers
      })
    });

    if (!response.ok) throw new Error('Ошибка создания блока');

    const data = await response.json();
    console.log(data);
    const sourcePath=String(selectedBlock.value.id)+'_'+selectedBlock.value.name;
    const destinationPath=String(data.id)+'_'+data.name;
    console.log(sourcePath);
    console.log(destinationPath);
    try {

      const response = await fetch(`${API_ENDPOINT}/copyfolder/copy?source=${encodeURIComponent(sourcePath)}&destination=${encodeURIComponent(destinationPath)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to copy folder')
      }
    } catch (error) {
      throw new Error('Network error occurred')
    }
    tab.value = 'edit';
    router.push(`/create-block/edit/${blocks.value.length+1}`).then(() => {
    window.location.reload()});
    loadBlockDetails();
  } catch (error) {
    console.error('Ошибка создания блока:', error);
  } finally {
    creatingBlock.value = false;
  }
};
// Создание нового блока
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
        status:InformBlocksStatus.changing
      })
    });

    if (!response.ok) throw new Error('Ошибка создания блока');

    const data = await response.json();

    await loadBlocks();
    tab.value = 'edit';
    selectedBlock.value = data;
    router.push(`/create-block/edit/${blocks.value.length+1}`).then(() => {
    window.location.reload()});
    loadBlockDetails();
  } catch (error) {
    console.error('Ошибка создания блока:', error);
  } finally {
    creatingBlock.value = false;
  }
};

// Загрузка деталей блока
const loadBlockDetails = async () => {
  if(blocks.value.indexOf(selectedBlock.value)!=Number(blockId)-1)
  {
    router.push(`/create-block/edit/${blocks.value.indexOf(selectedBlock.value)+1}`).then(() => {
    window.location.reload()});
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

// Загрузка лекций
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

// Загрузка лабораторных
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
        if(!hasTest ? `${blockName}/${dir}/test.json` : null){
        return {
          id: parseInt(dir),
          name: labFile ? labFile.replace('lab_', '').replace(/\.[^/.]+$/, '') : `Лабораторная ${dir}`,
          path: `${blockName}/${dir}/${labFile}`
        };
        }
        else
        {
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

// Загрузка тестов
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
        if(hasTest ? `${blockName}/${dir}/test.json` : null){
        return {
          id: parseInt(dir),
          name: `Тест ${dir}`,
          path: `${blockName}/${dir}/test.json`
        };
        }else
        {
          return {
          id: null,
          name:null,
          path:null
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

// Загрузка лекции
const uploadLecture = async () => {
  if (!change||!newTestName.value ||!newLectureFile.value || !selectedBlock.value) return;

  try {
    const blockName = `${selectedBlock.value.id}_${selectedBlock.value.name}`;
    const nextId = getNextId();
    const fileName = `${nextId}_${newTestName.value}.mp4`;

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

    await loadBlockDetails();
    newLectureFile.value = null;
  } catch (error) {
    
    console.error('Ошибка загрузки лекции:', error);
  }
};

// Загрузка лабораторной
const uploadLab = async () => {
  if (!change||!newLabFile.value || !newLabName.value || !selectedBlock.value) return;

  try {
    const blockName = `${selectedBlock.value.id}_${selectedBlock.value.name}`;
    const nextId = getNextId();
    const dirName = `${nextId}`;
    const fileName = `lab_${newLabName.value}.${newLabFile.value.name.split('.').pop()}`;

    // Затем загружаем файл
    const formData = new FormData();
    const file =  newLabFile.value;
    const encodedFileName = encodeURIComponent(fileName);
    formData.append('file', new File([file], encodedFileName, { type: file.type }));
    formData.append('path', `${blockName}/${dirName}`);

    const response = await fetch(`${API_ENDPOINT}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Ошибка загрузки лабораторной');

    await loadBlockDetails();
    newLabFile.value = null;
    newLabName.value = '';
  } catch (error) {
    console.error('Ошибка загрузки лабораторной:', error);
  }
};
const getNextId = () => {
  const allIds = [
    Math.max(...lectures.value.map(l => l.id)),
    Math.max(...labs.value.map(l => l.id)),
    Math.max(...tests.value.map(t => t.id)),
    0
  ];
  
  return allIds.length > 0 ? Math.max(...allIds) + 1 : 1;
};

// Загрузка теста
const uploadTest = async () => {
  if (!change||!selectedBlock.value) return;

  try {
    const blockName = `${selectedBlock.value.id}_${selectedBlock.value.name}`;
    const nextId = getNextId();
    const dirName = `${nextId}`;
    // Затем загружаем файл
    const formData = new FormData();
    const filedata={};
    const test = newTestFile.value!=null? newTestFile.value:filedata;
    console.log(newTestFile.value?.name);
    formData.append('file', new Blob([JSON.stringify(test)], { type: 'application/json' }), 'test.json');
    formData.append('path', `${blockName}/${dirName}`);

    const response = await fetch(`${API_ENDPOINT}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Ошибка загрузки теста');

    await loadBlockDetails();
    newTestFile.value = null;
    newTestName.value = '';
  } catch (error) {
    console.error('Ошибка загрузки теста:', error);
  }
};

// Удаление лекции
const deleteLecture = async (id: number) => {
  if (!change||!selectedBlock.value) return;
  try {
    console.log(id);
  } catch (error) {
    
    console.error('Ошибка удаления лекции:', error);
  }
};

// Удаление лабораторной
const deleteLab = async (id: number) => {
  if (!change||!selectedBlock.value) return;
  try {
    console.log(id);
  } catch (error) {
    console.error('Ошибка удаления лабораторной:', error);
  }
};

// Удаление теста
const deleteTest = async (id: number) => {
  if (!change||!selectedBlock.value) return;

  try {
    console.log(id);
  } catch (error) {
    console.error('Ошибка удаления теста:', error);
  }
};

// Редактирование теста
const editTest = (id: number) => {
  if(change){
    const test = tests.value.find(t => t.id === id);
    if (!test || !test.path) return;
    router.push(`/edit/${test.path.replace('/test.json', '')}`);
  }
};

// Обновление блока
const updateBlock = async () => {
  if (!change||!selectedBlock.value) return;

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
        lecture_numbers:lectures.value.map(l => l.id),
        lab_numbers:labs.value.map(l => l.id),
        test_numbers:tests.value.map(l => l.id),
      })
    });

    if (!response.ok) throw new Error('Ошибка обновления блока');

    await loadBlocks();
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
  if (!change||!selectedBlock.value) return;

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
        lecture_numbers:lectures.value.map(l => l.id),
        lab_numbers:labs.value.map(l => l.id),
        test_numbers:tests.value.map(l => l.id),
        status:InformBlocksStatus.ready,
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

// Инициализация
onMounted(async () => {
  await loadBlocks();
  if(blockId!='0')
  {
    selectedBlock.value=blocks.value[Number(blockId)-1];
    loadBlockDetails();
  }
  change = InformBlocksStatus.changing==selectedBlock.value.status;
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
</style>