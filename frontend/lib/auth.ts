"use client";
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
}

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;

  const userStr = localStorage.getItem('user');
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const getCurrentUserRole = (): 'ADMIN' | 'USER' | null => {
  const user = getCurrentUser();
  return user?.role || null;
};

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
};

export const hasRole = (role: 'ADMIN' | 'USER'): boolean => {
  const userRole = getCurrentUserRole();
  return userRole === role;
};

export const isAdmin = (): boolean => {
  return hasRole('ADMIN');
};

export const isUser = (): boolean => {
  return hasRole('USER');
};