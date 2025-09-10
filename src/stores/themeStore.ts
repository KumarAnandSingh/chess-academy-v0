import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark', // Default to dark theme
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });
        // Apply theme to document
        document.documentElement.setAttribute('data-theme', newTheme);
      },
      setTheme: (theme: Theme) => {
        set({ theme });
        document.documentElement.setAttribute('data-theme', theme);
      },
    }),
    {
      name: 'chess-academy-theme',
      onRehydrateStorage: () => (state) => {
        // Apply theme on app load
        if (state) {
          document.documentElement.setAttribute('data-theme', state.theme);
        }
      }
    }
  )
);