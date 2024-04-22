import { IsNotEmpty, IsString, isNotEmpty } from 'class-validator';

export class CreateRolesDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
