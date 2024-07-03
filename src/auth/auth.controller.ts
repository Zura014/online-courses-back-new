import {
  Body,
  Controller,
  Get,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { UserEntity } from './entities/user.entity';
import { EditUserDto } from './dto/edit-user.dto';
import { GetUser } from './decorators/get-user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { GetUserDto } from './dto/get-user.dto';
import { CreateRolesDto } from './dto/create-role.dto';
import { UserRolesEntity } from './entities/user-roles.entity';
import { FileInterceptor } from '@nestjs/platform-express/multer';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // SignUp (რეგისტრაცია)
  @Post('/signup')
  async signUp(@Body() authCredentialsDto: AuthCredentialsDto): Promise<void> {
    try {
      return await this.authService.signUp(authCredentialsDto);
    } catch (error) {
      throw error;
    }
  }

  //SignIn (ავტორიზაცია)
  @Post('/signin')
  async signIn(@Body() loginDto: LoginDto): Promise<{ accessToken: string }> {
    try {
      return await this.authService.signIn(loginDto);
    } catch (error) {
      throw error;
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
      throw error;
    }
  }

  //Create Role (როლის დამატება)
  @Post('/create-role')
  async createRole(@Body() createRolesDto: CreateRolesDto): Promise<void> {
    try {
      return await this.authService.createRole(createRolesDto);
    } catch (error) {
      throw error;
    }
  }
}

@Controller('users')
export class UserController {
  constructor(private authService: AuthService) {}
  // Edit User (მომხმარებლის რედაქტირება)
  @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor('image'))
  @Patch('/edit-user')
  async editUser(
    @UploadedFile() file: Express.Multer.File,
    @Body() editUserDto: EditUserDto,
    @GetUser() user: UserEntity,
  ): Promise<UserEntity> {
    try {
      if (file) {
        editUserDto.imageUrl = file.path;
      }
      return await this.authService.editUser(editUserDto, user);
    } catch (error) {
      throw error;
    }
  }

  // Profile page (პროფილის გვერდი)
  @UseGuards(AuthGuard())
  @Get('/profile')
  async getProfile(@GetUser() user: UserEntity): Promise<GetUserDto> {
    const userData = await this.authService.getProfile(user);

    const userDto: GetUserDto = {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      description: userData.description,
      imageUrl: userData.imageUrl,
      status: userData.status,
    };
    try {
      return userDto;
    } catch (error) {
      throw error;
    }
  }

  // Delete Account (ანგარიშის წაშლა)
  @UseGuards(AuthGuard())
  @Delete('/profile')
  async deleteUser(@GetUser() user: UserEntity): Promise<void> {
    const userId = user.id;

    try {
      return await this.authService.deleteUser(userId);
    } catch (error) {
      throw error;
    }
  }
}
