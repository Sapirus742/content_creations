/* eslint-disable @typescript-eslint/no-explicit-any */


export interface LectureInfo {
  number: number;
  name: string;
  url: string;
}

export class ContentHandler {

  static async initialize(): Promise<void> {
    
  }

static async getLectureInfo(blockName: string, lectureNumber: number,lPath:string,idLecture:number): Promise<LectureInfo | null> {
  try {
   

    // Ищем лекцию по полю number, а не по имени файла
    
    //Получаем имя файла начинающегося с этого id.
    const response = await fetch(`${process.env.API_ENDPOINT}/listfiles/list?path=${encodeURIComponent(lPath)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    const foundFile = data.files.find((file: string) => 
      file.startsWith(`${lectureNumber}_`) && file.endsWith('.mp4')
    );
    
    const lectureUrl = `${process.env.API_ENDPOINT}/video-stream?path=`;

    return {
      number: lectureNumber,
      name:  foundFile.slice(foundFile.lastIndexOf('_') + 1).replace(/\.mp4$/, '')||`Лекция ${idLecture}`,
      url: lectureUrl+`${encodeURIComponent(lPath+'/'+foundFile)}`
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

  static async getLabFiles(blockName: string, labNum: number): Promise<{name: string, path: string}[]> {
  try {
    const relativePath = `${blockName}/${labNum}`;
    const response = await fetch(`${process.env.API_ENDPOINT}/listfiles/list?path=${encodeURIComponent(relativePath)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.files.map((file: string) => ({
      name: file,
      path: `${relativePath}/${file}`
    }));
  } catch (error) {
    console.error('Error fetching lab files:', error);
    return [];
  }
}
  
}

// Инициализируем при загрузке модуля
ContentHandler.initialize().catch(error => {
  console.error('Failed to initialize ContentHandler:', error);
});