import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { LoadingSpinner } from '../ui/loading-spinner';
import { AuthModal } from './AuthModal';
import { motion } from 'framer-motion';
import { Shield, Lock } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
  adminOnly?: boolean;
  guestOnly?: boolean;
  featureName?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  redirectTo,
  fallback,
  adminOnly = false,
  guestOnly = false,
  featureName,
}) => {
  const { 
    isAuthenticated, 
    isLoading, 
    isInitialized, 
    user,
    deviceInfo 
  } = useAuthStore();
  const location = useLocation();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Store the current location for redirect after login
  useEffect(() => {
    if (!isAuthenticated && requireAuth) {
      sessionStorage.setItem('auth_return_to', location.pathname);
    }
  }, [isAuthenticated, requireAuth, location.pathname]);

  // Show loading while auth is being initialized
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" variant="primary" />
          <p className="text-muted-foreground mobile:text-lg">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Handle guest-only routes (like login/register pages)
  if (guestOnly && isAuthenticated) {
    const returnTo = sessionStorage.getItem('auth_return_to') || '/dashboard';
    sessionStorage.removeItem('auth_return_to');
    return <Navigate to={returnTo} replace />;
  }

  // Handle routes that don't require authentication
  if (!requireAuth) {
    return <>{children}</>;
  }

  // Handle admin-only routes
  if (adminOnly && isAuthenticated) {
    // In a real app, you'd check user.role or permissions
    const isAdmin = user?.email?.includes('admin') || false;
    
    if (!isAdmin) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "max-w-md mx-auto text-center p-6 bg-card rounded-lg shadow-mobile-card",
              "mobile:p-8"
            )}
          >
            <div className="mb-6">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2 mobile:text-3xl">
                Access Denied
              </h1>
              <p className="text-muted-foreground mobile:text-lg">
                You don't have permission to access this page.
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={() => window.history.back()}
                className={cn(
                  "w-full h-11 mobile:h-12",
                  "text-sm mobile:text-base"
                )}
              >
                Go Back
              </Button>
              <Button 
                variant="outline"
                onClick={() => <Navigate to="/dashboard" replace />}
                className={cn(
                  "w-full h-11 mobile:h-12",
                  "text-sm mobile:text-base"
                )}
              >
                Go to Dashboard
              </Button>
            </div>
          </motion.div>
        </div>
      );
    }
  }

  // Handle unauthenticated users
  if (!isAuthenticated) {
    // If a redirect path is specified, use it
    if (redirectTo) {
      return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    // Show custom fallback if provided
    if (fallback) {
      return <>{fallback}</>;
    }

    // Show authentication modal by default
    return (
      <>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "max-w-md mx-auto text-center p-6 bg-card rounded-lg shadow-mobile-card",
              "mobile:p-8"
            )}
          >
            <div className="mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2 mobile:text-3xl">
                Authentication Required
              </h1>
              <p className="text-muted-foreground mobile:text-lg">
                Please sign in to access this page and continue your chess journey.
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={() => setAuthModalOpen(true)}
                className={cn(
                  "w-full h-11 mobile:h-12",
                  "text-sm mobile:text-base"
                )}
              >
                Sign In
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = "/"}
                className={cn(
                  "w-full h-11 mobile:h-12",
                  "text-sm mobile:text-base"
                )}
              >
                Go to Home
              </Button>
            </div>

            {/* Device-specific messaging */}
            {deviceInfo.isMobile && (
              <div className="mt-4 p-3 bg-muted/50 rounded-md">
                <p className="text-xs text-muted-foreground">
                  Mobile tip: You can use touch gestures for chess moves after signing in
                </p>
              </div>
            )}
          </motion.div>
        </div>
        
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialMode="login"
        />
      </>
    );
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
};

// Specific route guards for common use cases - using regular components to avoid Fast Refresh issues
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute adminOnly>{children}</ProtectedRoute>;
}

export function GuestRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute requireAuth={false} guestOnly>{children}</ProtectedRoute>;
}

export function PublicRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute requireAuth={false}>{children}</ProtectedRoute>;
}