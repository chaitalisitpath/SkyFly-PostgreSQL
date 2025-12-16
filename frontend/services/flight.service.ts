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
  aircraftId: number;
  aircraft?: {
    id: number;
    model: string;
    economySeatCount?: number | null;
    businessSeatCount?: number | null;
    firstSeatCount?: number | null;
  };
  economyPrice?: number;
  businessPrice?: number;
  firstPrice?: number;
  status: string;
  passengers?: {
    id: number;
    name: string;
    seatNumber: string;
    seatClass: string;
  }[];
}

export const getFlights = async (): Promise<Flight[]> => {
  const response = await api.get("/flights");
  return response.data;
};

export const getFlightById = async (id: number): Promise<Flight> => {
  const response = await api.get(`/flights/${id}`);
  return response.data;
};

export const createFlight = async (flightData: {
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  fromCity: string;
  toCity: string;
  departureTime: string;
  arrivalTime: string;
  departureAirportTerminal: number;
  arrivalAirportTerminal: number;
  aircraftId: number;
  economyPrice?: number;
  businessPrice?: number;
  firstPrice?: number;
  status?: string;
}): Promise<Flight> => {
  const response = await api.post("/flights", flightData);
  return response.data;
};

export const updateFlight = async (id: number, flightData: Partial<{
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  fromCity: string;
  toCity: string;
  departureTime: string;
  arrivalTime: string;
  departureAirportTerminal: number;
  arrivalAirportTerminal: number;
  aircraftId: number;
  economyPrice?: number;
  businessPrice?: number;
  firstPrice?: number;
  status?: string;
}>): Promise<Flight> => {
  const response = await api.put(`/flights/${id}`, flightData);
  return response.data;
};

export const deleteFlight = async (id: number): Promise<void> => {
  await api.delete(`/flights/${id}`);
};

export interface SearchFlightsParams {
  fromCity?: string;
  toCity?: string;
  departureTime?: string;
  arrivalTime?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  flightNumber?: string;
  departureTimeFrom?: string;
  departureTimeTo?: string;
  arrivalTimeFrom?: string;
  arrivalTimeTo?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  aircraftId?: number;
}

export interface SearchFlightsResponse {
  data: Flight[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const searchFlights = async (params: SearchFlightsParams): Promise<Flight[]> => {
  const queryParams = new URLSearchParams();
  if (params.fromCity) queryParams.append('fromCity', params.fromCity);
  if (params.toCity) queryParams.append('toCity', params.toCity);
  if (params.departureTime) queryParams.append('departureTime', params.departureTime);
  if (params.arrivalTime) queryParams.append('arrivalTime', params.arrivalTime);

  const response = await api.get(`/flights/search?${queryParams.toString()}`);
  return response.data;
};

export const searchFlightsAdmin = async (params: SearchFlightsParams): Promise<SearchFlightsResponse> => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString());
    }
  });

  console.log('Frontend searchFlightsAdmin called with params:', Object.fromEntries(queryParams));
  const response = await api.get(`/flights/search?${queryParams.toString()}`);
  console.log('Frontend searchFlightsAdmin response:', response.data);
  return response.data;
};

