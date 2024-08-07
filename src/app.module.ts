import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express/multer';
import { ServeStaticModule } from '@nestjs/serve-static';
import { extname, join } from 'path';
import { diskStorage } from 'multer';

import { AdminModule } from './admin/admin.module';
import { CourseModule } from './courses/course.module';
import { AuthModule } from './auth/auth.module';
import { configValidationSchema } from 'config.schema';

@Module({
  imports: [
    AdminModule,
    ConfigModule.forRoot({
      envFilePath: [`.env.stage.${process.env.STAGE}`],
      validationSchema: configValidationSchema,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        autoLoadEntities: true,
        synchronize: true,
        entities: [__dirname + '/**/entity/*.entity{.ts,.js}'],
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
      }),
    }),
    AuthModule,
    CourseModule,
    MulterModule.register({
      storage: diskStorage({
        destination: 'C:/Users/Zura/Code/Backend/forked-API/online-courses-back-new/uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
          console.log('Generated filename:', filename);
          cb(null, filename);
        },
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../uploads'),
      serveRoot: '/uploads',
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
