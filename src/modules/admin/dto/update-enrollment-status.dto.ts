import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EnrollmentStatus } from '../../../database/enums/core.enums';

export class UpdateEnrollmentStatusDto {
  @IsEnum(EnrollmentStatus)
  enrollmentStatus!: EnrollmentStatus;

  @IsOptional()
  @IsString()
  finalGrade?: string;
}
