import { IsOptional, IsString, Matches } from 'class-validator';

export class UpdateMyProfileDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(?:\+8801|01)[3-9]\d{8}$/)
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  laptopSpecs?: string;

  @IsOptional()
  @IsString()
  internetSpeed?: string;

  @IsOptional()
  @IsString()
  dateOfBirth?: string;
}
