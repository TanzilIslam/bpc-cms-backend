import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AnnouncementEntity,
  BatchEntity,
  BatchTaEntity,
  AssignmentEntity,
  AssignmentRequiredFileEntity,
  AttendanceEntity,
  CertificateEntity,
  CourseContentEntity,
  CourseEntity,
  EnrollmentEntity,
  EnrollmentFormEntity,
  ExpenseEntity,
  FinancialGoalEntity,
  PaymentEntity,
  SubmissionEntity,
  TestimonialEntity,
  UserEntity,
} from '../../database/entities';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { CertificatesModule } from '../certificates/certificates.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      CourseEntity,
      CourseContentEntity,
      BatchEntity,
      BatchTaEntity,
      AssignmentEntity,
      AssignmentRequiredFileEntity,
      SubmissionEntity,
      AttendanceEntity,
      PaymentEntity,
      EnrollmentEntity,
      ExpenseEntity,
      EnrollmentFormEntity,
      CertificateEntity,
      FinancialGoalEntity,
      AnnouncementEntity,
      TestimonialEntity,
    ]),
    CertificatesModule,
    NotificationsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
