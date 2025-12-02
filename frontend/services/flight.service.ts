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

export const createFlight = async (flightData: Omit<Flight, 'id' | 'availableSeats'>): Promise<Flight> => {
  const response = await api.post("/flights", flightData);
  return response.data;
};

export const updateFlight = async (id: number, flightData: Partial<Omit<Flight, 'id' | 'availableSeats'>>): Promise<Flight> => {
  const response = await api.put(`/flights/${id}`, flightData);
  return response.data;
};

export const deleteFlight = async (id: number): Promise<void> => {
  await api.delete(`/flights/${id}`);
};

