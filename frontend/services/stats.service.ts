import { api } from "@/lib/api";

export interface Stats {
  totalFlights: number;
  totalUsers: number;
  totalBookings: number;
  totalAircrafts: number;
}

export const getStats = async (): Promise<Stats> => {
  const response = await api.get("/stats");
  return response.data;
};