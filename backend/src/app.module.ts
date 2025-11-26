import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from './module/auth/auth.module';

@Module({
  imports: [DatabaseModule, PrismaModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
