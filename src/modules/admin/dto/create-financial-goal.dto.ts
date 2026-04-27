import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateFinancialGoalDto {
  @IsString()
  goalName!: string;

  @IsNumber()
  @Min(0)
  targetAmount!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  currentAmount?: number;

  @IsOptional()
  @IsDateString()
  deadline?: string;
}
