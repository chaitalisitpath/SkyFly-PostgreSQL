import { IsEmail, IsOptional, IsString, IsPhoneNumber, IsDateString } from "class-validator";

export class UpdateUserDto{

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsPhoneNumber('IN')
    @IsOptional()
    phone: string;
    
    @IsDateString()
    @IsOptional()
    dob: string;
}