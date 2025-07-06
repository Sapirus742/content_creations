/* eslint-disable @typescript-eslint/no-explicit-any */
interface LectureItem {
  number: number;
  name: string;
  file: string;
}

interface LabItem {
  number: number;
  files: string[];
}

interface BlockContent {
  lectures: LectureItem[];
  labs: LabItem[];
}

export interface LectureInfo {
  number: number;
  name: string;
  url: string;
}

export class ContentHandler {
  private static basePath = '/content/Пул инфоблоков';
  public static contentData: Record<string, BlockContent> = {};

  static async initialize(): Promise<void> {
    try {
      const response = await fetch('/content/files.json');
      if (!response.ok) {
        throw new Error(`Failed to load files.json: ${response.status}`);
      }
      this.contentData = await response.json();
      console.log(this.contentData);
    } catch (error) {
      console.error('Error loading content data:', error);
    }
  }

  private static generateUrl(blockName: string, fileName: string): string {
    const safeBlockName = encodeURIComponent(blockName);
    const safeFileName = encodeURIComponent(fileName);
    return `${this.basePath}/${safeBlockName}/${safeFileName}`;
  }

  public static hasLecture(blockName: string, lectureNumber: number): boolean {
  if (!this.contentData[blockName]) return false;
  
  return this.contentData[blockName].lectures.some(lecture => 
    lecture.number === lectureNumber
  );
}


static async getLectureInfo(blockName: string, lectureNumber: number): Promise<LectureInfo | null> {
  try {
    if (!this.contentData[blockName]) {
      console.warn(`Блок "${blockName}" не найден в файловой структуре`);
      return null;
    }

    // Ищем лекцию по полю number, а не по имени файла
    const lecture = this.contentData[blockName].lectures.find(l => 
      l.file.startsWith(`${lectureNumber}_`) || 
      l.file.startsWith(`${lectureNumber} `) ||
      l.file.includes(`_${lectureNumber}.mp4`)
    );

    if (!lecture) {
      console.warn(`Лекция ${lectureNumber} не найдена в блоке "${blockName}"`);
      return null;
    }

    const lectureUrl = this.generateUrl(blockName, lecture.file);
    
    if (!await this.checkFileExists(lectureUrl)) {
      console.warn(`Файл лекции не найден: ${lectureUrl}`);
      return null;
    }

    console.log(lecture)

    return {
      number: lecture.number,
      name: lecture.name || `Лекция ${lecture.number}`,
      url: lectureUrl
    };
  } catch (error) {
    console.error(`Ошибка при получении лекции ${lectureNumber}:`, error);
    return null;
  }
}

  static async checkFileExists(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('Error checking file:', url, error);
      return false;
    }
  }

  static getLabUrl(blockName: string, labNumber: number): string {
    const blockData = this.contentData[blockName];
    if (!blockData) return '';

    const lab = blockData.labs.find(l => l.number === labNumber);
    if (!lab) return '';

    const labFile = lab.files.find(f => f.startsWith('lab_') && f.endsWith('.docx'));
    if (!labFile) return '';

    return this.generateUrl(blockName, `${labNumber}/${labFile}`);
  }

  static async getTestData(blockName: string, testNumber: number): Promise<any> {
    const blockData = this.contentData[blockName];
    if (!blockData) return null;

    const test = blockData.labs.find(l => l.number === testNumber);
    if (!test) return null;

    const testFile = test.files.find(f => f === 'test.json');
    if (!testFile) return null;

    const url = this.generateUrl(blockName, `${testNumber}/${testFile}`);
    try {
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error('Error loading test:', error);
      return null;
    }
  }
}

// Инициализируем при загрузке модуля
ContentHandler.initialize().catch(error => {
  console.error('Failed to initialize ContentHandler:', error);
});