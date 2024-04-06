import { CourseService } from './course.service';
import { Module } from '@nestjs/common';
import { CourseController } from './course.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { CourseEntity } from './entities/course.entity';
import { UserEntity } from 'src/auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseEntity, UserEntity]), AuthModule],
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule {}
