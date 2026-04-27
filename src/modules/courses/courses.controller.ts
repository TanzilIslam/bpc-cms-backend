import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
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

  @Get(':id/content')
  getCourseContent(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.getCourseContent(id);
  }
}
