import { api } from '@/lib/api';

export interface Passenger {
  name: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  seatClass?: 'ECONOMY' | 'BUSINESS' | 'FIRST';
  seatNumber?: string;
}

export interface CreateBookingRequest {
  flightId: number;
  passengerCount: number;
  passengers: Passenger[];
  totalAmount?: number;
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
    aircraft?: {
      id: number;
      model: string;
    };
    economyPrice?: number;
    businessPrice?: number;
    firstPrice?: number;
  };
  passengers: Passenger[];
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export const createBooking = async (bookingData: CreateBookingRequest): Promise<Booking> => {
  const response = await api.post('/bookings', bookingData);
  return response.data;
};

export const getUserBookings = async (): Promise<Booking[]> => {
  const response = await api.get('/bookings');
  return response.data;
};

export const getBookingById = async (id: number): Promise<Booking> => {
  const response = await api.get(`/bookings/${id}`);
  return response.data;
};

export const getAllBookings = async (): Promise<Booking[]> => {
  const response = await api.get('/bookings/admin/all');
  return response.data;
};

export const updateBookingStatus = async (id: number, status: 'CONFIRMED' | 'REJECTED'): Promise<Booking> => {
  const response = await api.put(`/bookings/admin/${id}/status`, { status });
  return response.data;
};

export const deleteBooking = async (id: number): Promise<void> => {
  await api.delete(`/bookings/${id}`);
};