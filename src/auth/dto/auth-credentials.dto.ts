import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class AuthCredentialsDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(4, { message: 'The name must consist of at least 4 elements.' })
  @MaxLength(20, {
    message: 'The name should contain a maximum of 20 elements.',
  })
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, {
    message: 'The password must consist of at least 8 elements.',
  })
  @MaxLength(32, {
    message: 'The password should contain a maximum of 32 elements.',
  })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'The password is weak',
  })
  password: string;
}
