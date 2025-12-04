import { api } from '@/lib/api';

export interface Passenger {
  name: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
}

export interface CreateBookingRequest {
  flightId: number;
  passengers: Passenger[];
}

export interface Booking {
  id: number;
  userId: number;
  flightId: number;
  passengerCount: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  flight: {
    id: number;
    flightNumber: string;
    fromCity: string;
    toCity: string;
    departureTime: string;
    arrivalTime: string;
    price: number;
  };
  passengers: Passenger[];
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export const createBooking = async (bookingData: CreateBookingRequest): Promise<Booking> => {
  const response = await api.post('/booking', bookingData);
  return response.data;
};

export const getUserBookings = async (): Promise<Booking[]> => {
  const response = await api.get('/booking');
  return response.data;
};

export const getBookingById = async (id: number): Promise<Booking> => {
  const response = await api.get(`/booking/${id}`);
  return response.data;
};