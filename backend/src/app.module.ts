import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from './module/auth/auth.module';
import { AircraftModule } from './module/aircraft/aircraft.module';
import { FlightModule } from './module/flight/flight.module';
import { BookingModule } from './module/booking/booking.module';
import { GoogleAuthService } from './module/auth/google/google.service';
import { MailModule } from './module/mail/mail.module';
import { UsersModule } from './module/users/users.module';
import { StatsModule } from './module/stats/stats.module';
import { PdfController } from './module/pdf/pdf.controller';
import { PdfModule } from './module/pdf/pdf.module';
import { ReviewModule } from './module/review/review.module';

@Module({
  imports: [PrismaModule, AuthModule, AircraftModule, FlightModule, BookingModule, MailModule, UsersModule, StatsModule, PdfModule, ReviewModule],
  controllers: [],
  providers: [GoogleAuthService],
})
export class AppModule {}
