import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ContentType } from '../../../database/enums/core.enums';

export class CreateCourseContentDto {
  @IsString()
  courseId!: string;

  @IsInt()
  @Min(1)
  moduleNumber!: number;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ContentType)
  contentType!: ContentType;

  @IsString()
  contentUrl!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  durationMinutes?: number;

  @IsInt()
  @Min(1)
  order!: number;

  @IsBoolean()
  isFreePreview!: boolean;
}
