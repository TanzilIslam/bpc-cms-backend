import { IsOptional, IsString } from 'class-validator';

export class GenerateCertificateDto {
  @IsString()
  enrollmentId!: string;

  @IsOptional()
  @IsString()
  signatureName?: string;

  @IsOptional()
  @IsString()
  signatureTitle?: string;
}
