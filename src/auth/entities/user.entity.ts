import { CourseEntity } from 'src/courses/entities/course.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserRolesEntity } from './user-roles.entity';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column('enum', {
    enum: ['active', 'offline'],
    default: 'active',
  })
  status: string;

  @OneToMany((_type) => CourseEntity, (course) => course.user)
  course: CourseEntity[];

  @ManyToOne((_type) => UserRolesEntity, (role) => role.id)
  role: number;
}
