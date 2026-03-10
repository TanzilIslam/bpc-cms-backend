import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ProjectEntity,
  ProjectScreenshotEntity,
  ProjectTechnologyEntity,
} from '../../database/entities';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly projectRepo: Repository<ProjectEntity>,
    @InjectRepository(ProjectTechnologyEntity)
    private readonly technologyRepo: Repository<ProjectTechnologyEntity>,
    @InjectRepository(ProjectScreenshotEntity)
    private readonly screenshotRepo: Repository<ProjectScreenshotEntity>,
  ) {}

  async listMine(userId: string) {
    const projects = await this.projectRepo.find({
      where: { studentId: userId },
      order: { createdAt: 'DESC' },
    });
    return Promise.all(
      projects.map(async (project) => {
        const tech = await this.technologyRepo.find({
          where: { projectId: project.id },
        });
        const screenshots = await this.screenshotRepo.find({
          where: { projectId: project.id },
        });
        return {
          ...project,
          technologiesUsed: tech.map((item) => item.technology),
          screenshots: screenshots.map((item) => item.filePath),
        };
      }),
    );
  }

  async listPublic() {
    const projects = await this.projectRepo.find({
      where: { isPublic: true },
      order: { createdAt: 'DESC' },
    });
    return Promise.all(
      projects.map(async (project) => {
        const tech = await this.technologyRepo.find({
          where: { projectId: project.id },
        });
        const screenshots = await this.screenshotRepo.find({
          where: { projectId: project.id },
        });
        return {
          ...project,
          technologiesUsed: tech.map((item) => item.technology),
          screenshots: screenshots.map((item) => item.filePath),
        };
      }),
    );
  }
}
