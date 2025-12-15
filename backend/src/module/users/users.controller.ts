import { Body, Controller, Param, ParseIntPipe, Put, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateAircraftDto } from '../aircraft/dto/aircraft.dto';
import { UpdateUserDto } from './dto/update.user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly userService : UsersService){}

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async GetUser(
        @Param('id', ParseIntPipe) id:number
    ){
        return this.userService.GetUser(id);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    async UpdateUser(
        @Param('id', ParseIntPipe) id:number,
        @Body() dto:UpdateUserDto
    ){
        console.log('UpdateUser called with id:', id, 'dto:', dto);
        return this.userService.UpdateUser(id, dto);
    }
}

