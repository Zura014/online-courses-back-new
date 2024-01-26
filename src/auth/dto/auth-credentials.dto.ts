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
  @MinLength(4, { message: 'სახელი უნდა შეიცავდეს მინიმუმ 4 ელემენტს' })
  @MaxLength(20, { message: 'სახელი უნდა შეიცავდეს მაქსიმუმ 20 ელემენტს' })
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'პაროლი უნდა შეიცავდეს მინიმუმ 8 ელემენტს' })
  @MaxLength(32, { message: 'პაროლი უნდა შეიცავდეს მაქსიმუმ 32 ელემენტს' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'შეყვანილი პაროლი სუსტია',
  })
  password: string;
}
