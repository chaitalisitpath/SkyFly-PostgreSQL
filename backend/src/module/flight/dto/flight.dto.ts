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
  Matches,
  IsDecimal
} from 'class-validator';
import { FlightStatus } from '@prisma/client';
import { Transform } from 'class-transformer';

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

  @IsDefined({ message: 'Aircraft ID is required' })
  @IsInt()
  @Min(1)
  aircraftId: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Economy price must be a valid decimal' })
  @Min(0, { message: 'Economy price must be >= 0' })
  @Transform(({ value }) => parseFloat(value))
  economyPrice?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Business price must be a valid decimal' })
  @Min(0, { message: 'Business price must be >= 0' })
  @Transform(({ value }) => parseFloat(value))
  businessPrice?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'First price must be a valid decimal' })
  @Min(0, { message: 'First price must be >= 0' })
  @Transform(({ value }) => parseFloat(value))
  firstPrice?: number;

  @IsOptional()
  @IsEnum(FlightStatus)
  status?: FlightStatus;
}

export class UpdateFlightDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]{2}\d{2,4}$/)
  flightNumber?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  departureAirport?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  arrivalAirport?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  departureAirportTerminal?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  arrivalAirportTerminal?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  fromCity?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  toCity?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Departure time must be a valid date' })
  departureTime?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Arrival time must be a valid date' })
  arrivalTime?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  aircraftId?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Economy price must be a valid decimal' })
  @Min(0, { message: 'Economy price must be >= 0' })
  @Transform(({ value }) => parseFloat(value))
  economyPrice?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Business price must be a valid decimal' })
  @Min(0, { message: 'Business price must be >= 0' })
  @Transform(({ value }) => parseFloat(value))
  businessPrice?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'First price must be a valid decimal' })
  @Min(0, { message: 'First price must be >= 0' })
  @Transform(({ value }) => parseFloat(value))
  firstPrice?: number;

  @IsOptional()
  @IsEnum(FlightStatus)
  status?: FlightStatus;
}
