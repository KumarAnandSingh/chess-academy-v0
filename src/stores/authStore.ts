import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient, type User, type RegisterData, type LoginData } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  register: (data: RegisterData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  loginDemo: () => void;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User, token: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.register(data);
          if (response.success && response.data) {
            const { user, accessToken } = response.data;
            set({
              user,
              token: accessToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          }
        } catch (error) {
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
            const { user, accessToken } = response.data;
            set({
              user,
              token: accessToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login failed',
          });
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
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await apiClient.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      refreshToken: async () => {
        try {
          const response = await apiClient.refreshToken();
          if (response.success && response.data) {
            const { accessToken } = response.data;
            set({ token: accessToken });
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          get().logout();
        }
      },

      checkAuth: async () => {
        const { token } = get();
        if (!token) return;

        set({ isLoading: true });
        try {
          const response = await apiClient.getProfile();
          if (response.success && response.data) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      setUser: (user: User, token: string) =>
        set({
          user,
          token,
          isAuthenticated: true,
          error: null,
        }),

      setLoading: (loading: boolean) =>
        set({ isLoading: loading }),

      setError: (error: string | null) =>
        set({ error }),

      clearError: () =>
        set({ error: null }),
    }),
    {
      name: 'chess-academy-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);