import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AssignmentEntity,
  AssignmentRequiredFileEntity,
  EnrollmentEntity,
} from '../../database/entities';
import { UserRole } from '../../database/enums/core.enums';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(AssignmentEntity)
    private readonly assignmentRepo: Repository<AssignmentEntity>,
    @InjectRepository(AssignmentRequiredFileEntity)
    private readonly requiredFileRepo: Repository<AssignmentRequiredFileEntity>,
    @InjectRepository(EnrollmentEntity)
    private readonly enrollmentRepo: Repository<EnrollmentEntity>,
  ) {}

  async getById(id: string, actor: { sub: string; role: UserRole }) {
    const assignment = await this.assignmentRepo.findOne({
      where: { id },
      relations: { courseContent: true },
    });
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (actor.role === UserRole.STUDENT) {
      const enrollment = await this.enrollmentRepo.findOne({
        where: {
          studentId: actor.sub,
          courseId: assignment.courseContent.courseId,
        },
      });
      if (!enrollment) {
        throw new ForbiddenException('You are not enrolled for this assignment');
      }
    }

    const requiredFiles = await this.requiredFileRepo.find({
      where: { assignmentId: assignment.id },
    });

    return {
      ...assignment,
      requiredFiles: requiredFiles.map((item) => item.fileExtension),
    };
  }
}
