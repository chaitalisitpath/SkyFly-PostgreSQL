import { api } from "@/lib/api";

export interface Flight {
  id: number;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  fromCity: string;
  toCity: string;
  departureTime: string;
  arrivalTime: string;
  totalSeats: number;
  departureAirportTerminal: number;
  arrivalAirportTerminal: number;
  availableSeats: number;
  price: number;
  status: string;
}

export const getFlights = async (): Promise<Flight[]> => {
  const response = await api.get("/flights");
  return response.data;
};
