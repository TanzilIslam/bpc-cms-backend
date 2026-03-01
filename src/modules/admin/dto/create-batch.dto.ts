import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { BatchStatus } from '../../../database/enums/core.enums';

export class CreateBatchDto {
  @IsString()
  courseId!: string;

  @IsString()
  batchName!: string;

  @IsString()
  batchCode!: string;

  @IsDateString()
  startDate!: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  schedule?: string;

  @IsInt()
  @Min(1)
  maxStudents!: number;

  @IsEnum(BatchStatus)
  status!: BatchStatus;

  @IsString()
  instructorId!: string;

  @IsArray()
  @IsString({ each: true })
  taIds!: string[];

  @IsOptional()
  @IsString()
  meetingLink?: string;

  @IsBoolean()
  isFree!: boolean;
}
