import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Courses } from './orm/courses.entity';
import { Information_blocks } from './orm/information_blocks.entity';
import { CoursesModule } from './courses/courses.module';
import { Information_blocksModule } from './information_blocks/information_blocks.module';
import { JsonReaderModule } from './jsonreader/json-reader.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ListFilesModule } from './listfiles/listfiles.module';
import { VideoStreamModule } from './videostream/videostream.module';
import { CopyFolderModule } from './copyfolder/copyfolder.module';
import { RenameModule } from './rename/rename.module';
import { DeleteFilesModule } from './deletefiles/deletefiles.module';

@Module({

  imports: [
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
    }),
    DeleteFilesModule,
    RenameModule,
    CopyFolderModule,
    ListFilesModule,
    VideoStreamModule,
    CoursesModule,
    JsonReaderModule,
    FileUploadModule,
    Information_blocksModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        cache: true,
        entities: [Courses, Information_blocks],
        maxQueryExecutionTime: 5000,
        extra: {
          max: 50,
          connectionTimeoutMillis: 1000,
          idleTimeoutMillis: 30000,
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Courses, Information_blocks]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
