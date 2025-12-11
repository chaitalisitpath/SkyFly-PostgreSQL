import {
  IsString,
  IsInt,
  IsOptional,
  Min,
  IsDefined,
  IsNotEmpty,
} from 'class-validator';

export class CreateAircraftDto {
  @IsDefined({ message: 'Aircraft model is required' })
  @IsString()
  @IsNotEmpty()
  model: string;

  @IsOptional()
  @IsInt()
  @Min(0, { message: 'Economy seat count must be >= 0' })
  economySeatCount?: number;

  @IsOptional()
  @IsInt()
  @Min(0, { message: 'Business seat count must be >= 0' })
  businessSeatCount?: number;

  @IsOptional()
  @IsInt()
  @Min(0, { message: 'First seat count must be >= 0' })
  firstSeatCount?: number;
}

export class UpdateAircraftDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  model?: string;

  @IsOptional()
  @IsInt()
  @Min(0, { message: 'Economy seat count must be >= 0' })
  economySeatCount?: number;

  @IsOptional()
  @IsInt()
  @Min(0, { message: 'Business seat count must be >= 0' })
  businessSeatCount?: number;

  @IsOptional()
  @IsInt()
  @Min(0, { message: 'First seat count must be >= 0' })
  firstSeatCount?: number;
}