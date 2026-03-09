import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SubmissionEntity,
  SubmissionFileEntity,
} from '../../database/entities';
import { UserRole } from '../../database/enums/core.enums';

@Injectable()
export class SubmissionsService {
  constructor(
    @InjectRepository(SubmissionEntity)
    private readonly submissionRepo: Repository<SubmissionEntity>,
    @InjectRepository(SubmissionFileEntity)
    private readonly submissionFileRepo: Repository<SubmissionFileEntity>,
  ) {}

  async getById(id: string, actor: { sub: string; role: UserRole }) {
    const submission = await this.submissionRepo.findOne({ where: { id } });
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    const isPrivileged =
      actor.role === UserRole.ADMIN ||
      actor.role === UserRole.SUPER_ADMIN ||
      actor.role === UserRole.TA;
    if (!isPrivileged && submission.studentId !== actor.sub) {
      throw new ForbiddenException('You do not have access to this submission');
    }

    const files = await this.submissionFileRepo.find({
      where: { submissionId: submission.id },
    });

    return {
      ...submission,
      filePaths: files.map((item) => item.filePath),
    };
  }
}
