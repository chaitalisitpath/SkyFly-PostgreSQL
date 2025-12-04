import { IsDefined, IsString, IsInt, IsEnum, Min, Max, IsNotEmpty } from 'class-validator';
import { Gender } from '@prisma/client';

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
}