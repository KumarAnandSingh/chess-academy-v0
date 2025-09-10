import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../services/api';
import { analytics } from '../services/analytics';
import type { GameMode, GameResult, DifficultyLevel } from '../services/analytics';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  currentProgress: number;
  unlocked: boolean;
  unlockedAt?: Date;
  category: 'lessons' | 'puzzles' | 'games' | 'streaks' | 'special' | 'mobile';
}

interface UserStats {
  rating: number;
  ratingChange: number;
  rank: number;
  totalGames: number;
  winRate: number;
  favoriteOpenings: string[];
}

interface MobileSpecificStats {
  touchAccuracy: number;
  gestureSpeed: number;
  mobileGamesPlayed: number;
  touchMistakes: number;
  swipeToMoveEnabled: boolean;
}

interface GamificationState {
  // User-specific data
  userId: string | null;
  isOnline: boolean;
  lastSyncedAt: string | null;
  
  // XP and Levels
  totalXP: number;
  currentLevel: number;
  xpForNextLevel: number;
  xpInCurrentLevel: number;
  
  // Streaks
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  streakFreezeUsed: boolean;
  
  // Activity counters
  lessonsCompleted: number;
  puzzlesSolved: number;
  gamesPlayed: number;
  gamesWon: number;
  
  // Achievements
  achievements: Achievement[];
  unlockedAchievements: Achievement[];
  
  // Enhanced Stats
  totalTimeSpent: number; // in minutes
  averageAccuracy: number;
  userStats: UserStats;
  mobileStats: MobileSpecificStats;
  
  // Session data
  sessionXP: number;
  sessionStartTime: string | null;
  dailyGoals: {
    lessonsTarget: number;
    puzzlesTarget: number;
    timeTarget: number; // minutes
    lessonsCompleted: number;
    puzzlesSolved: number;
    timeSpent: number;
    completed: boolean;
  };
}

interface GamificationActions {
  // User management
  setUser: (userId: string) => void;
  clearUser: () => void;
  syncWithServer: () => Promise<void>;
  
  // XP Management
  addXP: (amount: number, source: string) => void;
  
  // Activity tracking
  completeLesson: (lessonId: string, timeSpent: number, accuracy: number) => void;
  solvePuzzle: (puzzleId: string, attempts: number, timeSpent: number) => void;
  completeGame: (won: boolean, timeSpent: number, deviceType?: 'mobile' | 'desktop', gameDetails?: {
    gameMode?: GameMode;
    difficultyLevel?: DifficultyLevel;
    computerLevel?: number;
    movesCount?: number;
    hintsUsed?: number;
    mistakesCount?: number;
    accuracyPercentage?: number;
  }) => void;
  
  // Mobile-specific actions
  recordTouchAccuracy: (accuracy: number) => void;
  recordGestureSpeed: (speed: number) => void;
  incrementTouchMistakes: () => void;
  toggleSwipeToMove: (enabled: boolean) => void;
  
  // Streak management
  updateStreak: () => void;
  useStreakFreeze: () => boolean;
  
  // Achievement management
  checkAchievements: () => void;
  unlockAchievement: (achievementId: string) => void;
  
  // Session management
  startSession: () => void;
  endSession: () => void;
  
  // Daily goals
  setDailyGoals: (goals: { lessons: number; puzzles: number; time: number }) => void;
  checkDailyGoals: () => void;
  
  // Stats updates
  updateRating: (newRating: number) => void;
  updateStats: (stats: Partial<UserStats>) => void;
}

const LEVEL_XP_REQUIREMENTS = [
  0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250, // Levels 0-10
  3850, 4500, 5200, 5950, 6750, 7600, 8500, 9450, 10450, // Levels 11-20
];

const getXPRequirementForLevel = (level: number): number => {
  if (level < LEVEL_XP_REQUIREMENTS.length) {
    return LEVEL_XP_REQUIREMENTS[level];
  }
  // For levels beyond our array, use exponential growth
  return LEVEL_XP_REQUIREMENTS[LEVEL_XP_REQUIREMENTS.length - 1] + (level - LEVEL_XP_REQUIREMENTS.length + 1) * 1000;
};

const calculateLevel = (totalXP: number): { level: number; xpInLevel: number; xpForNext: number } => {
  let level = 0;
  const xpInLevel = totalXP;
  
  while (level < LEVEL_XP_REQUIREMENTS.length - 1 && totalXP >= getXPRequirementForLevel(level + 1)) {
    level++;
  }
  
  const currentLevelXP = getXPRequirementForLevel(level);
  const nextLevelXP = getXPRequirementForLevel(level + 1);
  
  return {
    level,
    xpInLevel: totalXP - currentLevelXP,
    xpForNext: nextLevelXP - totalXP
  };
};

