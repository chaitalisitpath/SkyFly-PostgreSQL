import { api } from "@/lib/api";

export const loginUser = async (email: string, password: string) => {
  const response = await api.post("/auth/login", {
    email,
    password,
  });
  return response.data;
};
export const registerUser = async (name: string, email: string, password: string, phone: string, dob: string) => {
  const response = await api.post("/auth/register", {
    name,
    email,
    password,
    phone,
    dob
  });
  return response.data;
};

export const googleLogin = async (token: string) => {
  const response = await api.post("/auth/google-login", {
    token,
  });
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
