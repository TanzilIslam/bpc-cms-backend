import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  fullName!: string;

  @IsString()
  @Matches(/^(?:\+8801|01)[3-9]\d{8}$/)
  phone!: string;

  @IsOptional()
  @IsString()
  address?: string;
}
