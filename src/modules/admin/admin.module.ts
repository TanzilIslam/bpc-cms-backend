import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BatchEntity,
  BatchTaEntity,
  AssignmentEntity,
  AssignmentRequiredFileEntity,
  AttendanceEntity,
  CourseContentEntity,
  CourseEntity,
  EnrollmentEntity,
  EnrollmentFormEntity,
  ExpenseEntity,
  PaymentEntity,
  SubmissionEntity,
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
    ]),
    CertificatesModule,
    NotificationsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
