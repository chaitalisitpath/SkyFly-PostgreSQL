import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from './module/auth/auth.module';
import { AircraftModule } from './module/aircraft/aircraft.module';
import { FlightModule } from './module/flight/flight.module';
import { BookingModule } from './module/booking/booking.module';
import { GoogleAuthService } from './module/auth/google/google.service';
import { MailModule } from './module/mail/mail.module';
import { UsersModule } from './module/users/users.module';

@Module({
  imports: [PrismaModule, AuthModule, AircraftModule, FlightModule, BookingModule, MailModule, UsersModule],
  controllers: [],
  providers: [GoogleAuthService],
})
export class AppModule {}
