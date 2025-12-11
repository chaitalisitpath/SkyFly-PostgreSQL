import { IsDefined, IsString, IsInt, IsEnum, Min, Max, IsNotEmpty, IsOptional } from 'class-validator';
import { Gender, SeatClass } from '@prisma/client';

export class PassengerDto {
  @IsDefined({ message: 'Name is required' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDefined({ message: 'Age is required' })
  @IsInt()
  @Min(1, { message: 'Age must be at least 1' })
  @Max(120, { message: 'Age must be at most 120' })
  age: number;

  @IsDefined({ message: 'Gender is required' })
  @IsEnum(Gender)
  gender: Gender;

  @IsDefined({ message: 'Seat class is required' })
  @IsEnum(SeatClass)
  seatClass: SeatClass;

  @IsDefined({ message: 'Seat number is required' })
  @IsString()
  @IsNotEmpty()
  seatNumber: string;
}

export class CreatePassengerDto {
  @IsDefined({ message: 'Booking ID is required' })
  @IsInt()
  @Min(1)
  bookingId: number;

  @IsDefined({ message: 'Flight ID is required' })
  @IsInt()
  @Min(1)
  flightId: number;

  @IsDefined({ message: 'Name is required' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDefined({ message: 'Age is required' })
  @IsInt()
  @Min(1, { message: 'Age must be at least 1' })
  @Max(120, { message: 'Age must be at most 120' })
  age: number;

  @IsDefined({ message: 'Gender is required' })
  @IsEnum(Gender)
  gender: Gender;

  @IsDefined({ message: 'Seat class is required' })
  @IsEnum(SeatClass)
  seatClass: SeatClass;

  @IsDefined({ message: 'Seat number is required' })
  @IsString()
  @IsNotEmpty()
  seatNumber: string;
}

export class UpdatePassengerDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Age must be at least 1' })
  @Max(120, { message: 'Age must be at most 120' })
  age?: number;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsEnum(SeatClass)
  seatClass?: SeatClass;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  seatNumber?: string;
}