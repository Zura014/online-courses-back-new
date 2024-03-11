import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  IsNumber,
} from 'class-validator';

export class CreateCourseDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  course_title: string;

  @IsString()
  @MaxLength(200)
  description: string;

  @IsNotEmpty()
  price: number;
}
