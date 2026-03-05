import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EnrollmentFormStatus } from '../../../database/enums/core.enums';

export class UpdateEnrollmentFormStatusDto {
  @IsEnum(EnrollmentFormStatus)
  status!: EnrollmentFormStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
