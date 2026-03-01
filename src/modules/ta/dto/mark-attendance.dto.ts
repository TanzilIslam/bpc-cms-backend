import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AttendanceStatus } from '../../../database/enums/core.enums';

export class MarkAttendanceDto {
  @IsString()
  batchId!: string;

  @IsString()
  classDate!: string;

  @IsOptional()
  @IsString()
  classTopic?: string;

  @IsString()
  studentId!: string;

  @IsEnum(AttendanceStatus)
  status!: AttendanceStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
