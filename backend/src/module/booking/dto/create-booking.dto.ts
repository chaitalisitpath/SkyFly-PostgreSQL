import { IsDefined, IsInt, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PassengerDto } from './passenger.dto';

export class CreateBookingDto {
  @IsDefined({ message: 'Flight ID is required' })
  @IsInt()
  @Min(1)
  flightId: number;

  @IsDefined({ message: 'Passengers are required' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PassengerDto)
  passengers: PassengerDto[];
}