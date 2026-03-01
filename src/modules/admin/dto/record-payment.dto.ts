import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import {
  PaymentMethod,
  PaymentRecordStatus,
} from '../../../database/enums/core.enums';

export class RecordPaymentDto {
  @IsString()
  enrollmentId!: string;

  @IsString()
  studentId!: string;

  @IsString()
  amount!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  installmentNumber?: number;

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsString()
  paymentDate!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(PaymentRecordStatus)
  status?: PaymentRecordStatus;
}
