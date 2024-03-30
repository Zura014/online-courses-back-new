import { Exclude } from 'class-transformer';
import { UserEntity } from 'src/auth/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class CourseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  course_title: string;

  @ManyToOne((_type) => UserEntity, (user) => user.course)
  @Exclude({ toPlainOnly: true })
  user: UserEntity;

  @Column()
  description: string;

  @Column()
  price: number;

  @Column()
  imageUrl: string;
}
