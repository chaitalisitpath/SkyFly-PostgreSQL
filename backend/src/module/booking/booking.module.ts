import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { PassengerService } from './passenger.service';
import { PassengerController } from './passenger.controller';
import { PrismaModule } from '../../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, AuthModule, MailModule],
  providers: [BookingService, PassengerService],
  controllers: [BookingController, PassengerController],
  exports: [BookingService, PassengerService]
})
export class BookingModule {}
