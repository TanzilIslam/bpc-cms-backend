import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SubmissionStatus } from '../../../database/enums/core.enums';

export class GradeAssignmentDto {
  @IsString()
  studentId!: string;

  @IsString()
  score!: string;

  @IsOptional()
  @IsString()
  feedback?: string;

  @IsEnum(SubmissionStatus)
  status!: SubmissionStatus;
}
