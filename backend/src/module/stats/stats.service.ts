import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    console.log('Fetching stats...');
    const [totalFlights, totalUsers, totalBookings, totalAircrafts] = await Promise.all([
      this.prisma.flight.count(),
      this.prisma.user.count({ where: { role: 'USER' } }),
      this.prisma.booking.count(),
      this.prisma.aircraft.count(),
    ]);

    const stats = {
      totalFlights,
      totalUsers,
      totalBookings,
      totalAircrafts,
    };
    console.log('Stats fetched:', stats);
    return stats;
  }
}