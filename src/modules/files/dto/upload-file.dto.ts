import { IsBoolean, IsEnum, IsString } from 'class-validator';
import { FileEntityType } from '../../../database/enums/core.enums';

export class UploadFileDto {
  @IsEnum(FileEntityType)
  entityType!: FileEntityType;

  @IsString()
  entityId!: string;

  @IsBoolean()
  isPublic!: boolean;
}
