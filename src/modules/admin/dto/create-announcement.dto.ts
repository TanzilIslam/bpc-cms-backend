import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  AnnouncementAudience,
  AnnouncementPriority,
} from '../../../database/enums/core.enums';

export class CreateAnnouncementDto {
  @IsString()
  title!: string;

  @IsString()
  content!: string;

  @IsOptional()
  @IsEnum(AnnouncementAudience)
  targetAudience?: AnnouncementAudience;

  @IsOptional()
  @IsString()
  batchId?: string;

  @IsOptional()
  @IsString()
  courseId?: string;

  @IsOptional()
  @IsEnum(AnnouncementPriority)
  priority?: AnnouncementPriority;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsDateString()
  publishDate?: string;
}
