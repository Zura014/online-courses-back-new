import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from '.././auth/decorators/get-user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UserEntity } from 'src/auth/entities/user.entity';
import { CourseEntity } from './entities/course.entity';
import { EditCourseDto } from './dto/edit-course.dto';

@Controller('courses')
export class CourseController {
  constructor(private courseService: CourseService) {}

  //Create Course კურსის შექმნა
  @UseGuards(AuthGuard())
  @Post('/create')
  async createCourse(
    @Body() createCourseDto: CreateCourseDto,
    @GetUser() user: UserEntity,
  ): Promise<CourseEntity> {
    try {
      return await this.courseService.createCourse(createCourseDto, user);
    } catch (error) {
      console.error(error.message);
    }
  }

  //Get Courses კურსების გვერდი
  @Get()
  async getCourses(
    @Query('page') page: number,
  ): Promise<{ courses: CourseEntity[]; totalCount: number }> {
    try {
      return await this.courseService.getCourses(page);
    } catch (error) {
      console.error(error.message);
    }
  }

  // Delete Course კურსის წაშლა
  @UseGuards(AuthGuard())
  @Delete('/delete/:id')
  async deteleCourse(
    @Param('id') id: number,
    @GetUser() user: UserEntity,
  ): Promise<void> {
    try {
      return await this.courseService.deleteCourse(id, user);
    } catch (error) {
      console.error(error.message);
    }
  }

  //Edit Course კურსის განახლება
  @UseGuards(AuthGuard())
  @Patch('/edit/:id')
  async editCourse(
    @Param('id') id: number,
    @Body() editCourseDto: EditCourseDto,
    @GetUser() user: UserEntity,
  ): Promise<CourseEntity> {
    try {
      return await this.courseService.editCourse(id, editCourseDto, user);
    } catch (error) {
      console.error(error.message);
    }
  }
}
