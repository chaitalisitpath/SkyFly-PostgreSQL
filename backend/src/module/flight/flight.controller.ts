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
} from '@nestjs/common';
import { FlightService } from './flight.service';
import { CreateFlightDto } from './dto/flight.dto';
import { SearchFlightDto } from './dto/search-flight.dto';

@Controller('flights')
export class FlightController {
  constructor(private readonly flightService: FlightService) {}

  @Get()
  getAll() {
    return this.flightService.getAllFlights();
  }

  @Get('search')
  search(@Query() searchDto: SearchFlightDto) {
    return this.flightService.searchFlights(searchDto);
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.flightService.getFlightById(id);
  }

  @Post()
  create(@Body() dto: CreateFlightDto) {
    return this.flightService.createFlight(dto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateFlightDto>,
  ) {
    return this.flightService.updateFlight(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.flightService.deleteFlight(id);
  }
}
