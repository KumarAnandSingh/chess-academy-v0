import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { apiClient, type User, type RegisterData, type LoginData } from '../services/api';
import { analytics } from '../services/analytics';
import type { AuthMethod, DifficultyLevel } from '../services/analytics';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  lastAuthCheck: number | null;
  deviceInfo: {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    isTouchDevice: boolean;
  };
}

interface AuthActions {
  register: (data: RegisterData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  handleGoogleCallback: (code: string, state?: string) => Promise<void>;
  loginDemo: () => void;
  logout: () => Promise<void>;
  refreshTokenAction: () => Promise<boolean>;
  checkAuth: () => Promise<void>;
  initialize: () => Promise<void>;
  setUser: (user: User, token: string, refreshToken?: string) => void;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  deleteAccount: () => Promise<void>;
  updateDeviceInfo: () => void;
  getDeviceType: () => 'mobile' | 'tablet' | 'desktop';
}

// Device detection utility
const getDeviceInfo = () => {
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const userAgent = navigator.userAgent.toLowerCase();
  const screenWidth = window.innerWidth;
  
  return {
    isMobile: screenWidth < 768,
    isTablet: screenWidth >= 768 && screenWidth < 1024,
    isDesktop: screenWidth >= 1024,
    isTouchDevice,
  };
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,
      lastAuthCheck: null,
      deviceInfo: {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isTouchDevice: false,
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.register(data);
          if (response.success && response.data) {
            const { user, accessToken, refreshToken } = response.data;
            get().setUser(user, accessToken, refreshToken);
            
            // Track successful registration
            const deviceType = get().getDeviceType();
            analytics.trackSignUp({
              method: 'email' as AuthMethod,
              device_type: deviceType,
              chess_experience: 'beginner' as DifficultyLevel, // Default for new users
              referrer: document.referrer || undefined,
            });
          }
        } catch (error) {
          // Track registration error
          analytics.trackError('registration_failed', error instanceof Error ? error.message : 'Registration failed');
          
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Registration failed',
          });
          throw error;
        }
      },

      login: async (data: LoginData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.login(data);
          if (response.success && response.data) {
            const { user, accessToken, refreshToken } = response.data;
            get().setUser(user, accessToken, refreshToken);
            
            // Track successful login
            const deviceType = get().getDeviceType();
            const lastAuthCheck = get().lastAuthCheck;
            const timeSinceLastLogin = lastAuthCheck ? 
              Math.floor((Date.now() - lastAuthCheck) / (1000 * 60 * 60 * 24)) : undefined;
            
            analytics.trackLogin({
              method: 'email' as AuthMethod,
              device_type: deviceType,
              time_since_last_login: timeSinceLastLogin,
            });
          }
        } catch (error) {
          // Track login error
          analytics.trackError('login_failed', error instanceof Error ? error.message : 'Login failed');
          
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login failed',
          });
          throw error;
        }
      },

      loginWithGoogle: async () => {
        set({ isLoading: true, error: null });
        try {
          // Store where to return after successful auth
          sessionStorage.setItem('auth_return_to', window.location.pathname);
          
          // Generate state parameter for CSRF protection  
          const state = crypto.randomUUID();
          sessionStorage.setItem('oauth_state', state);
          
          // Redirect directly to backend OAuth endpoint (backend handles redirect_uri)
          const params = new URLSearchParams({ state });
          window.location.href = `/api/auth/google?${params.toString()}`;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Google login failed',
          });
          throw error;
        }
      },

      handleGoogleCallback: async (code: string, state?: string) => {
        set({ isLoading: true, error: null });
        try {
          // Verify state parameter
          const storedState = sessionStorage.getItem('oauth_state');
          if (state && storedState && state !== storedState) {
            throw new Error('Invalid state parameter');
          }
          
          const response = await apiClient.handleGoogleCallback(code);
          if (response.success && response.data) {
            const { user, accessToken, refreshToken } = response.data;
            get().setUser(user, accessToken, refreshToken);
            sessionStorage.removeItem('oauth_state');
            
            // Track successful Google login/signup
            const deviceType = get().getDeviceType();
            const isNewUser = response.data.isNewUser; // Assuming API returns this flag
            
            if (isNewUser) {
              analytics.trackSignUp({
                method: 'google' as AuthMethod,
                device_type: deviceType,
                chess_experience: 'beginner' as DifficultyLevel,
                referrer: document.referrer || undefined,
              });
            } else {
              analytics.trackLogin({
                method: 'google' as AuthMethod,
                device_type: deviceType,
              });
            }
          }
        } catch (error) {
          // Track Google auth error
          analytics.trackError('google_auth_failed', error instanceof Error ? error.message : 'Google authentication failed');
          
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Google authentication failed',
          });
          sessionStorage.removeItem('oauth_state');
          throw error;
        }
      },

      loginDemo: () => {
        const demoUser: User = {
          id: 'demo-user-123',
          email: 'demo@chesslacademy.com',
          username: 'demo_player',
          displayName: 'Demo Player',
          createdAt: new Date().toISOString(),
        };
        
        set({
          user: demoUser,
          token: 'demo-token-123',
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        // Track demo login
        const deviceType = get().getDeviceType();
        analytics.trackLogin({
          method: 'demo' as AuthMethod,
          device_type: deviceType,
        });
      },

      logout: async () => {
        // Don't show loading for logout - makes it feel faster
        try {
          // Track logout before clearing data
          analytics.trackLogout();
          
          // Clear data immediately for better UX
          Cookies.remove('refreshToken');
          sessionStorage.removeItem('oauth_state');
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            lastAuthCheck: null,
          });
          
          // Send logout request in background (non-blocking)
          apiClient.logout().catch(error => {
            console.error('Background logout error:', error);
          });
        } catch (error) {
          console.error('Logout error:', error);
          // Still clear data even if logout fails
          Cookies.remove('refreshToken');
          sessionStorage.removeItem('oauth_state');
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            lastAuthCheck: null,
          });
        }
      },

      refreshTokenAction: async (): Promise<boolean> => {
        const { refreshToken } = get();
        if (!refreshToken) {
          return false;
        }

        // Add timeout for token refresh
        const refreshWithTimeout = () => {
          return Promise.race([
            apiClient.refreshToken(),
            new Promise<never>((_, reject) => {
              setTimeout(() => {
                reject(new Error('Token refresh timeout - API unavailable'));
              }, 5000); // 5 second timeout
            })
          ]);
        };

        try {
          const response = await refreshWithTimeout();
          if (response.success && response.data) {
            const { accessToken, refreshToken: newRefreshToken } = response.data;
            get().setTokens(accessToken, newRefreshToken);
            return true;
          }
        } catch (error) {
          console.warn('Token refresh failed (API unavailable):', error);
          // Don't call logout here - let the caller handle it
          // This prevents clearing tokens when API is just temporarily down
        }
        return false;
      },

      checkAuth: async () => {
        const { token, lastAuthCheck, isAuthenticated } = get();
        
        // Skip check if recently checked (within 5 minutes)
        const now = Date.now();
        if (lastAuthCheck && now - lastAuthCheck < 5 * 60 * 1000 && isAuthenticated) {
          set({ isInitialized: true });
          return;
        }

        if (!token) {
          set({ isInitialized: true, isLoading: false });
          return;
        }

        set({ isLoading: true });
        
        // Add timeout wrapper for API calls
        const checkAuthWithTimeout = () => {
          return Promise.race([
            apiClient.getProfile(),
            new Promise<never>((_, reject) => {
              setTimeout(() => {
                reject(new Error('Auth check timeout - API unavailable'));
              }, 5000); // 5 second timeout
            })
          ]);
        };

        try {
          const response = await checkAuthWithTimeout();
          if (response.success && response.data) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
              isInitialized: true,
              error: null,
              lastAuthCheck: now,
            });
            return;
          }
        } catch (error) {
          console.warn('Auth check failed (API unavailable):', error);
          
          // For production: If API is unavailable, still initialize the app
          // Users can use the app in demo/offline mode
          if (token) {
            // Try to refresh token with timeout
            try {
              const refreshPromise = Promise.race([
                get().refreshTokenAction(),
                new Promise<boolean>((resolve) => {
                  setTimeout(() => resolve(false), 3000); // 3 second timeout for refresh
                })
              ]);
              
              const refreshed = await refreshPromise;
              if (!refreshed) {
                // Clear invalid tokens but still initialize
                set({
                  user: null,
                  token: null,
                  refreshToken: null,
                  isAuthenticated: false,
                  isLoading: false,
                  isInitialized: true,
                  error: null,
                  lastAuthCheck: null,
                });
              }
            } catch (refreshError) {
              console.warn('Token refresh also failed:', refreshError);
              // Clear tokens and initialize anyway
              set({
                user: null,
                token: null,
                refreshToken: null,
                isAuthenticated: false,
                isLoading: false,
                isInitialized: true,
                error: null,
                lastAuthCheck: null,
              });
            }
          } else {
            // No token, just initialize
            set({
              isLoading: false,
              isInitialized: true,
              error: null,
            });
          }
        }
      },

      initialize: async () => {
        // Always update device info first
        get().updateDeviceInfo();
        
        // Add a safety timeout for the entire initialization process
        const initializationTimeout = new Promise<void>((resolve) => {
          setTimeout(() => {
            console.warn('Authentication initialization timeout - forcing app start');
            const state = get();
            if (!state.isInitialized) {
              set({
                isInitialized: true,
                isLoading: false,
                error: null,
              });
            }
            resolve();
          }, 10000); // 10 second maximum timeout for entire initialization
        });

        // Race between normal auth check and timeout
        try {
          await Promise.race([
            get().checkAuth(),
            initializationTimeout
          ]);
        } catch (error) {
          console.error('Initialization error:', error);
          // Force initialization even on error
          set({
            isInitialized: true,
            isLoading: false,
            error: null,
          });
        }
        
        // Double-check initialization completed
        if (!get().isInitialized) {
          console.warn('Force completing initialization');
          set({
            isInitialized: true,
            isLoading: false,
            error: null,
          });
        }
      },

      setUser: (user: User, token: string, refreshToken?: string) => {
        // Store refresh token in secure cookie
        if (refreshToken) {
          Cookies.set('refreshToken', refreshToken, { 
            httpOnly: false, // Note: In production, this should be httpOnly: true on backend
            secure: window.location.protocol === 'https:',
            sameSite: 'lax',
            expires: 7 // 7 days
          });
        }
        
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          lastAuthCheck: Date.now(),
        });
      },

      setTokens: (accessToken: string, refreshToken?: string) => {
        if (refreshToken) {
          Cookies.set('refreshToken', refreshToken, { 
            httpOnly: false,
            secure: window.location.protocol === 'https:',
            sameSite: 'lax',
            expires: 7
          });
        }
        
        set({
          token: accessToken,
          refreshToken,
          lastAuthCheck: Date.now(),
        });
      },

      setLoading: (loading: boolean) =>
        set({ isLoading: loading }),

      setError: (error: string | null) =>
        set({ error }),

      clearError: () =>
        set({ error: null }),

      updateUserProfile: async (updates: Partial<User>) => {
        const { user } = get();
        if (!user) throw new Error('No user logged in');

        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.updateUserProfile(updates);
          if (response.success && response.data) {
            set({
              user: response.data.user,
              isLoading: false,
              error: null,
            });
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Profile update failed',
          });
          throw error;
        }
      },

      deleteAccount: async () => {
        set({ isLoading: true, error: null });
        try {
          await apiClient.deleteAccount();
          get().logout();
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Account deletion failed',
          });
          throw error;
        }
      },

      updateDeviceInfo: () => {
        const deviceInfo = getDeviceInfo();
        set({ deviceInfo });
      },

      getDeviceType: () => {
        const { deviceInfo } = get();
        return deviceInfo.isMobile ? 'mobile' : 
               deviceInfo.isTablet ? 'tablet' : 'desktop';
      },
    }),
    {
      name: 'chess-academy-auth',
      version: 2, // Increment for breaking changes
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        lastAuthCheck: state.lastAuthCheck,
        deviceInfo: state.deviceInfo,
      }),
      // Migrate old auth state
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          return {
            ...persistedState,
            refreshToken: null,
            isInitialized: false,
            lastAuthCheck: null,
            deviceInfo: getDeviceInfo(),
          };
        }
        return persistedState as AuthState & AuthActions;
      },
    }
  )
);