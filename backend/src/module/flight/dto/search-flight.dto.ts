import { IsOptional, IsString, IsISO8601 } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchFlightDto {
  @IsOptional()
  @IsString()
  fromCity?: string;

  @IsOptional()
  @IsString()
  toCity?: string;

  // Accept date strings like "2025-12-03"
  @IsOptional()
  @IsString()
  departureTime?: string;
}