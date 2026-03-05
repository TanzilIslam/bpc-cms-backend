import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BatchEntity, EnrollmentEntity } from '../../database/entities';
import {
  AccessType,
  EnrollmentStatus,
  PaymentStatus,
} from '../../database/enums/core.enums';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(EnrollmentEntity)
    private readonly enrollmentRepo: Repository<EnrollmentEntity>,
    @InjectRepository(BatchEntity)
    private readonly batchRepo: Repository<BatchEntity>,
  ) {}

  async enroll(userId: string, dto: CreateEnrollmentDto) {
    const batch = await this.batchRepo.findOne({ where: { id: dto.batchId } });
    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    const totalFee = batch.isFree ? '0' : '10000';
    const existing = await this.enrollmentRepo.findOne({
      where: { studentId: userId, batchId: batch.id },
    });
    if (existing) {
      return existing;
    }

    const enrollment = this.enrollmentRepo.create({
      studentId: userId,
      batchId: batch.id,
      courseId: batch.courseId,
      enrollmentDate: new Date().toISOString().slice(0, 10),
      enrollmentStatus: batch.isFree ? EnrollmentStatus.ACTIVE : EnrollmentStatus.PENDING,
      paymentStatus: batch.isFree ? PaymentStatus.FULL : PaymentStatus.UNPAID,
      totalFee,
      amountPaid: '0',
      accessType: AccessType.BOTH,
      accessExpiresAt: null,
      progressPercentage: '0',
      finalGrade: null,
      certificateIssued: false,
      certificateId: null,
      completionDate: null,
    });

    const saved = await this.enrollmentRepo.save(enrollment);
    batch.currentEnrollment += 1;
    await this.batchRepo.save(batch);
    return saved;
  }
}
