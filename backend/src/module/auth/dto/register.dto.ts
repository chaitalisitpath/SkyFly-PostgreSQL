import { IsEmail, IsNotEmpty, MinLength, ValidateIf, IsString, IsOptional, IsPhoneNumber, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @Transform(({ value }) => value && value.trim() ? value : undefined)
  @IsOptional()
  @IsPhoneNumber('IN')
  phone?: string;

  @Transform(({ value }) => value && value.trim() ? value : undefined)
  @IsOptional()
  @IsDateString()
  dob?: string;

  @ValidateIf(o => o.provider === 'local')
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  provider?: 'local' | 'google';
}
