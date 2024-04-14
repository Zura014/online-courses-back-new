import { IsOptional, IsString } from 'class-validator';

export class CoursesFilterDto {
  @IsOptional()
  @IsString()
  title?: string;
}
