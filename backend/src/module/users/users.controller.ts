import { Body, Controller, Param, ParseIntPipe, Put, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateAircraftDto } from '../aircraft/dto/aircraft.dto';
import { UpdateUserDto } from './dto/update.user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly userService : UsersService){}

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

