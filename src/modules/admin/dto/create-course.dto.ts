import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { DifficultyLevel } from '../../../database/enums/core.enums';

export class CreateCourseDto {
  @IsString()
  title!: string;

  @IsString()
  slug!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(1)
  durationMonths!: number;

  @IsString()
  price!: string;

  @IsOptional()
  @IsString()
  installmentPlan?: string;

  @IsEnum(DifficultyLevel)
  difficultyLevel!: DifficultyLevel;

  @IsBoolean()
  isPublished!: boolean;

  @IsOptional()
  @IsString()
  thumbnail?: string;
}
