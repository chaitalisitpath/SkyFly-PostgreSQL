import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [DatabaseModule, PrismaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
