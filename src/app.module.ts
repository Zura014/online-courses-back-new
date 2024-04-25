import { AdminModule } from './admin/admin.module';
import { CourseController } from './courses/course.controller';
import { CourseModule } from './courses/course.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { Module } from '@nestjs/common';
import { configValidationSchema } from 'config.schema';
import { TypeOrmModule } from '@nestjs/typeorm';

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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
