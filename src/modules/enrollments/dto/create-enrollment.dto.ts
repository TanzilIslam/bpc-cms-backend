import { IsString } from 'class-validator';

export class CreateEnrollmentDto {
  @IsString()
  batchId!: string;
}
