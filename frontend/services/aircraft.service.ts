import { api } from "@/lib/api";

export interface Aircraft {
  id: number;
  model: string;
  economySeatCount?: number;
  businessSeatCount?: number;
  firstSeatCount?: number;
  createdAt: string;
  updatedAt: string;
}

export const getAircraft = async (): Promise<Aircraft[]> => {
  const response = await api.get("/aircraft");
  return response.data;
};

export const getAircraftById = async (id: number): Promise<Aircraft> => {
  const response = await api.get(`/aircraft/${id}`);
  return response.data;
};

export const createAircraft = async (aircraftData: Omit<Aircraft, 'id' | 'createdAt' | 'updatedAt'>): Promise<Aircraft> => {
  const response = await api.post("/aircraft", aircraftData);
  return response.data;
};

export const updateAircraft = async (id: number, aircraftData: Partial<Omit<Aircraft, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Aircraft> => {
  const response = await api.put(`/aircraft/${id}`, aircraftData);
  return response.data;
};

export const deleteAircraft = async (id: number): Promise<void> => {
  await api.delete(`/aircraft/${id}`);
};

export interface SeatMap {
  economy: string[];
  business: string[];
  first: string[];
}

export const getSeatMap = async (id: number): Promise<SeatMap> => {
  const response = await api.get(`/aircraft/${id}/seatmap`);
  return response.data;
};