import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CourseContentEntity,
  CourseEntity,
  CourseSkillEntity,
} from '../../database/entities';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CourseEntity,
      CourseSkillEntity,
      CourseContentEntity,
    ]),
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
