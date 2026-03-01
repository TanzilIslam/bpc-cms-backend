import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CoursesService } from './courses.service';

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  listCourses() {
    return this.coursesService.listPublished();
  }

  @Get(':slug')
  getCourse(@Param('slug') slug: string) {
    return this.coursesService.getBySlug(slug);
  }
}
