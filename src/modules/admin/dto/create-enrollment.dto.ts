import { IsEnum, IsOptional, IsString } from 'class-validator';
import {
  AccessType,
  EnrollmentStatus,
  PaymentStatus,
} from '../../../database/enums/core.enums';

export class CreateEnrollmentDto {
  @IsString()
  studentId!: string;

  @IsString()
  batchId!: string;

  @IsString()
  courseId!: string;

  @IsOptional()
  @IsString()
  totalFee?: string;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsEnum(EnrollmentStatus)
  enrollmentStatus?: EnrollmentStatus;

  @IsOptional()
  @IsEnum(AccessType)
  accessType?: AccessType;
}
