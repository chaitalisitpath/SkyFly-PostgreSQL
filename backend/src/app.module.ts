import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from './module/auth/auth.module';
import { AircraftModule } from './module/aircraft/aircraft.module';
import { FlightModule } from './module/flight/flight.module';
import { BookingModule } from './module/booking/booking.module';
import { GoogleAuthService } from './module/auth/google/google.service';

@Module({
  imports: [DatabaseModule, PrismaModule, AuthModule, AircraftModule, FlightModule, BookingModule],
  controllers: [],
  providers: [GoogleAuthService],
})
export class AppModule {}
