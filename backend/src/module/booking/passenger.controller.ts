import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PassengerService } from './passenger.service';
import { CreatePassengerDto, UpdatePassengerDto } from './dto/passenger.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('passengers')
@UseGuards(JwtAuthGuard)
export class PassengerController {
  constructor(private readonly passengerService: PassengerService) {}

  @Get('flight/:flightId')
  async getPassengersByFlight(@Param('flightId', ParseIntPipe) flightId: number) {
    return this.passengerService.getPassengersByFlight(flightId);
  }

  @Get('booking/:bookingId')
  async getPassengersByBooking(@Param('bookingId', ParseIntPipe) bookingId: number) {
    return this.passengerService.getPassengersByBooking(bookingId);
  }

  @Get('flight/:flightId/seatmap')
  async getFlightSeatMap(@Param('flightId', ParseIntPipe) flightId: number) {
    return this.passengerService.getFlightSeatMap(flightId);
  }

  @Get(':id')
  async getPassengerById(@Param('id', ParseIntPipe) id: number) {
    return this.passengerService.getPassengerById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPassenger(@Body() dto: CreatePassengerDto) {
    return this.passengerService.createPassenger(dto);
  }

  @Put(':id')
  async updatePassenger(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePassengerDto
  ) {
    return this.passengerService.updatePassenger(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePassenger(@Param('id', ParseIntPipe) id: number) {
    return this.passengerService.deletePassenger(id);
  }

  // Admin endpoints
  @Get('admin/flight/:flightId')
  @UseGuards(AdminGuard)
  async adminGetPassengersByFlight(@Param('flightId', ParseIntPipe) flightId: number) {
    return this.passengerService.getPassengersByFlight(flightId);
  }

  @Post('admin')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.CREATED)
  async adminCreatePassenger(@Body() dto: CreatePassengerDto) {
    return this.passengerService.createPassenger(dto);
  }

  @Put('admin/:id')
  @UseGuards(AdminGuard)
  async adminUpdatePassenger(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePassengerDto
  ) {
    return this.passengerService.updatePassenger(id, dto);
  }

  @Delete('admin/:id')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async adminDeletePassenger(@Param('id', ParseIntPipe) id: number) {
    return this.passengerService.deletePassenger(id);
  }
}