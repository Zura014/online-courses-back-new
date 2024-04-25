import { Body, Controller, Post } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminSignInDto } from './dto/signin.dto';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post('/signin')
  async signIn(
    @Body() signInDto: AdminSignInDto,
  ): Promise<{ accessToken: string }> {
    try {
      return await this.adminService.signIn(signInDto);
    } catch (error) {
      console.error(error.message);
    }
  }
}
