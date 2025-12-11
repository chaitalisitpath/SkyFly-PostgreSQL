import { IsDefined, IsInt, IsArray, ValidateNested, Min, IsNumber, IsOptional } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PassengerDto } from './passenger.dto';

export class CreateBookingDto {
  @IsDefined({ message: 'Flight ID is required' })
  @IsInt()
  @Min(1)
  flightId: number;

  @IsDefined({ message: 'Passenger count is required' })
  @IsInt()
  @Min(1, { message: 'Passenger count must be at least 1' })
  passengerCount: number;

  @IsDefined({ message: 'Total amount is required' })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Total amount must be a valid decimal' })
  @Min(0, { message: 'Total amount must be >= 0' })
  @Transform(({ value }) => parseFloat(value))
  totalAmount: number;

  @IsDefined({ message: 'Passengers are required' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PassengerDto)
  passengers: PassengerDto[];
}

export class UpdateBookingDto {
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Passenger count must be at least 1' })
  passengerCount?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Total amount must be a valid decimal' })
  @Min(0, { message: 'Total amount must be >= 0' })
  @Transform(({ value }) => parseFloat(value))
  totalAmount?: number;
}