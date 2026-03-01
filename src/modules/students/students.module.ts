import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AssignmentEntity,
  CertificateEntity,
  EnrollmentEntity,
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
      SubmissionEntity,
      SubmissionFileEntity,
      CertificateEntity,
    ]),
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}
