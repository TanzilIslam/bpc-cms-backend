import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseEntity, CourseSkillEntity } from '../../database/entities';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(CourseEntity)
    private readonly courseRepo: Repository<CourseEntity>,
    @InjectRepository(CourseSkillEntity)
    private readonly courseSkillRepo: Repository<CourseSkillEntity>,
  ) {}

  async listPublished() {
    const courses = await this.courseRepo.find({
      where: { isPublished: true },
      order: { createdAt: 'DESC' },
    });
    return Promise.all(
      courses.map(async (course) => {
        const skills = await this.courseSkillRepo.find({
          where: { courseId: course.id },
        });
        return {
          ...course,
          skillsCovered: skills.map((item) => item.skill),
        };
      }),
    );
  }

  async getBySlug(slug: string) {
    const course = await this.courseRepo.findOne({
      where: { slug, isPublished: true },
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    const skills = await this.courseSkillRepo.find({
      where: { courseId: course.id },
    });

    return {
      ...course,
      skillsCovered: skills.map((item) => item.skill),
    };
  }
}
