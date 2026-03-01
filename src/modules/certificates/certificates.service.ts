import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CertificateEntity,
  CertificateSkillEntity,
  EnrollmentEntity,
} from '../../database/entities';

@Injectable()
export class CertificatesService {
  constructor(
    @InjectRepository(CertificateEntity)
    private readonly certificateRepo: Repository<CertificateEntity>,
    @InjectRepository(CertificateSkillEntity)
    private readonly certificateSkillRepo: Repository<CertificateSkillEntity>,
    @InjectRepository(EnrollmentEntity)
    private readonly enrollmentRepo: Repository<EnrollmentEntity>,
  ) {}

  async verify(code: string) {
    const certificate = await this.certificateRepo.findOne({
      where: { certificateCode: code },
    });
    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }
    const skills = await this.certificateSkillRepo.find({
      where: { certificateId: certificate.id },
    });

    return {
      certificateCode: certificate.certificateCode,
      isVerified: certificate.isVerified,
      issueDate: certificate.issueDate,
      grade: certificate.grade,
      skillsEarned: skills.map((item) => item.skill),
      verificationLink: certificate.verificationLink,
    };
  }

  async generateForEnrollment(
    enrollmentId: string,
    signatureName: string,
    signatureTitle: string,
  ) {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { id: enrollmentId },
    });
    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    if (enrollment.certificateIssued && enrollment.certificateId) {
      const existing = await this.certificateRepo.findOne({
        where: { certificateCode: enrollment.certificateId },
      });
      if (existing) {
        return existing;
      }
    }

    const sequence = `${Date.now()}`.slice(-6);
    const code = `BPC-${sequence}`;
    const cert = this.certificateRepo.create({
      certificateCode: code,
      studentId: enrollment.studentId,
      enrollmentId: enrollment.id,
      courseId: enrollment.courseId,
      issueDate: new Date().toISOString().slice(0, 10),
      grade: enrollment.finalGrade,
      signatureName,
      signatureTitle,
      pdfPath: null,
      isVerified: true,
      verificationLink: `/api/v1/certificates/verify/${code}`,
    });
    const saved = await this.certificateRepo.save(cert);
    enrollment.certificateIssued = true;
    enrollment.certificateId = saved.certificateCode;
    await this.enrollmentRepo.save(enrollment);
    return saved;
  }
}
