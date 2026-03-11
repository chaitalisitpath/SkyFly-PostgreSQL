import { IsDefined, IsInt, IsString, Min, Max, MinLength } from 'class-validator';

export class CreateReviewDto {
  @IsDefined({ message: 'Passenger ID is required' })
  @IsInt()
  @Min(1)
  passengerId: number;

  @IsDefined({ message: 'Flight ID is required' })
  @IsInt()
  @Min(1)
  flightId: number;

  @IsDefined({ message: 'Stars rating is required' })
  @IsInt()
  @Min(1, { message: 'Stars must be at least 1' })
  @Max(5, { message: 'Stars must be at most 5' })
  stars: number;

  @IsDefined({ message: 'Review content is required' })
  @IsString()
  @MinLength(10, { message: 'Review content must be at least 10 characters' })
  content: string;
}
