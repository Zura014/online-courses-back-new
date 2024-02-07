import {
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
      if (error instanceof QueryFailedError) {
        const errorMessage = error.message;
        if (errorMessage.includes('Duplicate entry')) {
          const match = errorMessage.match(/Duplicate entry '(.+)' for key/);
          const duplicateEmail = match ? match[1] : null;
          const duplicateUsername = match ? match[2] : null;

          if (duplicateEmail) {
            throw new UnauthorizedException(
              `შეყვანილი ელფოსტა უკვე გამოყენებულია`,
            );
          } else if (duplicateUsername) {
            throw new UnauthorizedException(
              `შეყვანილი სახელი უკვე გამოყენებულია`,
            );
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
}
