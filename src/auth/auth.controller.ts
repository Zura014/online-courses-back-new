import {
  Body,
  Controller,
  Get,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { UserEntity } from './entities/user.entity';
import { EditUserDto } from './dto/edit-user.dto';
import { GetUser } from './decorators/get-user.decorator';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // SignUp (რეგისტრაცია)
  @Post('/signup')
  async signUp(@Body() authCredentialsDto: AuthCredentialsDto): Promise<void> {
    try {
      return await this.authService.signUp(authCredentialsDto);
    } catch (error) {
      console.log(error.message);
    }
  }

  //SignIn (ავტორიზაცია)
  @Post('/signin')
  async signIn(@Body() loginDto: LoginDto): Promise<{ accessToken: string }> {
    try {
      return await this.authService.signIn(loginDto);
    } catch (error) {
      console.log(error.message);
    }
  }

  //Forgot Password (პაროლის აღდგენა)
  @Post('/forgot-password')
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<UserEntity> {
    try {
      return await this.authService.forgotPassword(forgotPasswordDto);
    } catch (error) {
      console.log(error.message);
    }
  }
}

@Controller('users')
export class UserController {
  constructor(private authService: AuthService) {}
  // Edit User (მომხმარებლის რედაქტირება)
  @UseGuards(AuthGuard())
  @Patch('/edit-user')
  async editUser(
    @Body() editUserDto: EditUserDto,
    @GetUser() user: UserEntity,
  ): Promise<UserEntity> {
    try {
      return await this.authService.editUser(editUserDto, user);
    } catch (error) {
      console.error(error.message);
    }
  }

  @UseGuards(AuthGuard())
  @Get('/profile')
  async getUser(@GetUser() user: UserEntity): Promise<UserEntity> {
    try {
      return await this.authService.getUser(user);
    } catch (error) {
      console.error(error.message);
    }
  }
  @UseGuards(AuthGuard())
  @Delete('/profile')
  async deleteUser(@GetUser() user: UserEntity): Promise<void> {
    const userId = user.id;

    try {
      return await this.authService.deleteUser(userId);
    } catch (error) {
      console.error(error.message);
    }
  }
}
