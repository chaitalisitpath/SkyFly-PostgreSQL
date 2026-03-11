import { IsOptional, IsInt, IsString, Min, Max, MinLength } from 'class-validator';

export class UpdateReviewDto {
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Stars must be at least 1' })
  @Max(5, { message: 'Stars must be at most 5' })
  stars?: number;

  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'Review content must be at least 10 characters' })
  content?: string;
}
