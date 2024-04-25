import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/auth/entities/user.entity';
import { CourseEntity } from 'src/courses/entities/course.entity';
import { UserRolesEntity } from 'src/auth/entities/user-roles.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AdminJwtStrategy } from '../admin/admin-jwt.strategy';
@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: 3600,
        },
      }),
    }),
    TypeOrmModule.forFeature([UserEntity, CourseEntity, UserRolesEntity]),
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminJwtStrategy],
  exports: [AdminJwtStrategy, PassportModule],
})
export class AdminModule {}
