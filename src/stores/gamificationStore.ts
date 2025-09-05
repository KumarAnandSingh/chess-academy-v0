import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  currentProgress: number;
  unlocked: boolean;
  unlockedAt?: Date;
  category: 'lessons' | 'puzzles' | 'games' | 'streaks' | 'special';
}

interface GamificationState {
  // XP and Levels
  totalXP: number;
  currentLevel: number;
  xpForNextLevel: number;
  xpInCurrentLevel: number;
  
  // Streaks
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  
  // Activity counters
  lessonsCompleted: number;
  puzzlesSolved: number;
  gamesPlayed: number;
  gamesWon: number;
  
  // Achievements
  achievements: Achievement[];
  
  // Stats
  totalTimeSpent: number; // in minutes
  averageAccuracy: number;
}

interface GamificationActions {
  // XP Management
  addXP: (amount: number, source: string) => void;
  
  // Activity tracking
  completeLesson: (lessonId: string, timeSpent: number, accuracy: number) => void;
  solvePuzzle: (puzzleId: string, attempts: number, timeSpent: number) => void;
  completeGame: (won: boolean, timeSpent: number) => void;
  
  // Streak management
  updateStreak: () => void;
  
  // Achievement management
  checkAchievements: () => void;
  unlockAchievement: (achievementId: string) => void;
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
      // Initial state
      totalXP: 0,
      currentLevel: 0,
      xpForNextLevel: 100,
      xpInCurrentLevel: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      lessonsCompleted: 0,
      puzzlesSolved: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      achievements: createInitialAchievements(),
      totalTimeSpent: 0,
      averageAccuracy: 0,

      addXP: (amount: number, source: string) => {
        const state = get();
        const newTotalXP = state.totalXP + amount;
        const levelData = calculateLevel(newTotalXP);

        console.log(`+${amount} XP from ${source}! Total: ${newTotalXP}`);

        set({
          totalXP: newTotalXP,
          currentLevel: levelData.level,
          xpInCurrentLevel: levelData.xpInLevel,
          xpForNextLevel: levelData.xpForNext
        });

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

        get().addXP(xpGain, 'puzzle solved');
        get().updateStreak();
        get().checkAchievements();
      },

      completeGame: (won: boolean, timeSpent: number) => {
        const state = get();
        
        set({
          gamesPlayed: state.gamesPlayed + 1,
          gamesWon: won ? state.gamesWon + 1 : state.gamesWon,
          totalTimeSpent: state.totalTimeSpent + Math.floor(timeSpent / 60000)
        });

        const xpGain = won ? 100 : 25; // More XP for wins
        get().addXP(xpGain, won ? 'game won' : 'game played');
        get().updateStreak();
        get().checkAchievements();
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
        }
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