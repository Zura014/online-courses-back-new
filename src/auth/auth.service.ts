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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {}

  //SignUp (რეგისტრაცია)

  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    const { email, password, username } = authCredentialsDto;

    //hash
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.userRepository.create({
      email,
      username,
      password: hashedPassword,
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
      throw error; // Rethrow other errors
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
        'შეამოწმეთ თქვენს მიერ შეყვანილი მონაცემები',
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
        const updatedUser = await this.userRepository.update(user, {
          password: newHashedPassword,
        });
        return updatedUser.raw;
      } catch (error) {
        console.log(error.message);
      }
    } else {
      throw new UnauthorizedException('შეყვანილი ელფოსტა არასწორია');
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
      throw new BadRequestException('სახელი უნდა შეიცავდეს მინიმუმ 4 ელემენტს');
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
}
