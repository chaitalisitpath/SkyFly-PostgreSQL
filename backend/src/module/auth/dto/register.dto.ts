import { IsEmail, IsNotEmpty, MinLength, ValidateIf, IsString, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @ValidateIf(o => o.provider === 'local')
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  provider?: 'local' | 'google';
}
