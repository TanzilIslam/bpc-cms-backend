import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BatchEntity,
  BatchTaEntity,
  CourseContentEntity,
  CourseEntity,
  EnrollmentEntity,
  PaymentEntity,
  UserEntity,
} from '../../database/entities';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { CertificatesModule } from '../certificates/certificates.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      CourseEntity,
      CourseContentEntity,
      BatchEntity,
      BatchTaEntity,
      PaymentEntity,
      EnrollmentEntity,
    ]),
    CertificatesModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
