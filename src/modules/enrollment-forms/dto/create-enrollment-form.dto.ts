import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateEnrollmentFormDto {
  @IsString()
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @Matches(/^(?:\+8801|01)[3-9]\d{8}$/)
  phone!: string;

  @IsString()
  interestedCourse!: string;

  @IsBoolean()
  hasLaptop!: boolean;

  @IsOptional()
  @IsString()
  laptopSpecs?: string;

  @IsBoolean()
  hasInternet!: boolean;

  @IsOptional()
  @IsString()
  whyJoin?: string;
}
