import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProjectDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsOptional()
  @IsString()
  githubLink?: string;

  @IsOptional()
  @IsString()
  liveDemoLink?: string;

  @IsArray()
  @IsString({ each: true })
  technologiesUsed!: string[];

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
