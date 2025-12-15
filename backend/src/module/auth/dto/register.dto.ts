import { IsEmail, IsNotEmpty, MinLength, ValidateIf, IsString, IsOptional, IsPhoneNumber, IsDateString } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

 @IsPhoneNumber('IN')
  phone: string;

  @IsDateString()
  dob: string;

  @ValidateIf(o => o.provider === 'local')
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  provider?: 'local' | 'google';
}
