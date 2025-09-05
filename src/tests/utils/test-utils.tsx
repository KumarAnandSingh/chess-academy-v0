import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a custom render function that includes providers
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Mock data for tests
export const mockUser = {
  id: '1',
  email: 'test@example.com',
  displayName: 'Test User',
  profilePicture: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockChessPuzzle = {
  id: '1',
  title: 'Test Puzzle',
  description: 'A test tactical puzzle',
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  solution: ['e2e4', 'd7d5'],
  rating: 1200,
  tags: ['tactics', 'beginner'],
};

export const mockGameState = {
  totalXP: 1500,
  currentLevel: 3,
  xpForNextLevel: 500,
  xpInCurrentLevel: 250,
  lessonsCompleted: 5,
  puzzlesSolved: 12,
  currentStreak: 4,
  maxStreak: 7,
  totalTimeSpent: 180,
  achievements: [
    {
      id: 'first-lesson',
      title: 'First Steps',
      description: 'Complete your first lesson',
      icon: '🎓',
      type: 'lesson' as const,
      requirement: 1,
      unlocked: true,
      unlockedAt: new Date(),
    },
  ],
};

// Helper function to wait for animations
export const waitForAnimation = (duration = 600) =>
  new Promise(resolve => setTimeout(resolve, duration));

// Mock intersection observer entries
export const mockIntersectionObserverEntry = (
  target: Element,
  isIntersecting = true
): IntersectionObserverEntry => ({
  target,
  isIntersecting,
  intersectionRatio: isIntersecting ? 1 : 0,
  intersectionRect: {
    bottom: 0,
    height: 0,
    left: 0,
    right: 0,
    top: 0,
    width: 0,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  },
  boundingClientRect: {
    bottom: 0,
    height: 0,
    left: 0,
    right: 0,
    top: 0,
    width: 0,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  },
  rootBounds: null,
  time: Date.now(),
});

// Helper to create mock chess moves
export const createMockMove = (from: string, to: string, promotion?: string) => ({
  from,
  to,
  promotion,
});

// Helper to mock audio service calls
export const mockAudioService = {
  playSound: vi.fn(),
  playMoveSound: vi.fn(),
  playGameStateSound: vi.fn(),
  playUISound: vi.fn(),
  playGamificationSound: vi.fn(),
  playCelebration: vi.fn(),
  setEnabled: vi.fn(),
  setMasterVolume: vi.fn(),
  isEnabled: vi.fn(() => true),
  getMasterVolume: vi.fn(() => 0.7),
};

// Helper to simulate user interactions with delays
export const simulateUserAction = async (action: () => void, delay = 100) => {
  action();
  await new Promise(resolve => setTimeout(resolve, delay));
};