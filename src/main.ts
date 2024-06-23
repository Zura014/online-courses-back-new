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

  // Middleware to log request URLs for debugging
  app.use((req, res, next) => {
    console.log(`Request URL: ${req.url}`);
    next();
  });

  // Ensure the correct path to the uploads directory for multer
  const multerUploadsDir = join(__dirname, '../../uploads');
  if (!fs.existsSync(multerUploadsDir)) {
    console.error(
      `Multer uploads directory does not exist at path: ${multerUploadsDir}`,
    );
    return;
  }

  // Multer configuration

  // Serve static assets from the uploads directory
  app.useStaticAssets(multerUploadsDir, {
    prefix: '/uploads/',
    index: false, // Disable index.html lookup
    setHeaders: (res, path) => {
      console.log(`Serving static file: ${path}`);
    },
  });

  // Global pipes and interceptors
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new TransformInterceptor());

  // CORS configuration
  const corsOptions: CorsOptions = {
    origin: '*', // Allow requests from any origin (adjust as needed)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  };
  app.enableCors(corsOptions);
  app.use(cors());

  // Fallback middleware for handling non-existent static files
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

  // Start the application
  await app.listen(3000);
}

bootstrap();
