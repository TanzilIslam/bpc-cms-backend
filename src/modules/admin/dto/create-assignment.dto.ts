import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { AssignmentType } from '../../../database/enums/core.enums';

export class CreateAssignmentDto {
  @IsString()
  courseContentId!: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(AssignmentType)
  assignmentType!: AssignmentType;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxScore?: number;

  @IsOptional()
  @IsString()
  dueDate?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredFiles?: string[];

  @IsOptional()
  @IsString()
  submissionInstructions?: string;
}
