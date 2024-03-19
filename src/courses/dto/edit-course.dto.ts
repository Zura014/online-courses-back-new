import { IsNumber, IsOptional, IsString } from 'class-validator';

export class EditCourseDto {
  @IsOptional()
  @IsString()
  course_title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  price?: number;
}
