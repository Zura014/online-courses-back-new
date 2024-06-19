export class GetCourseDto {
  id: number;

  course_title: string;

  description: string;

  price: number;

  imageUrl: string;

  user: {
    id: number;
    username: string;
    description: string;
    imageUrl: string;
    status: string;
  };
}
