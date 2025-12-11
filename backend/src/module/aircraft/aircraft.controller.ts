import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { AircraftService } from './aircraft.service';
import { CreateAircraftDto, UpdateAircraftDto } from './dto/aircraft.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('aircraft')
export class AircraftController {
  constructor(private readonly aircraftService: AircraftService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllAircraft() {
    return this.aircraftService.getAllAircraft();
  }

  @Get('models')
  @UseGuards(JwtAuthGuard)
  async getAircraftModels() {
    return this.aircraftService.getAircraftModels();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getAircraftById(@Param('id', ParseIntPipe) id: number) {
    return this.aircraftService.getAircraftById(id);
  }

  @Get(':id/seatmap')
  @UseGuards(JwtAuthGuard)
  async getSeatMap(@Param('id', ParseIntPipe) id: number) {
    return this.aircraftService.getSeatMap(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.CREATED)
  async createAircraft(@Body() dto: CreateAircraftDto) {
    return this.aircraftService.createAircraft(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateAircraft(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAircraftDto
  ) {
    return this.aircraftService.updateAircraft(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAircraft(@Param('id', ParseIntPipe) id: number) {
    return this.aircraftService.deleteAircraft(id);
  }
}
