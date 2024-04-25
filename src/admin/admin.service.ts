import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRolesEntity } from 'src/auth/entities/user-roles.entity';
import { UserEntity } from 'src/auth/entities/user.entity';
import { CourseEntity } from 'src/courses/entities/course.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtPayLoad } from '../auth/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { AdminSignInDto } from './dto/signin.dto';
import { AdminJwtPayLoad } from './admin-jwt-payload.interface';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserRolesEntity)
    private readonly rolesRepository: Repository<UserRolesEntity>,
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,
    private jwtService: JwtService,
  ) {}

  async signIn(signInDto: AdminSignInDto): Promise<{ accessToken: string }> {
    const { username, password, role } = signInDto;
    const user = await this.userRepository.findOne({
      where: { username },
      relations: ['role'],
    });

    if (role == 1) {
      if (user && (await bcrypt.compare(password, user.password))) {
        const payload: AdminJwtPayLoad = {
          username,
          id: user.id,
        };
        const accessToken: string = await this.jwtService.sign(payload);
        try {
          return { accessToken };
        } catch (error) {
          error.message;
        }
      } else {
        throw new UnauthorizedException(
          'The entered data is incorrect. Please review and make sure all fields are entered correctly.',
        );
      }
    } else {
      throw new UnauthorizedException('You Cant Sign In');
    }
  }
}
