import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from './module/auth/auth.module';
import { FlightModule } from './module/flight/flight.module';

@Module({
  imports: [DatabaseModule, PrismaModule, AuthModule, FlightModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
