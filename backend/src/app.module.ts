import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Courses } from './orm/courses.entity';
import { Information_blocks } from './orm/information_blocks.entity';
import { CoursesModule } from './courses/courses.module';
import { Information_blocksModule } from './information_blocks/information_blocks.module';

 

@Module({

  imports: [
    CoursesModule,
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
