import { AdminModule } from './admin/admin.module';
import { CourseController } from './courses/course.controller';
import { CourseModule } from './courses/course.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { Module } from '@nestjs/common';
import { configValidationSchema } from 'config.schema';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express/multer';
import { ServeStaticModule } from '@nestjs/serve-static';
import { extname, join } from 'path';
import { diskStorage } from 'multer';

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
        destination: '../uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
          console.log('Generated filename:', filename);
        },
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../', 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
