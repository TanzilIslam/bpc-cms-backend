import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AssignmentEntity,
  CertificateEntity,
  EnrollmentEntity,
  SubmissionEntity,
  SubmissionFileEntity,
  UserEntity,
} from '../../database/entities';
import { SubmissionStatus } from '../../database/enums/core.enums';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(EnrollmentEntity)
    private readonly enrollmentRepo: Repository<EnrollmentEntity>,
    @InjectRepository(AssignmentEntity)
    private readonly assignmentRepo: Repository<AssignmentEntity>,
    @InjectRepository(SubmissionEntity)
    private readonly submissionRepo: Repository<SubmissionEntity>,
    @InjectRepository(SubmissionFileEntity)
    private readonly submissionFileRepo: Repository<SubmissionFileEntity>,
    @InjectRepository(CertificateEntity)
    private readonly certificateRepo: Repository<CertificateEntity>,
  ) {}

  async myProfile(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      status: user.status,
      profilePhoto: user.profilePhoto,
      dateOfBirth: user.dateOfBirth,
      address: user.address,
      laptopSpecs: user.laptopSpecs,
      internetSpeed: user.internetSpeed,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
    };
  }

  myEnrollments(userId: string) {
    return this.enrollmentRepo.find({
      where: { studentId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async myAssignments(userId: string) {
    const enrollments = await this.enrollmentRepo.find({
      where: { studentId: userId },
    });
    const courseIds = enrollments.map((item) => item.courseId);
    if (courseIds.length === 0) {
      return [];
    }

    const assignments = await this.assignmentRepo
      .createQueryBuilder('assignment')
      .innerJoin(
        'course_contents',
        'content',
        'content.id = assignment.course_content_id',
      )
      .where('content.course_id IN (:...courseIds)', { courseIds })
      .orderBy('assignment.created_at', 'DESC')
      .getMany();

    return assignments;
  }

  async submitAssignment(
    userId: string,
    assignmentId: string,
    input: SubmitAssignmentDto,
  ) {
    const assignment = await this.assignmentRepo.findOne({
      where: { id: assignmentId },
      relations: { courseContent: true },
    });
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }
    const enrollment = await this.enrollmentRepo.findOne({
      where: {
        studentId: userId,
        courseId: assignment.courseContent.courseId,
      },
      order: { createdAt: 'DESC' },
    });
    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    let submission = await this.submissionRepo.findOne({
      where: {
        assignmentId,
        studentId: userId,
      },
    });
    if (!submission) {
      submission = this.submissionRepo.create({
        assignmentId,
        studentId: userId,
        enrollmentId: enrollment.id,
        submissionDate: new Date(),
        githubLink: input.githubLink || null,
        liveDemoLink: input.liveDemoLink || null,
        notes: input.notes || null,
        status: SubmissionStatus.SUBMITTED,
        score: null,
        feedback: null,
        gradedBy: null,
        gradedAt: null,
      });
    } else {
      submission.submissionDate = new Date();
      submission.githubLink = input.githubLink || null;
      submission.liveDemoLink = input.liveDemoLink || null;
      submission.notes = input.notes || null;
      submission.status = SubmissionStatus.SUBMITTED;
    }
    const saved = await this.submissionRepo.save(submission);

    await this.submissionFileRepo.delete({ submissionId: saved.id });
    if (input.filePaths.length > 0) {
      await this.submissionFileRepo.save(
        input.filePaths.map((filePath) =>
          this.submissionFileRepo.create({
            submissionId: saved.id,
            filePath,
          }),
        ),
      );
    }
    return saved;
  }

  async myProgress(userId: string) {
    const enrollments = await this.enrollmentRepo.find({
      where: { studentId: userId },
    });
    if (enrollments.length === 0) {
      return { overallProgress: 0, courses: [] };
    }

    const total = enrollments.reduce(
      (acc, curr) => acc + Number(curr.progressPercentage),
      0,
    );
    return {
      overallProgress: total / enrollments.length,
      courses: enrollments.map((item) => ({
        enrollmentId: item.id,
        courseId: item.courseId,
        progressPercentage: Number(item.progressPercentage),
      })),
    };
  }

  async myCertificates(userId: string) {
    return this.certificateRepo.find({
      where: { studentId: userId },
      order: { createdAt: 'DESC' },
    });
  }
}
