import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export type TrendRange = 'week' | 'lastWeek' | 'all';

export interface BookingsTrendResponse {
  range: TrendRange;
  labels: string[];
  values: number[];
  summary: {
    total: number;
    average: number;
    peak: number;
  };
}

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  private readonly dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  private getStartOfUtcDay(date: Date): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  }

  private addDaysUtc(date: Date, days: number): Date {
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
  }

  private getStartOfUtcWeekMonday(date: Date): Date {
    const startOfDay = this.getStartOfUtcDay(date);
    const day = startOfDay.getUTCDay(); // 0=Sun, 1=Mon, ...
    const diffToMonday = day === 0 ? -6 : 1 - day;
    return this.addDaysUtc(startOfDay, diffToMonday);
  }

  private buildSummary(values: number[]) {
    const total = values.reduce((sum, value) => sum + value, 0);
    const average = values.length ? Math.round(total / values.length) : 0;
    const peak = values.length ? Math.max(...values) : 0;

    return { total, average, peak };
  }

  async getBookingsTrend(rangeParam?: string): Promise<BookingsTrendResponse> {
    const range = (rangeParam ?? 'week') as TrendRange;

    if (!['week', 'lastWeek', 'all'].includes(range)) {
      throw new BadRequestException('range must be one of week, lastWeek, all');
    }

    if (range === 'all') {
      return this.getCurrentMonthTrend();
    }

    return this.getWeeklyTrend(range);
  }

  private async getWeeklyTrend(range: 'week' | 'lastWeek'): Promise<BookingsTrendResponse> {
    const now = new Date();
    const thisWeekStart = this.getStartOfUtcWeekMonday(now);
    const weekStart = range === 'week' ? thisWeekStart : this.addDaysUtc(thisWeekStart, -7);
    const weekEnd = this.addDaysUtc(weekStart, 7);

    const bookings = await this.prisma.booking.findMany({
      where: {
        createdAt: {
          gte: weekStart,
          lt: weekEnd,
        },
      },
      select: {
        createdAt: true,
      },
    });

    const values = new Array(7).fill(0);

    bookings.forEach((booking) => {
      const bookingDayStart = this.getStartOfUtcDay(booking.createdAt);
      const dayIndex = Math.floor((bookingDayStart.getTime() - weekStart.getTime()) / (24 * 60 * 60 * 1000));
      if (dayIndex >= 0 && dayIndex < 7) {
        values[dayIndex] += 1;
      }
    });

    return {
      range,
      labels: this.dayLabels,
      values,
      summary: this.buildSummary(values),
    };
  }

  private async getCurrentMonthTrend(): Promise<BookingsTrendResponse> {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();

    const monthStart = new Date(Date.UTC(year, month, 1));
    const nextMonthStart = new Date(Date.UTC(year, month + 1, 1));
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const weeksInMonth = Math.ceil(daysInMonth / 7);

    const bookings = await this.prisma.booking.findMany({
      where: {
        createdAt: {
          gte: monthStart,
          lt: nextMonthStart,
        },
      },
      select: {
        createdAt: true,
      },
    });

    const values = new Array(weeksInMonth).fill(0);
    const labels = values.map((_, index) => `Week ${index + 1}`);

    bookings.forEach((booking) => {
      const dayOfMonth = booking.createdAt.getUTCDate();
      const weekIndex = Math.floor((dayOfMonth - 1) / 7);
      if (weekIndex >= 0 && weekIndex < values.length) {
        values[weekIndex] += 1;
      }
    });

    return {
      range: 'all',
      labels,
      values,
      summary: this.buildSummary(values),
    };
  }

  async getStats() {
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
    return stats;
  }
}