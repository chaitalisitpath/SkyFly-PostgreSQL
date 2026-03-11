import { api } from '@/lib/api';

export interface CreateReviewRequest {
  passengerId: number;
  flightId: number;
  stars: number;
  content: string;
}

export interface UpdateReviewRequest {
  stars?: number;
  content?: string;
}

export interface FlightReview {
  id: number;
  passengerId: number;
  flightId: number;
  stars: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  passenger: {
    id: number;
    name: string;
  };
  flight: {
    id: number;
    flightNumber: string;
    fromCity: string;
    toCity: string;
  };
}

export const createReview = async (data: CreateReviewRequest): Promise<FlightReview> => {
  const response = await api.post('/reviews', data);
  return response.data;
};

export const getMyReviews = async (): Promise<FlightReview[]> => {
  const response = await api.get('/reviews/my');
  return response.data;
};

export const getFlightReviews = async (flightId: number): Promise<FlightReview[]> => {
  const response = await api.get(`/reviews/flight/${flightId}`);
  return response.data;
};

export const updateReview = async (
  reviewId: number,
  data: UpdateReviewRequest,
): Promise<FlightReview> => {
  const response = await api.patch(`/reviews/${reviewId}`, data);
  return response.data;
};

export const deleteReview = async (reviewId: number): Promise<{ message: string }> => {
  const response = await api.delete(`/reviews/${reviewId}`);
  return response.data;
};
