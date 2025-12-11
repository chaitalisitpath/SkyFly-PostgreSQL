import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Patch
} from '@nestjs/common';
import { FlightService } from './flight.service';
import { CreateFlightDto, UpdateFlightDto } from './dto/flight.dto';
import { SearchFlightDto } from './dto/search-flight.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('flights')
export class FlightController {
  constructor(private readonly flightService: FlightService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllFlights() {
    return this.flightService.getAllFlights();
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  async searchFlights(@Query() searchDto: SearchFlightDto) {
    return this.flightService.searchFlights(searchDto);
  }

  @Get(':id/seats')
  @UseGuards(JwtAuthGuard)
  async getAvailableSeats(@Param('id', ParseIntPipe) id: number) {
    return this.flightService.getAvailableSeats(id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getFlightById(@Param('id', ParseIntPipe) id: number) {
    return this.flightService.getFlightById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.CREATED)
  async createFlight(@Body() dto: CreateFlightDto) {
    return this.flightService.createFlight(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateFlight(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFlightDto,
  ) {
    return this.flightService.updateFlight(id, dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateFlightStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string
  ) {
    return this.flightService.updateFlightStatus(id, status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFlight(@Param('id', ParseIntPipe) id: number) {
    return this.flightService.deleteFlight(id);
  }
}
