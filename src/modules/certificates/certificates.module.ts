import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CertificateEntity,
  CertificateSkillEntity,
  EnrollmentEntity,
} from '../../database/entities';
import { CertificatesController } from './certificates.controller';
import { CertificatesService } from './certificates.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CertificateEntity,
      CertificateSkillEntity,
      EnrollmentEntity,
    ]),
  ],
  controllers: [CertificatesController],
  providers: [CertificatesService],
  exports: [CertificatesService],
})
export class CertificatesModule {}
