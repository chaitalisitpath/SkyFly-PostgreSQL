import { Module } from '@nestjs/common';
import { FlightService } from './flight.service';
import { FlightController } from './flight.controller';
import { PrismaModule } from '../../../prisma/prisma.module';
import { AircraftModule } from '../aircraft/aircraft.module';

@Module({
  imports: [PrismaModule, AircraftModule],
  providers: [FlightService],
  controllers: [FlightController],
  exports: [FlightService]
})
export class FlightModule {}
