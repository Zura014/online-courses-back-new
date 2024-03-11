import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseEntity } from './entities/course.entity';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/auth/entities/user.entity';
import { CreateCourseDto } from './dto/create-course.dto';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,
  ) {}

  async createCourse(
    createCourseDto: CreateCourseDto,
    user: UserEntity,
  ): Promise<CourseEntity> {
    const course = this.courseRepository.create({
      course_title: createCourseDto.course_title,
      user,
      description: createCourseDto.description,
      price: createCourseDto.price,
    });

    try {
      return await this.courseRepository.save(course);
    } catch (error) {
      console.error(error.message);
    }
  }

  async getCourses(
    page = 1,
  ): Promise<{ courses: CourseEntity[]; totalCount: number }> {
    try {
      const [courses, totalCount] = await this.courseRepository.findAndCount({
        take: 9,
        skip: 9 * (page - 1),
        select: ['id', 'course_title', 'description', 'price'],
        order: { id: 'DESC' },
      });
      return { courses, totalCount };
    } catch (error) {
      throw new NotFoundException('Courses not found');
    }
  }

  async deleteCourse(id: number, user: UserEntity): Promise<void> {
    const course = await this.courseRepository.findOne({ where: { id: id } });
    try {
      await this.courseRepository.remove(course);
    } catch (error) {
      console.error(error.message);
    }
  }
}
