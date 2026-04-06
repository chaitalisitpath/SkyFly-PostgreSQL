import { api } from "@/lib/api";

export interface Stats {
  totalFlights: number;
  totalUsers: number;
  totalBookings: number;
  totalAircrafts: number;
}

export type BookingTrendRange = 'week' | 'lastWeek' | 'all';

export interface BookingsTrend {
  range: BookingTrendRange;
  labels: string[];
  values: number[];
  summary: {
    total: number;
    average: number;
    peak: number;
  };
}

export const getStats = async (): Promise<Stats> => {
  const response = await api.get("/stats");
  return response.data;
};

export const getBookingsTrend = async (range: BookingTrendRange): Promise<BookingsTrend> => {
  const response = await api.get('/stats/bookings-trend', {
    params: { range },
  });
  return response.data;
};