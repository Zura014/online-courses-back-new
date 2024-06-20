import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { GetUser } from '.././auth/decorators/get-user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UserEntity } from 'src/auth/entities/user.entity';
import { CourseEntity } from './entities/course.entity';
import { EditCourseDto } from './dto/edit-course.dto';
import { CoursesFilterDto } from './dto/filter.dto';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { GetCourseDto } from './dto/get-course.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('courses')
export class CourseController {
  constructor(private courseService: CourseService) {}

  //Create Course კურსის შექმნა
  @UseGuards(AuthGuard())
  @UseInterceptors(
    FileInterceptor('imageUrl', {
      storage: diskStorage({
        destination: './dist/uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const extension = extname(file.originalname);
          const filename = `${file.fieldname}-${uniqueSuffix}${extension}`;
          console.log('Generated filename inside interceptor:', filename);
          cb(null, filename);
        },
      }),
    }),
  )
  @Post('/create')
  async createCourse(
    @UploadedFile() file: Express.Multer.File,
    @Body() createCourseDto: CreateCourseDto,
    @GetUser() user: UserEntity,
  ): Promise<CourseEntity> {
    try {
      console.log('Incoming DTO:', createCourseDto);
      if (file) {
        // console.log('File received:', file);
        createCourseDto.imageUrl = `/uploads/${file.filename}`;
        // console.log('File path assigned:', createCourseDto.imageUrl);
      } else {
        throw new BadRequestException('Image file is required.');
      }

      return await this.courseService.createCourse(createCourseDto, user);
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }

  //Get Courses კურსების გვერდი
  @Header('Access-Control-Allow-Origin', '*')
  @Get()
  async getCourses(
    @Query('page') page: number,
  ): Promise<{ courses: CourseEntity[]; totalCount: number }> {
    try {
      return await this.courseService.getCourses(page);
    } catch (error) {
      throw error;
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
      throw error;
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
      throw error;
    }
  }

  // Filter by price high to low (ფილტრაცია ფასის მიხედვით მაღლიდან დაბლისკენ)
  @Get('/high-to-low')
  async sortCoursesByPriceHighToLow(
    @Query('page') page: number,
  ): Promise<{ courses: CourseEntity[]; totalCount: number }> {
    try {
      return await this.courseService.sortCoursesByPriceHighToLow(page);
    } catch (error) {
      throw error;
    }
  }

  // Filter by price low to high (ფილტრაცია ფასის მიხედვით დაბლიდან მაღლისკენ)
  @Get('/low-to-high')
  async sortCoursesByPriceLowToHigh(
    @Query('page') page: number,
  ): Promise<{ courses: CourseEntity[]; totalCount: number }> {
    try {
      return await this.courseService.sortCoursesByPriceLowToHigh(page);
    } catch (error) {
      throw error;
    }
  }

  // Course Search (კუტსების ძიება სახელის მიხედვით)
  @Get('/search')
  async searchCourses(
    @Body() filterDto: CoursesFilterDto,
  ): Promise<CourseEntity[]> {
    try {
      return await this.courseService.searchCourses(filterDto);
    } catch (error) {
      throw error;
    }
  }

  // My Courses  საკუთარი კურსების მოძიება
  @UseGuards(AuthGuard())
  @Get('/mycourses')
  async getMyCourse(
    @Query('page') page: number,
    @GetUser() user: UserEntity,
  ): Promise<{ myCourses: CourseEntity[]; totalCount: number }> {
    try {
      return await this.courseService.getMyCourse(page, user);
    } catch (error) {
      throw error;
    }
  }

  @Get('/:id')
  async getCourseById(@Param('id') id: number): Promise<GetCourseDto> {
    const courseData = await this.courseService.GetCourseById(id);

    const courseDto: GetCourseDto = {
      id: courseData.id,
      course_title: courseData.course_title,
      description: courseData.description,
      price: courseData.price,
      imageUrl: courseData.imageUrl,
      user: {
        id: courseData.user.id,
        username: courseData.user.username,
        description: courseData.user.description,
        imageUrl: courseData.user.imageUrl,
        status: courseData.user.status,
      },
    };
    try {
      return courseDto;
    } catch (error) {
      throw error;
    }
  }
}
