import { useState, useCallback } from 'react';
import { aiCoach, CoachResponse, PuzzleHint, GameAnalysis } from '../services/aiCoach';
import { useGamificationStore } from '../stores/gamificationStore';

interface UseAICoachOptions {
  autoCoach?: boolean; // Automatically provide coaching after moves
  enableHints?: boolean; // Allow hint requests
  playerLevel?: number; // Override player level
}

interface UseAICoachReturn {
  // State
  coaching: CoachResponse | null;
  puzzleHint: PuzzleHint | null;
  gameAnalysis: GameAnalysis | null;
  isLoading: boolean;
  error: string | null;
  isVisible: boolean;
  
  // Actions
  getCoaching: (position: string, context?: any) => Promise<void>;
  getHint: (position: string, attemptCount: number, puzzleType?: string) => Promise<void>;
  analyzeGame: (position: string, moveHistory: string[]) => Promise<void>;
  onMoveAnalysis: (move: string, isCorrect: boolean, position: string) => Promise<void>;
  showCoach: () => void;
  hideCoach: () => void;
  toggleCoach: () => void;
  clearCoaching: () => void;
  
  // Utilities
  canRequestHint: boolean;
  hintCount: number;
}

export const useAICoach = (options: UseAICoachOptions = {}): UseAICoachReturn => {
  const {
    autoCoach = true,
    enableHints = true,
    playerLevel: overrideLevel
  } = options;

  const { currentLevel } = useGamificationStore();
  const playerLevel = overrideLevel ?? currentLevel;

  // State
  const [coaching, setCoaching] = useState<CoachResponse | null>(null);
  const [puzzleHint, setPuzzleHint] = useState<PuzzleHint | null>(null);
  const [gameAnalysis, setGameAnalysis] = useState<GameAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hintCount, setHintCount] = useState(0);

  const clearError = () => setError(null);
  const clearCoaching = useCallback(() => {
    setCoaching(null);
    setPuzzleHint(null);
    setGameAnalysis(null);
    setError(null);
  }, []);

  // Get general coaching
  const getCoaching = useCallback(async (position: string, context: any = {}) => {
    setIsLoading(true);
    clearError();

    try {
      const difficulty: 'beginner' | 'intermediate' | 'advanced' = playerLevel < 5 ? 'beginner' : playerLevel < 15 ? 'intermediate' : 'advanced';
      
      const coachingContext = {
        position,
        moveHistory: [],
        playerLevel,
        difficulty,
        ...context
      };

      const response = await aiCoach.getCoaching(coachingContext);
      setCoaching(response);
      setIsVisible(true);
    } catch (err) {
      setError('Failed to get coaching advice');
      console.error('Coaching error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [playerLevel]);

  // Get puzzle hint
  const getHint = useCallback(async (position: string, attemptCount: number, puzzleType: string = 'tactical') => {
    if (!enableHints) return;

    setIsLoading(true);
    clearError();

    try {
      const hint = await aiCoach.getHintForPuzzle(position, attemptCount, puzzleType);
      setPuzzleHint(hint);
      setHintCount(prev => prev + 1);
      setIsVisible(true);
    } catch (err) {
      setError('Failed to get hint');
      console.error('Hint error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [enableHints]);

  // Analyze completed game
  const analyzeGame = useCallback(async (position: string, moveHistory: string[]) => {
    setIsLoading(true);
    clearError();

    try {
      const difficulty: 'beginner' | 'intermediate' | 'advanced' = playerLevel < 5 ? 'beginner' : playerLevel < 15 ? 'intermediate' : 'advanced';
      
      const context = {
        position,
        moveHistory,
        playerLevel,
        difficulty
      };

      const analysis = await aiCoach.analyzeGame(context);
      setGameAnalysis(analysis);
      setIsVisible(true);
    } catch (err) {
      setError('Failed to analyze game');
      console.error('Analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [playerLevel]);

  // Analyze individual move (for auto-coaching)
  const onMoveAnalysis = useCallback(async (move: string, isCorrect: boolean, position: string) => {
    if (!autoCoach) return;

    // Only provide coaching for incorrect moves or significant moments
    if (isCorrect && Math.random() > 0.3) return; // 70% chance to skip correct moves

    setIsLoading(true);
    clearError();

    try {
      const response = await aiCoach.getCoachingForMove(move, isCorrect, position, playerLevel);
      setCoaching(response);
      setIsVisible(true);
    } catch (err) {
      setError('Failed to get move analysis');
      console.error('Move analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [autoCoach, playerLevel]);

  // Visibility controls
  const showCoach = useCallback(() => setIsVisible(true), []);
  const hideCoach = useCallback(() => setIsVisible(false), []);
  const toggleCoach = useCallback(() => setIsVisible(prev => !prev), []);

  // Utility computed values
  const canRequestHint = enableHints && hintCount < 3; // Limit hints per session

  return {
    // State
    coaching,
    puzzleHint,
    gameAnalysis,
    isLoading,
    error,
    isVisible,
    
    // Actions
    getCoaching,
    getHint,
    analyzeGame,
    onMoveAnalysis,
    showCoach,
    hideCoach,
    toggleCoach,
    clearCoaching,
    
    // Utilities
    canRequestHint,
    hintCount
  };
};

// Utility hook for specific coaching scenarios
export const useLessonCoach = (lessonTopic?: string) => {
  return useAICoach({
    autoCoach: true,
    enableHints: false
  });
};

export const usePuzzleCoach = (puzzleType?: string) => {
  return useAICoach({
    autoCoach: true,
    enableHints: true
  });
};

export const useGameCoach = () => {
  return useAICoach({
    autoCoach: false, // Only on demand for games
    enableHints: false
  });
};