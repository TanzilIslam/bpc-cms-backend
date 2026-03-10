import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { GoalStatus } from '../../../database/enums/core.enums';

export class UpdateFinancialGoalDto {
  @IsOptional()
  @IsString()
  goalName?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  targetAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  currentAmount?: number;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsEnum(GoalStatus)
  status?: GoalStatus;
}
