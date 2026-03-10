import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AssignmentEntity,
  AttendanceEntity,
  CertificateEntity,
  EnrollmentEntity,
  PaymentEntity,
  ProjectEntity,
  ProjectTechnologyEntity,
  SubmissionEntity,
  SubmissionFileEntity,
  UserEntity,
} from '../../database/entities';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      EnrollmentEntity,
      AssignmentEntity,
      AttendanceEntity,
      SubmissionEntity,
      SubmissionFileEntity,
      CertificateEntity,
      PaymentEntity,
      ProjectEntity,
      ProjectTechnologyEntity,
    ]),
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}
