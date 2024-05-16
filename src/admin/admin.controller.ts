import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminSignInDto } from './dto/admin-signin.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { UserEntity } from 'src/auth/entities/user.entity';

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

  // @UseGuards(AuthGuard())
  // @Delete('/delete-user/:id')
  // async deleteUser(
  //   @Param('id') userId: number,
  //   @GetUser() User: UserEntity,
  // ): Promise<void> {
  //   try {
  //     return await this.adminService.deleteUser(userId, User);
  //   } catch (error) {
  //     console.error(error.message);
  //   }
  // }
}
