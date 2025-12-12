import {
  IsString,
  IsInt,
  IsOptional,
  Min,
  Max,
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
  @Max(50,{message:'Economy class seats can not be greater than 50'})
  economySeatCount?: number;

  @IsOptional()
  @IsInt()
  @Min(0, { message: 'Business seat count must be >= 0' })
  @Max(20,{message:'Business class seats can not be greater than 20'})
  businessSeatCount?: number;

  @IsOptional()
  @IsInt()
  @Min(0, { message: 'First seat count must be >= 0' })
  @Max(10, {message: 'First class seats can not be greater than 10'})
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
  @Max(50,{message:'Economy class seats can not be greater than 50'})
  economySeatCount?: number;

  @IsOptional()
  @IsInt()
  @Min(0, { message: 'Business seat count must be >= 0' })
  @Max(20,{message:'Business class seats can not be greater than 20'})
  businessSeatCount?: number;

  @IsOptional()
  @IsInt()
  @Min(0, { message: 'First seat count must be >= 0' })
  @Max(10, {message: 'First class seats can not be greater than 10'})
  firstSeatCount?: number;
}