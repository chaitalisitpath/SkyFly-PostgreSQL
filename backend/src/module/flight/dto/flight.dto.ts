import {
  IsString,
  IsInt,
  IsNumber,
  IsDateString,
  Min,
  IsOptional,
  IsEnum,
  IsDefined,
  IsNotEmpty,
  Matches
} from 'class-validator';
import { FlightStatus } from '@prisma/client';

export class CreateFlightDto {
  @IsDefined({ message: 'Flight number is required' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]{2}\d{2,4}$/)
  flightNumber: string;

  @IsDefined({ message: 'Departure airport is required' })
  @IsString()
  @IsNotEmpty()
  departureAirport: string;

  @IsDefined({ message: 'Arrival airport is required' })
  @IsString()
  @IsNotEmpty()
  arrivalAirport: string;

  @IsDefined({ message: 'Departure terminal is required' })
  @IsInt()
  @Min(1)
  departureAirportTerminal: number;

  @IsDefined({ message: 'Arrival terminal is required' })
  @IsInt()
  @Min(1)
  arrivalAirportTerminal: number;

  @IsDefined({ message: 'From city is required' })
  @IsString()
  @IsNotEmpty()
  fromCity: string;

  @IsDefined({ message: 'To city is required' })
  @IsString()
  @IsNotEmpty()
  toCity: string;

  @IsDefined({ message: 'Departure time is required' })
  @IsDateString({}, { message: 'Departure time must be a valid date' })
  departureTime: string;

  @IsDefined({ message: 'Arrival time is required' })
  @IsDateString({}, { message: 'Arrival time must be a valid date' })
  arrivalTime: string;

  @IsDefined({ message: 'Total seats is required' })
  @IsInt()
  @Min(1)
  totalSeats: number;

  availableSeats: number;

  @IsDefined({ message: 'Price is required' })
  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price must be >= 0' })
  price: number;

  @IsOptional()
  @IsEnum(FlightStatus)
  status?: FlightStatus;
}
