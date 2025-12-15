import { api } from "@/lib/api";

export interface User{
    id: number;
    name: string;
    email: string;
    phone: string;
    dob: string;
}

export const updateUser = async (id: number, userData: Partial<{
    name: string;
    email: string;
    phone: string;
    dob: string;
}>): Promise<User> => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};