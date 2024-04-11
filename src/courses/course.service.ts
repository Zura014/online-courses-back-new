import { Injectable } from '@nestjs/common';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseEntity } from './entities/course.entity';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/auth/entities/user.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { EditCourseDto } from './dto/edit-course.dto';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
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
      imageUrl: createCourseDto.imageUrl,
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
        select: ['id', 'course_title', 'description', 'price', 'imageUrl'],
        order: { id: 'DESC' },
        relations: { user: true },
      });

      return { courses, totalCount };
    } catch (error) {
      throw new NotFoundException('Courses not found');
    }
  }

  async deleteCourse(id: number, user: UserEntity): Promise<void> {
    const course = await this.courseRepository.findOne({ where: { id: id } });
    if (!course) {
      throw new BadRequestException('Course was not found');
    }
    try {
      await this.courseRepository.remove(course);
    } catch (error) {
      console.error(error.message);
    }
  }

  async editCourse(
    id: number,
    editCourseDto: EditCourseDto,
    user: UserEntity,
  ): Promise<CourseEntity> {
    const { course_title, description, price, imageUrl } = editCourseDto;

    const course = await this.courseRepository.findOne({ where: { id: id } });

    if (!course) {
      throw new BadRequestException('Course was not found');
    }

    course.course_title = course_title || course.course_title;
    course.description = description || course.description;
    course.price = price || course.price;
    course.imageUrl = imageUrl || course.imageUrl;

    try {
      return await this.courseRepository.save(course);
    } catch (error) {
      console.error(error.message);
    }
  }

  async sortCoursesByPriceHighToLow(
    page = 1,
  ): Promise<{ courses: CourseEntity[]; totalCount: number }> {
    try {
      const [courses, totalCount] = await this.courseRepository.findAndCount({
        take: 9,
        skip: 9 * (page - 1),
        select: ['id', 'course_title', 'description', 'price', 'imageUrl'],
        order: { price: 'DESC' },
      });
      return { courses, totalCount };
    } catch (error) {
      throw new NotFoundException('Courses Not Found');
    }
  }

  async sortCoursesByPriceLowToHigh(
    page = 1,
  ): Promise<{ courses: CourseEntity[]; totalCount: number }> {
    try {
      const [courses, totalCount] = await this.courseRepository.findAndCount({
        take: 9,
        skip: 9 * (page - 1),
        select: ['id', 'course_title', 'description', 'imageUrl', 'price'],
        order: { price: 'ASC' },
      });
      return { courses, totalCount };
    } catch (error) {
      throw new NotFoundException('Courses Not Found');
    }
  }
}
