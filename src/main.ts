import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './transform.interceptor';
import * as cors from 'cors';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import { ServeStaticModule } from '@nestjs/serve-static';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use((req, res, next) => {
    console.log(`Request URL: ${req.url}`);
    next();
  });

  const multerUploadsDir = join('C:/Users/PC/online-courses-n/uploads');
  if (!fs.existsSync(multerUploadsDir)) {
    console.error(
      `Multer uploads directory does not exist at path: ${multerUploadsDir}`,
    );
    return;
  }

  app.useStaticAssets(multerUploadsDir, {
    prefix: '/uploads/',
    index: false,
    setHeaders: (res, path) => {
      console.log(`Serving static file: ${path}`);
    },
  });

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new TransformInterceptor());

  const corsOptions: CorsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  };
  app.enableCors(corsOptions);
  app.use(cors());

  app.use((req, res, next) => {
    if (req.path.startsWith('/uploads/')) {
      const filePath = join(
        multerUploadsDir,
        req.path.replace('/uploads/', ''),
      );
      if (!fs.existsSync(filePath)) {
        res.status(404).send('File not found');
      } else {
        next();
      }
    } else {
      next();
    }
  });

  await app.listen(3000);
}

bootstrap();
