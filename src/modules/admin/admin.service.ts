import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BatchEntity,
  BatchTaEntity,
  CourseContentEntity,
  CourseEntity,
  EnrollmentEntity,
  PaymentEntity,
  UserEntity,
} from '../../database/entities';
import { UserRole } from '../../database/enums/core.enums';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateBatchDto } from './dto/create-batch.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { AuthUser } from '../../common/auth/auth-user.interface';
import { CertificatesService } from '../certificates/certificates.service';
import { GenerateCertificateDto } from './dto/generate-certificate.dto';
import { CreateCourseContentDto } from './dto/create-course-content.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(CourseEntity)
    private readonly courseRepo: Repository<CourseEntity>,
    @InjectRepository(CourseContentEntity)
    private readonly courseContentRepo: Repository<CourseContentEntity>,
    @InjectRepository(BatchEntity)
    private readonly batchRepo: Repository<BatchEntity>,
    @InjectRepository(BatchTaEntity)
    private readonly batchTaRepo: Repository<BatchTaEntity>,
    @InjectRepository(PaymentEntity)
    private readonly paymentRepo: Repository<PaymentEntity>,
    @InjectRepository(EnrollmentEntity)
    private readonly enrollmentRepo: Repository<EnrollmentEntity>,
    private readonly certificatesService: CertificatesService,
  ) {}

  listStudents() {
    return this.userRepo.find({
      where: { role: UserRole.STUDENT },
      order: { createdAt: 'DESC' },
    });
  }

  createCourse(dto: CreateCourseDto, actor: AuthUser) {
    return this.courseRepo.save(
      this.courseRepo.create({
        title: dto.title,
        slug: dto.slug,
        description: dto.description || null,
        durationMonths: dto.durationMonths,
        price: dto.price,
        installmentPlan: dto.installmentPlan || null,
        difficultyLevel: dto.difficultyLevel,
        isPublished: dto.isPublished,
        thumbnail: dto.thumbnail || null,
        recordedCoursePrice: '0',
        recordedAccessMonths: null,
        createdBy: actor.sub,
      }),
    );
  }

  async createBatch(dto: CreateBatchDto) {
    const batch = await this.batchRepo.save(
      this.batchRepo.create({
        courseId: dto.courseId,
        batchName: dto.batchName,
        batchCode: dto.batchCode,
        startDate: dto.startDate,
        endDate: dto.endDate || null,
        schedule: dto.schedule || null,
        maxStudents: dto.maxStudents,
        status: dto.status,
        instructorId: dto.instructorId,
        meetingLink: dto.meetingLink || null,
        isFree: dto.isFree,
      }),
    );

    if (dto.taIds.length > 0) {
      await this.batchTaRepo.save(
        dto.taIds.map((taId) =>
          this.batchTaRepo.create({
            batchId: batch.id,
            taId,
          }),
        ),
      );
    }
    return batch;
  }

  createCourseContent(dto: CreateCourseContentDto) {
    return this.courseContentRepo.save(
      this.courseContentRepo.create({
        courseId: dto.courseId,
        moduleNumber: dto.moduleNumber,
        title: dto.title,
        description: dto.description || null,
        contentType: dto.contentType,
        contentUrl: dto.contentUrl,
        durationMinutes: dto.durationMinutes || null,
        order: dto.order,
        isFreePreview: dto.isFreePreview,
      }),
    );
  }

  async recordPayment(dto: RecordPaymentDto, actor: AuthUser) {
    const payment = await this.paymentRepo.save(
      this.paymentRepo.create({
        enrollmentId: dto.enrollmentId,
        studentId: dto.studentId,
        amount: dto.amount,
        installmentNumber: dto.installmentNumber || null,
        paymentMethod: dto.paymentMethod,
        transactionId: dto.transactionId || null,
        paymentDate: dto.paymentDate,
        receivedBy: actor.sub,
        notes: dto.notes || null,
        status: dto.status || undefined,
      }),
    );

    const enrollment = await this.enrollmentRepo.findOne({
      where: { id: dto.enrollmentId },
    });
    if (enrollment) {
      const newAmount = Number(enrollment.amountPaid) + Number(dto.amount);
      enrollment.amountPaid = `${newAmount}`;
      await this.enrollmentRepo.save(enrollment);
    }
    return payment;
  }

  async financialDashboard() {
    const payments = await this.paymentRepo.find();
    const enrollments = await this.enrollmentRepo.find();
    const totalRevenue = payments.reduce(
      (sum, curr) => sum + Number(curr.amount),
      0,
    );
    const outstanding = enrollments.reduce(
      (sum, curr) => sum + (Number(curr.totalFee) - Number(curr.amountPaid)),
      0,
    );

    return {
      totalRevenue,
      totalPayments: payments.length,
      outstandingAmount: outstanding,
    };
  }

  generateCertificate(dto: GenerateCertificateDto) {
    return this.certificatesService.generateForEnrollment(
      dto.enrollmentId,
      dto.signatureName || 'Founder',
      dto.signatureTitle || 'Lead Instructor',
    );
  }
}
