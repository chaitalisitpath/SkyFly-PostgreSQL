import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  ValidateIf,
  IsString,
  IsOptional,
  IsPhoneNumber,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  name: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @Transform(({ value }) => value && value.trim() ? value : undefined)
  @IsOptional()
  @IsPhoneNumber('IN', { message: 'Please provide a valid Indian phone number' })
  phone?: string;

  @Transform(({ value }) => value && value.trim() ? value : undefined)
  @IsOptional()
  @IsDateString({}, { message: 'Please provide a valid date for date of birth' })
  dob?: string;

  @ValidateIf(o => !o.provider || o.provider === 'local')
  @IsNotEmpty({ message: 'Password is required for local signup' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password?: string;

  @IsOptional()
  provider?: 'local' | 'google';
}