const createInitialAchievements = (): Achievement[] => [
  // Lesson achievements
  {
    id: 'first_lesson',
    title: 'First Steps',
    description: 'Complete your first chess lesson',
    icon: '🎓',
    requirement: 1,
    currentProgress: 0,
    unlocked: false,
    category: 'lessons'
  },
  {
    id: 'lesson_graduate',
    title: 'Chess Scholar',
    description: 'Complete 10 chess lessons',
    icon: '📚',
    requirement: 10,
    currentProgress: 0,
    unlocked: false,
    category: 'lessons'
  },
  
  // Puzzle achievements
  {
    id: 'first_puzzle',
    title: 'Puzzle Solver',
    description: 'Solve your first chess puzzle',
    icon: '🧩',
    requirement: 1,
    currentProgress: 0,
    unlocked: false,
    category: 'puzzles'
  },
  {
    id: 'puzzle_master',
    title: 'Tactical Genius',
    description: 'Solve 50 chess puzzles',
    icon: '🎯',
    requirement: 50,
    currentProgress: 0,
    unlocked: false,
    category: 'puzzles'
  },
  
  // Game achievements
  {
    id: 'first_win',
    title: 'Victory!',
    description: 'Win your first game against the computer',
    icon: '🏆',
    requirement: 1,
    currentProgress: 0,
    unlocked: false,
    category: 'games'
  },
  {
    id: 'chess_warrior',
    title: 'Chess Warrior',
    description: 'Win 10 games against the computer',
    icon: '⚔️',
    requirement: 10,
    currentProgress: 0,
    unlocked: false,
    category: 'games'
  },
  
  // Mobile achievements
  {
    id: 'mobile_first_game',
    title: 'Touch Master',
    description: 'Play your first game on mobile',
    icon: '📱',
    requirement: 1,
    currentProgress: 0,
    unlocked: false,
    category: 'mobile'
  },
  {
    id: 'touch_accuracy',
    title: 'Precision Touch',
    description: 'Achieve 95% touch accuracy in 10 games',
    icon: '🎯',
    requirement: 10,
    currentProgress: 0,
    unlocked: false,
    category: 'mobile'
  },
  {
    id: 'gesture_speed',
    title: 'Lightning Fingers',
    description: 'Average under 0.5s gesture speed for 20 moves',
    icon: '⚡',
    requirement: 20,
    currentProgress: 0,
    unlocked: false,
    category: 'mobile'
  },
  {
    id: 'swipe_master',
    title: 'Swipe Grandmaster',
    description: 'Enable and use swipe-to-move for 50 moves',
    icon: '👆',
    requirement: 50,
    currentProgress: 0,
    unlocked: false,
    category: 'mobile'
  },

  // Streak achievements
  {
    id: 'streak_3',
    title: 'Consistency',
    description: 'Maintain a 3-day learning streak',
    icon: '🔥',
    requirement: 3,
    currentProgress: 0,
    unlocked: false,
    category: 'streaks'
  },
  {
    id: 'streak_7',
    title: 'Dedication',
    description: 'Maintain a 7-day learning streak',
    icon: '💪',
    requirement: 7,
    currentProgress: 0,
    unlocked: false,
    category: 'streaks'
  },
  
  // Special achievements
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Solve a puzzle in under 30 seconds',
    icon: '⚡',
    requirement: 1,
    currentProgress: 0,
    unlocked: false,
    category: 'special'
  },
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Complete a lesson with 100% accuracy',
    icon: '💎',
    requirement: 1,
    currentProgress: 0,
    unlocked: false,
    category: 'special'
  }
];

