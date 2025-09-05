import React, { useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { loginDemo, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Auto-login as demo user if not already authenticated
    if (!isAuthenticated) {
      loginDemo();
    }
  }, [loginDemo, isAuthenticated]);

  return <>{children}</>;
};