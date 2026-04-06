import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getStats() {
    return this.statsService.getStats();
  }

  @Get('bookings-trend')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getBookingsTrend(@Query('range') range?: string) {
    return this.statsService.getBookingsTrend(range);
  }
}