export const useGamificationStore = create<GamificationState & GamificationActions>()(
  persist(
    (set, get) => ({
      // Initial state - user-specific data
      userId: null,
      isOnline: navigator.onLine,
      lastSyncedAt: null,
      
      // XP and levels
      totalXP: 0,
      currentLevel: 0,
      xpForNextLevel: 100,
      xpInCurrentLevel: 0,
      
      // Streaks
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      streakFreezeUsed: false,
      
      // Activity counters
      lessonsCompleted: 0,
      puzzlesSolved: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      
      // Achievements
      achievements: createInitialAchievements(),
      unlockedAchievements: [],
      
      // Enhanced stats
      totalTimeSpent: 0,
      averageAccuracy: 0,
      userStats: {
        rating: 1200,
        ratingChange: 0,
        rank: 0,
        totalGames: 0,
        winRate: 0,
        favoriteOpenings: [],
      },
      mobileStats: {
        touchAccuracy: 100,
        gestureSpeed: 0,
        mobileGamesPlayed: 0,
        touchMistakes: 0,
        swipeToMoveEnabled: false,
      },
      
      // Session data
      sessionXP: 0,
      sessionStartTime: null,
      dailyGoals: {
        lessonsTarget: 3,
        puzzlesTarget: 5,
        timeTarget: 30,
        lessonsCompleted: 0,
        puzzlesSolved: 0,
        timeSpent: 0,
        completed: false,
      },

      // User management
      setUser: (userId: string) => {
        set({ 
          userId,
          sessionStartTime: new Date().toISOString(),
          sessionXP: 0
        });
      },

      clearUser: () => {
        set({
          userId: null,
          sessionStartTime: null,
          sessionXP: 0,
          dailyGoals: {
            lessonsTarget: 3,
            puzzlesTarget: 5,
            timeTarget: 30,
            lessonsCompleted: 0,
            puzzlesSolved: 0,
            timeSpent: 0,
            completed: false,
          },
        });
      },

      syncWithServer: async () => {
        const state = get();
        if (!state.userId || !state.isOnline) return;

        try {
          // Sync stats with server
          await apiClient.updateUserProfile({
            userStats: state.userStats,
            // Add other user data to sync
          });
          
          set({ lastSyncedAt: new Date().toISOString() });
        } catch (error) {
          console.error('Failed to sync with server:', error);
        }
      },

      addXP: (amount: number, source: string) => {
        const state = get();
        const oldLevel = state.currentLevel;
        const newTotalXP = state.totalXP + amount;
        const levelData = calculateLevel(newTotalXP);

        console.log(`+${amount} XP from ${source}! Total: ${newTotalXP}`);

        set({
          totalXP: newTotalXP,
          sessionXP: state.sessionXP + amount,
          currentLevel: levelData.level,
          xpInCurrentLevel: levelData.xpInLevel,
          xpForNextLevel: levelData.xpForNext
        });

        // Check if we leveled up and track analytics
        if (levelData.level > oldLevel) {
          console.log(`🎉 Level Up! Now level ${levelData.level}`);
          analytics.trackLevelUp(levelData.level, amount);
        }

        // Update daily goals
        get().checkDailyGoals();
        
        // Check for level up achievements
        get().checkAchievements();
      },

      completeLesson: (lessonId: string, timeSpent: number, accuracy: number) => {
        const state = get();
        const newCount = state.lessonsCompleted + 1;
        
        // Calculate XP based on accuracy and time
        let xpGain = 50; // Base XP for lesson completion
        if (accuracy >= 90) xpGain += 20; // Bonus for high accuracy
        if (accuracy === 100) xpGain += 30; // Extra bonus for perfect accuracy
        
        set({
          lessonsCompleted: newCount,
          totalTimeSpent: state.totalTimeSpent + timeSpent,
          averageAccuracy: (state.averageAccuracy * (newCount - 1) + accuracy) / newCount
        });

        // Track lesson completion with analytics
        analytics.trackLessonProgress({
          lesson_id: lessonId,
          lesson_category: 'general', // Could be derived from lessonId
          progress_percentage: 100, // Lesson completed
          time_spent_seconds: Math.floor(timeSpent / 1000),
          completed: true,
        });

        get().addXP(xpGain, 'lesson completion');
        get().updateStreak();
        get().checkAchievements();
      },

      solvePuzzle: (puzzleId: string, attempts: number, timeSpent: number) => {
        const state = get();
        const newCount = state.puzzlesSolved + 1;
        
        // Calculate XP based on attempts and time
        let xpGain = 30; // Base XP for puzzle solving
        if (attempts === 1) xpGain += 20; // Bonus for solving on first try
        if (timeSpent < 30) xpGain += 15; // Bonus for speed
        
        set({
          puzzlesSolved: newCount,
          totalTimeSpent: state.totalTimeSpent + Math.floor(timeSpent / 60000) // Convert ms to minutes
        });

        // Track puzzle completion with analytics
        analytics.trackPuzzleComplete({
          puzzle_id: puzzleId,
          difficulty_level: 'intermediate' as DifficultyLevel, // Could be derived from puzzleId
          attempts_count: attempts,
          time_taken_seconds: Math.floor(timeSpent / 1000),
          was_successful: true, // Since this is called on successful solve
          hints_used: 0, // Could be passed as parameter if available
        });

        get().addXP(xpGain, 'puzzle solved');
        get().updateStreak();
        get().checkAchievements();
      },

      completeGame: (won: boolean, timeSpent: number, deviceType?: 'mobile' | 'desktop', gameDetails?: {
        gameMode?: GameMode;
        difficultyLevel?: DifficultyLevel;
        computerLevel?: number;
        movesCount?: number;
        hintsUsed?: number;
        mistakesCount?: number;
        accuracyPercentage?: number;
      }) => {
        const state = get();
        
        const updates: Partial<GamificationState> = {
          gamesPlayed: state.gamesPlayed + 1,
          gamesWon: won ? state.gamesWon + 1 : state.gamesWon,
          totalTimeSpent: state.totalTimeSpent + Math.floor(timeSpent / 60000),
        };

        // Update mobile-specific stats
        if (deviceType === 'mobile') {
          updates.mobileStats = {
            ...state.mobileStats,
            mobileGamesPlayed: state.mobileStats.mobileGamesPlayed + 1,
          };
        }

        // Update user stats
        updates.userStats = {
          ...state.userStats,
          totalGames: state.userStats.totalGames + 1,
          winRate: ((state.gamesWon + (won ? 1 : 0)) / (state.gamesPlayed + 1)) * 100,
        };

        set(updates);

        // Track game completion with detailed analytics
        const gameResult: GameResult = won ? 'win' : 'loss';
        analytics.trackChessGameEnd({
          game_mode: gameDetails?.gameMode || 'vs_computer',
          result: gameResult,
          duration_seconds: Math.floor(timeSpent / 1000),
          moves_count: gameDetails?.movesCount || 0,
          difficulty_level: gameDetails?.difficultyLevel || 'intermediate',
          computer_level: gameDetails?.computerLevel,
          hints_used: gameDetails?.hintsUsed || 0,
          mistakes_count: gameDetails?.mistakesCount || 0,
          accuracy_percentage: gameDetails?.accuracyPercentage || 0,
          user_rating_before: state.userStats.rating,
          user_rating_after: state.userStats.rating, // Would be updated by rating system
          rating_change: 0, // Would be calculated by rating system
        });

        const xpGain = won ? 100 : 25; // More XP for wins
        const bonusXP = deviceType === 'mobile' ? 10 : 0; // Bonus for mobile play
        get().addXP(xpGain + bonusXP, won ? 'game won' : 'game played');
        get().updateStreak();
        get().checkAchievements();
      },

      // Mobile-specific actions
      recordTouchAccuracy: (accuracy: number) => {
        const state = get();
        const currentAccuracy = state.mobileStats.touchAccuracy;
        const newAccuracy = (currentAccuracy + accuracy) / 2; // Simple running average
        
        set({
          mobileStats: {
            ...state.mobileStats,
            touchAccuracy: newAccuracy,
          },
        });
        
        get().checkAchievements();
      },

      recordGestureSpeed: (speed: number) => {
        const state = get();
        const currentSpeed = state.mobileStats.gestureSpeed;
        const newSpeed = currentSpeed === 0 ? speed : (currentSpeed + speed) / 2;
        
        set({
          mobileStats: {
            ...state.mobileStats,
            gestureSpeed: newSpeed,
          },
        });
        
        get().checkAchievements();
      },

      incrementTouchMistakes: () => {
        const state = get();
        set({
          mobileStats: {
            ...state.mobileStats,
            touchMistakes: state.mobileStats.touchMistakes + 1,
          },
        });
      },

      toggleSwipeToMove: (enabled: boolean) => {
        const state = get();
        set({
          mobileStats: {
            ...state.mobileStats,
            swipeToMoveEnabled: enabled,
          },
        });
      },

      // Enhanced streak management
      useStreakFreeze: () => {
        const state = get();
        if (state.streakFreezeUsed || state.currentStreak === 0) {
          return false;
        }
        
        set({ streakFreezeUsed: true });
        return true;
      },

      updateStreak: () => {
        const state = get();
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        if (state.lastActivityDate === today) {
          // Already updated today, no change
          return;
        } else if (state.lastActivityDate === yesterday) {
          // Consecutive day, increment streak
          const newStreak = state.currentStreak + 1;
          set({
            currentStreak: newStreak,
            longestStreak: Math.max(state.longestStreak, newStreak),
            lastActivityDate: today
          });
        } else if (state.lastActivityDate === null) {
          // First day
          set({
            currentStreak: 1,
            longestStreak: Math.max(state.longestStreak, 1),
            lastActivityDate: today
          });
        } else {
          // Streak broken, reset
          set({
            currentStreak: 1,
            lastActivityDate: today
          });
        }
      },

      checkAchievements: () => {
        const state = get();
        const updatedAchievements = [...state.achievements];
        let hasUpdates = false;

        updatedAchievements.forEach(achievement => {
          if (achievement.unlocked) return;

          let progress = 0;
          let shouldUnlock = false;

          switch (achievement.id) {
            case 'first_lesson':
            case 'lesson_graduate':
              progress = state.lessonsCompleted;
              break;
            case 'first_puzzle':
            case 'puzzle_master':
              progress = state.puzzlesSolved;
              break;
            case 'first_win':
            case 'chess_warrior':
              progress = state.gamesWon;
              break;
            case 'streak_3':
            case 'streak_7':
              progress = state.longestStreak;
              break;
            case 'perfectionist':
              progress = state.averageAccuracy === 100 ? 1 : 0;
              break;
          }

          if (progress !== achievement.currentProgress) {
            achievement.currentProgress = progress;
            hasUpdates = true;
          }

          if (progress >= achievement.requirement && !achievement.unlocked) {
            achievement.unlocked = true;
            achievement.unlockedAt = new Date();
            shouldUnlock = true;
            hasUpdates = true;
          }

          if (shouldUnlock) {
            console.log(`🎉 Achievement Unlocked: ${achievement.title}!`);
            get().addXP(100, `achievement: ${achievement.title}`);
          }
        });

        if (hasUpdates) {
          set({ achievements: updatedAchievements });
        }
      },

      unlockAchievement: (achievementId: string) => {
        const state = get();
        const achievement = state.achievements.find(a => a.id === achievementId);
        if (achievement && !achievement.unlocked) {
          achievement.unlocked = true;
          achievement.unlockedAt = new Date();
          set({ achievements: [...state.achievements] });
          
          // Track achievement unlock with analytics
          analytics.trackAchievementUnlock(achievementId, achievement.title);
        }
      },

      // Session management
      startSession: () => {
        set({
          sessionStartTime: new Date().toISOString(),
          sessionXP: 0,
        });
      },

      endSession: () => {
        const state = get();
        if (state.sessionStartTime) {
          const sessionDuration = Date.now() - new Date(state.sessionStartTime).getTime();
          console.log(`Session ended. Duration: ${Math.floor(sessionDuration / 1000)}s, XP earned: ${state.sessionXP}`);
        }
        set({ sessionStartTime: null });
      },

      // Daily goals management
      setDailyGoals: (goals: { lessons: number; puzzles: number; time: number }) => {
        set({
          dailyGoals: {
            lessonsTarget: goals.lessons,
            puzzlesTarget: goals.puzzles,
            timeTarget: goals.time,
            lessonsCompleted: 0,
            puzzlesSolved: 0,
            timeSpent: 0,
            completed: false,
          },
        });
      },

      checkDailyGoals: () => {
        const state = get();
        const goals = state.dailyGoals;
        
        const completed = 
          goals.lessonsCompleted >= goals.lessonsTarget &&
          goals.puzzlesSolved >= goals.puzzlesTarget &&
          goals.timeSpent >= goals.timeTarget;

        if (completed && !goals.completed) {
          // Daily goals completed for the first time today
          set({
            dailyGoals: { ...goals, completed: true },
          });
          get().addXP(200, 'daily goals completed'); // Bonus XP for completing daily goals
        }
      },

      // Stats updates
      updateRating: (newRating: number) => {
        const state = get();
        const ratingChange = newRating - state.userStats.rating;
        set({
          userStats: {
            ...state.userStats,
            rating: newRating,
            ratingChange,
          },
        });
      },

      updateStats: (stats: Partial<UserStats>) => {
        const state = get();
        set({
          userStats: {
            ...state.userStats,
            ...stats,
          },
        });
      }
    }),
    {
      name: 'chess-academy-gamification',
      partialize: (state) => ({
        totalXP: state.totalXP,
        currentLevel: state.currentLevel,
        xpForNextLevel: state.xpForNextLevel,
        xpInCurrentLevel: state.xpInCurrentLevel,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        lastActivityDate: state.lastActivityDate,
        lessonsCompleted: state.lessonsCompleted,
        puzzlesSolved: state.puzzlesSolved,
        gamesPlayed: state.gamesPlayed,
        gamesWon: state.gamesWon,
        achievements: state.achievements,
        totalTimeSpent: state.totalTimeSpent,
        averageAccuracy: state.averageAccuracy,
      })
    }
  )
);