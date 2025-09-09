import React, { useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { LoadingSpinner } from '../ui/loading-spinner';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { initialize, isInitialized, isLoading } = useAuthStore();

  useEffect(() => {
    // Initialize auth system on app load
    initialize();

    // Listen for auth logout events
    const handleAuthLogout = () => {
      // Optional: Show notification or redirect
      console.log('User has been logged out');
    };

    window.addEventListener('auth:logout', handleAuthLogout);

    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }, [initialize]);

  // Show loading spinner while initializing auth
  // But ensure we don't show it indefinitely
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" variant="primary" />
          <p className="text-muted-foreground mobile:text-lg">
            Initializing Chess Academy...
          </p>
          <p className="text-xs text-muted-foreground/60 mt-2">
            This should only take a few seconds
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};