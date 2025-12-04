import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, hasRole } from '@/lib/auth';

export const useRoleAccess = (requiredRole: 'ADMIN' | 'USER') => {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    // Check if user has the required role
    if (!hasRole(requiredRole)) {
      // Redirect to appropriate dashboard based on actual role
      const userRole = localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user')!).role
        : null;

      if (userRole === 'ADMIN') {
        router.push('/admin/dashboard');
      } else if (userRole === 'USER') {
        router.push('/user/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [router, requiredRole]);
};