import { Body, Controller, Post } from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { UserEntity } from './entities/user.entity';

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
