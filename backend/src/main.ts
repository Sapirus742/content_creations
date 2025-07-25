import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({  // CORS для фронта
    origin: 'http://localhost:9000', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.use(json({
  limit: '50mb',
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}));
  app.use((req, res, next) => {
    if (req.originalUrl.includes('/upload')) {
      next();
    } else {
      json()(req, res, next);
    }
  });
  await app.listen(3000);
}
bootstrap();
