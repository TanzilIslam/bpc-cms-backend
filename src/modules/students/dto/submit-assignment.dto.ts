import { IsArray, IsOptional, IsString } from 'class-validator';

export class SubmitAssignmentDto {
  @IsArray()
  @IsString({ each: true })
  filePaths!: string[];

  @IsOptional()
  @IsString()
  githubLink?: string;

  @IsOptional()
  @IsString()
  liveDemoLink?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
