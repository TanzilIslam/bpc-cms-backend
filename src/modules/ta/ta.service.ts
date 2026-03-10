import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AttendanceEntity,
  BatchEntity,
  BatchTaEntity,
  EnrollmentEntity,
  SubmissionEntity,
} from '../../database/entities';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { GradeAssignmentDto } from './dto/grade-assignment.dto';

@Injectable()
export class TaService {
  constructor(
    @InjectRepository(BatchEntity)
    private readonly batchRepo: Repository<BatchEntity>,
    @InjectRepository(BatchTaEntity)
    private readonly batchTaRepo: Repository<BatchTaEntity>,
    @InjectRepository(EnrollmentEntity)
    private readonly enrollmentRepo: Repository<EnrollmentEntity>,
    @InjectRepository(AttendanceEntity)
    private readonly attendanceRepo: Repository<AttendanceEntity>,
    @InjectRepository(SubmissionEntity)
    private readonly submissionRepo: Repository<SubmissionEntity>,
  ) {}

  async listMyBatches(taId: string) {
    const assignments = await this.batchTaRepo.find({ where: { taId } });
    const batchIds = assignments.map((a) => a.batchId);
    if (batchIds.length === 0) return [];
    return this.batchRepo
      .createQueryBuilder('batch')
      .whereInIds(batchIds)
      .leftJoinAndSelect('batch.course', 'course')
      .orderBy('batch.createdAt', 'DESC')
      .getMany();
  }

  async listSubmissionsForGrading(taId: string) {
    const assignments = await this.batchTaRepo.find({ where: { taId } });
    const batchIds = assignments.map((a) => a.batchId);
    if (batchIds.length === 0) return [];
    const enrollments = await this.enrollmentRepo.find({
      where: batchIds.map((batchId) => ({ batchId })),
    });
    const studentIds = [...new Set(enrollments.map((e) => e.studentId))];
    if (studentIds.length === 0) return [];
    return this.submissionRepo
      .createQueryBuilder('submission')
      .where('submission.studentId IN (:...studentIds)', { studentIds })
      .orderBy('submission.submissionDate', 'DESC')
      .getMany();
  }

  async batchStudents(batchId: string) {
    const enrollments = await this.enrollmentRepo.find({
      where: { batchId },
      relations: { student: true },
      order: { createdAt: 'ASC' },
    });
    return enrollments.map((item) => ({
      enrollmentId: item.id,
      studentId: item.studentId,
      fullName: item.student.fullName,
      email: item.student.email,
      enrollmentStatus: item.enrollmentStatus,
      paymentStatus: item.paymentStatus,
    }));
  }

  markAttendance(actorId: string, dto: MarkAttendanceDto) {
    return this.attendanceRepo.save(
      this.attendanceRepo.create({
        batchId: dto.batchId,
        classDate: dto.classDate,
        classTopic: dto.classTopic || null,
        studentId: dto.studentId,
        status: dto.status,
        markedBy: actorId,
        notes: dto.notes || null,
      }),
    );
  }

  async gradeAssignment(
    actorId: string,
    assignmentId: string,
    dto: GradeAssignmentDto,
  ) {
    const submission = await this.submissionRepo.findOne({
      where: { assignmentId, studentId: dto.studentId },
    });
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }
    submission.score = dto.score;
    submission.feedback = dto.feedback || null;
    submission.status = dto.status;
    submission.gradedBy = actorId;
    submission.gradedAt = new Date();
    return this.submissionRepo.save(submission);
  }
}
