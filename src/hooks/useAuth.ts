import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import type { LoginData, RegisterData, User } from '../services/api';

interface UseAuthReturn {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  deviceInfo: {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    isTouchDevice: boolean;
  };

  // Actions
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginDemo: () => void;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  deleteAccount: () => Promise<void>;
  clearError: () => void;
  refreshToken: () => Promise<boolean>;

  // Modal controls
  openLogin: () => void;
  openRegister: () => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;

  // Utilities
  requireAuth: (callback?: () => void) => boolean;
  hasPermission: (permission: string) => boolean;
  getUserInitials: () => string;
  getDisplayName: () => string;
}

/**
 * Custom hook for authentication management
 * Provides a convenient interface for all auth-related operations
 */
export const useAuth = (): UseAuthReturn => {
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    error,
    deviceInfo,
    login: authLogin,
    register: authRegister,
    loginWithGoogle: authLoginWithGoogle,
    loginDemo: authLoginDemo,
    logout: authLogout,
    updateUserProfile,
    deleteAccount: authDeleteAccount,
    clearError: authClearError,
    refreshTokenAction,
  } = useAuthStore();

  // Modal control functions
  const openLogin = useCallback(() => setIsAuthModalOpen(true), []);
  const openRegister = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  // Enhanced login with navigation
  const login = useCallback(async (data: LoginData) => {
    try {
      await authLogin(data);
      
      // Navigate to return URL or dashboard after successful login
      const returnTo = sessionStorage.getItem('auth_return_to') || '/dashboard';
      sessionStorage.removeItem('auth_return_to');
      navigate(returnTo);
    } catch (error) {
      // Error is handled by the auth store
      throw error;
    }
  }, [authLogin, navigate]);

  // Enhanced register with navigation
  const register = useCallback(async (data: RegisterData) => {
    try {
      await authRegister(data);
      
      // Navigate to dashboard after successful registration
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the auth store
      throw error;
    }
  }, [authRegister, navigate]);

  // Enhanced Google login with navigation
  const loginWithGoogle = useCallback(async () => {
    try {
      await authLoginWithGoogle();
    } catch (error) {
      // Error is handled by the auth store
      throw error;
    }
  }, [authLoginWithGoogle]);

  // Enhanced logout with navigation
  const logout = useCallback(async () => {
    try {
      await authLogout();
      
      // Navigate to home after logout
      navigate('/');
    } catch (error) {
      // Error is handled by the auth store
      throw error;
    }
  }, [authLogout, navigate]);

  // Enhanced profile update
  const updateProfile = useCallback(async (updates: Partial<User>) => {
    try {
      await updateUserProfile(updates);
    } catch (error) {
      throw error;
    }
  }, [updateUserProfile]);

  // Enhanced account deletion with navigation
  const deleteAccount = useCallback(async () => {
    try {
      await authDeleteAccount();
      navigate('/');
    } catch (error) {
      throw error;
    }
  }, [authDeleteAccount, navigate]);

  // Utility to require authentication for actions
  const requireAuth = useCallback((callback?: () => void): boolean => {
    if (!isAuthenticated) {
      // Store current location for redirect after login
      sessionStorage.setItem('auth_return_to', window.location.pathname);
      openLogin();
      return false;
    }
    
    // Execute callback if provided
    callback?.();
    return true;
  }, [isAuthenticated, openLogin]);

  // Permission checking utility
  const hasPermission = useCallback((permission: string): boolean => {
    if (!isAuthenticated || !user) return false;
    
    // In a real app, you'd check user.permissions or roles
    // For now, we'll do simple checks based on user properties
    switch (permission) {
      case 'admin':
        return user.email?.includes('admin') || false;
      case 'premium':
        // Check if user has premium subscription
        return user.preferences?.isPremium || false;
      case 'user':
        return isAuthenticated;
      default:
        return false;
    }
  }, [isAuthenticated, user]);

  // Get user initials for avatar
  const getUserInitials = useCallback((): string => {
    if (!user) return 'G'; // Guest
    
    const displayName = user.displayName || user.username || user.email || '';
    const names = displayName.split(' ');
    
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    
    return displayName.slice(0, 2).toUpperCase();
  }, [user]);

  // Get display name with fallback
  const getDisplayName = useCallback((): string => {
    if (!user) return 'Guest';
    
    return user.displayName || user.username || user.email || 'User';
  }, [user]);

  // Auto-refresh token when it's about to expire
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      // Refresh token every 45 minutes (assuming 1-hour token expiry)
      refreshTokenAction();
    }, 45 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshTokenAction]);

  // Handle window focus to check auth status
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleFocus = () => {
      // Check auth status when window regains focus
      refreshTokenAction();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isAuthenticated, refreshTokenAction]);

  // Handle online/offline status
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleOnline = () => {
      // Refresh token when coming back online
      refreshTokenAction();
    };

    const handleOffline = () => {
      console.log('App is offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isAuthenticated, refreshTokenAction]);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    error,
    deviceInfo,

    // Actions
    login,
    register,
    loginWithGoogle,
    loginDemo: authLoginDemo,
    logout,
    updateProfile,
    deleteAccount,
    clearError: authClearError,
    refreshToken: refreshTokenAction,

    // Modal controls
    openLogin,
    openRegister,
    closeAuthModal,
    isAuthModalOpen,

    // Utilities
    requireAuth,
    hasPermission,
    getUserInitials,
    getDisplayName,
  };
};

export default useAuth;