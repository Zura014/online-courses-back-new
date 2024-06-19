import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import * as bcrypt from 'bcrypt';
import { JwtPayLoad } from './jwt-payload.interface';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { EditUserDto } from './dto/edit-user.dto';
import { CourseEntity } from 'src/courses/entities/course.entity';
import { CreateRolesDto } from './dto/create-role.dto';
import { UserRolesEntity } from './entities/user-roles.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,
    @InjectRepository(UserRolesEntity)
    private readonly rolesRepository: Repository<UserRolesEntity>,
  ) {}

  //SignUp (რეგისტრაცია)

  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    const { email, password, username, role } = authCredentialsDto;

    //hash
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.userRepository.create({
      email,
      username,
      password: hashedPassword,
      role: role,
    });

    try {
      await this.userRepository.save(user);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        const { username, email } = authCredentialsDto;
        const existingUser = await this.userRepository.findOne({
          where: [{ username }, { email }],
        });
        if (existingUser) {
          if (
            existingUser.username === username &&
            existingUser.email === email
          ) {
            throw new ConflictException(
              'Both username and email already exist.',
            );
          } else if (existingUser.username === username) {
            throw new ConflictException('Username is already in use.');
          } else if (existingUser.email === email) {
            throw new ConflictException('Email is already in use.');
          }
        }
      }
      throw error;
    }
  }

  //SignIn (ავტორიზაცია)

  async signIn(loginDto: LoginDto): Promise<{ accessToken: string }> {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (user && (await bcrypt.compare(password, user.password))) {
      const payload: JwtPayLoad = {
        email,
        id: user.id,
      };
      const accessToken: string = await this.jwtService.sign(payload);
      return { accessToken };
    } else {
      throw new UnauthorizedException(
        'The entered data is incorrect. Please review and make sure all fields are entered correctly.',
      );
    }
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<UserEntity> {
    const { email, new_password } = forgotPasswordDto;
    const user = await this.userRepository.findOne({ where: { email } });

    if (user) {
      const salt = await bcrypt.genSalt();
      const newHashedPassword = await bcrypt.hash(new_password, salt);
      try {
        const updatedUser = await this.userRepository.update(user.id, {
          password: newHashedPassword,
        });
        return updatedUser.raw;
      } catch (error) {
        console.log(error.message);
      }
    } else {
      throw new UnauthorizedException('Email is incorrect');
    }
  }

  // Edit User (მომხმარებლის რედაქტირება)

  async editUser(
    editUserDto: EditUserDto,
    user: UserEntity,
  ): Promise<UserEntity> {
    const { username, description, imageUrl } = editUserDto;

    if (username == '') {
      user.username = user.username || user.username;
    } else if (username.length > 4) {
      user.username = username || user.username;
    } else if (username.length < 4) {
      throw new BadRequestException(
        'The name must consist of at least 4 elements.',
      );
    }

    user.description = description || user.description;
    user.imageUrl = imageUrl || user.imageUrl;

    await this.userRepository.save(user);

    try {
      return user;
    } catch (error) {
      console.log(error.message);
    }
  }

  async getProfile(user: UserEntity): Promise<UserEntity> {
    try {
      return user;
    } catch (error) {
      console.log(error.message);
    }
  }

  async deleteUser(userId: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { course: true },
    });

    if (!user) {
      throw new BadRequestException(`Couldn't find User`);
    }

    try {
      await this.courseRepository.remove(user.course);
      await this.userRepository.remove(user);
    } catch (error) {
      console.error(error.message);
    }
  }

  async createRole(createRolesDto: CreateRolesDto): Promise<void> {
    const { name } = createRolesDto;

    const role = this.rolesRepository.create({
      name,
    });

    try {
      await this.rolesRepository.save(role);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        const { name } = createRolesDto;
        const dup_role = await this.rolesRepository.findOne({
          where: { name: name },
        });

        if (dup_role) {
          throw new ConflictException('role name is already in use.');
        }
      }
      throw error;
    }
  }
}
