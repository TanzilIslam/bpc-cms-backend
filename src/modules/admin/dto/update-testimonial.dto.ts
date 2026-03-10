import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateTestimonialDto {
  @IsOptional()
  @IsBoolean()
  isApproved?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}
