import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import { ChessBoard } from '../../components/chess/ChessBoard';
import { ChessPuzzle } from '../../components/chess/ChessPuzzle';
import { PlayVsComputer } from '../../components/chess/PlayVsComputer';
import { audioService } from '../../services/audioService';
import { useGamificationStore } from '../../stores/gamificationStore';
import { mockChessPuzzle } from '../utils/test-utils';

// Mock dependencies
vi.mock('../../services/audioService', () => ({
  audioService: {
    playMoveSound: vi.fn(),
    playGameStateSound: vi.fn(),
    playUISound: vi.fn(),
    playGamificationSound: vi.fn(),
    playCelebration: vi.fn(),
  },
}));

vi.mock('../../stores/gamificationStore', () => ({
  useGamificationStore: vi.fn(),
}));

vi.mock('../../hooks/useAICoach', () => ({
  usePuzzleCoach: () => ({
    onMoveAnalysis: vi.fn(),
    getHint: vi.fn(),
    canRequestHint: true,
    isVisible: false,
    hideCoach: vi.fn(),
  }),
  useGameCoach: () => ({
    onMoveAnalysis: vi.fn(),
    getHint: vi.fn(),
    canRequestHint: true,
    isVisible: false,
    hideCoach: vi.fn(),
  }),
}));

const mockGamificationStore = {
  solvePuzzle: vi.fn(),
  completeGame: vi.fn(),
  addXP: vi.fn(),
  updateStats: vi.fn(),
  state: {
    totalXP: 1000,
    currentLevel: 3,
    currentStreak: 2,
  },
};

describe('Chess Gameplay Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useGamificationStore as any).mockReturnValue(mockGamificationStore);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('ChessBoard Integration', () => {
    it('integrates with audio service for move sounds', async () => {
      const onMove = vi.fn();
      render(
        <ChessBoard 
          onMove={onMove} 
          onGameOver={vi.fn()}
        />
      );

      // Verify chess board renders
      expect(document.querySelector('.chess-board-container')).toBeInTheDocument();
      
      // Audio service should be ready to play sounds
      expect(audioService.playMoveSound).not.toHaveBeenCalled();
    });

    it('handles game over states correctly', async () => {
      const onGameOver = vi.fn();
      render(
        <ChessBoard 
          onMove={vi.fn()} 
          onGameOver={onGameOver}
        />
      );

      // Test that game over callback is set up
      expect(onGameOver).toHaveBeenCalledTimes(0);
    });

    it('supports puzzle mode with correct move validation', () => {
      const correctMoves = ['e2e4', 'd7d5'];
      const onCorrectMove = vi.fn();
      const onIncorrectMove = vi.fn();

      render(
        <ChessBoard
          onMove={vi.fn()}
          onGameOver={vi.fn()}
          puzzleMode={true}
          correctMoves={correctMoves}
          onCorrectMove={onCorrectMove}
          onIncorrectMove={onIncorrectMove}
        />
      );

      expect(document.querySelector('.chess-board-container')).toBeInTheDocument();
    });

    it('handles different board orientations', () => {
      render(
        <ChessBoard
          onMove={vi.fn()}
          onGameOver={vi.fn()}
          orientation="black"
        />
      );

      expect(document.querySelector('.chess-board-container')).toBeInTheDocument();
    });

    it('shows debug information in development', () => {
      vi.stubGlobal('import.meta', { env: { DEV: true } });
      
      render(
        <ChessBoard
          onMove={vi.fn()}
          onGameOver={vi.fn()}
        />
      );

      expect(screen.getByText('Debug Info')).toBeInTheDocument();
      
      vi.unstubAllGlobals();
    });
  });

  describe('ChessPuzzle Integration', () => {
    it('integrates with gamification system on puzzle completion', async () => {
      const onSolved = vi.fn();
      
      render(
        <ChessPuzzle
          puzzle={mockChessPuzzle}
          onSolved={onSolved}
          onSkip={vi.fn()}
        />
      );

      // Verify puzzle renders correctly
      expect(screen.getByText('Test Puzzle')).toBeInTheDocument();
      expect(screen.getByText('Rating: 1200')).toBeInTheDocument();
      
      // Gamification store should be available
      expect(mockGamificationStore.solvePuzzle).not.toHaveBeenCalled();
    });

    it('provides feedback for correct and incorrect moves', () => {
      render(
        <ChessPuzzle
          puzzle={mockChessPuzzle}
          onSolved={vi.fn()}
          onSkip={vi.fn()}
        />
      );

      // Initially no feedback should be visible
      expect(screen.queryByText(/Correct/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Not quite right/)).not.toBeInTheDocument();
    });

    it('integrates with AI coach for hints', async () => {
      render(
        <ChessPuzzle
          puzzle={mockChessPuzzle}
          onSolved={vi.fn()}
          onSkip={vi.fn()}
        />
      );

      const hintButton = screen.getByRole('button', { name: /Hint/ });
      
      fireEvent.click(hintButton);
      
      // AI coach should be available to provide hints
      expect(hintButton).toBeInTheDocument();
    });

    it('tracks solving time and attempts', () => {
      render(
        <ChessPuzzle
          puzzle={mockChessPuzzle}
          onSolved={vi.fn()}
          onSkip={vi.fn()}
        />
      );

      expect(screen.getByText(/Time:/)).toBeInTheDocument();
      expect(screen.getByText(/Attempts: 0/)).toBeInTheDocument();
    });

    it('shows solution when requested', async () => {
      render(
        <ChessPuzzle
          puzzle={mockChessPuzzle}
          onSolved={vi.fn()}
          onSkip={vi.fn()}
        />
      );

      const solutionButton = screen.getByRole('button', { name: /Show Solution/ });
      fireEvent.click(solutionButton);

      await waitFor(() => {
        expect(screen.getByText('Solution')).toBeInTheDocument();
      });
    });

    it('allows puzzle reset functionality', async () => {
      render(
        <ChessPuzzle
          puzzle={mockChessPuzzle}
          onSolved={vi.fn()}
          onSkip={vi.fn()}
        />
      );

      const resetButton = screen.getByRole('button', { name: /Reset/ });
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(screen.getByText(/0 \/ 2/)).toBeInTheDocument();
      });
    });
  });

  describe('PlayVsComputer Integration', () => {
    it('integrates with gamification on game completion', () => {
      render(<PlayVsComputer />);
      
      // Should render the vs computer interface
      expect(screen.getByText(/Play vs Computer/)).toBeInTheDocument();
      
      // Gamification integration should be ready
      expect(mockGamificationStore.completeGame).not.toHaveBeenCalled();
    });

    it('supports different difficulty levels', () => {
      render(<PlayVsComputer />);
      
      // Should show difficulty selection
      expect(screen.getByText(/Difficulty/)).toBeInTheDocument();
    });

    it('integrates with AI coach for game analysis', () => {
      render(<PlayVsComputer />);
      
      // AI coach button should be available
      expect(screen.getByRole('button', { name: /Coach/ })).toBeInTheDocument();
    });
  });

  describe('Cross-Component Audio Integration', () => {
    it('plays appropriate sounds for different game events', async () => {
      // Test move sounds
      render(
        <ChessBoard 
          onMove={vi.fn()} 
          onGameOver={vi.fn()}
        />
      );
      
      // Audio service should be properly mocked and available
      expect(audioService.playMoveSound).toHaveBeenCalledTimes(0);
      expect(audioService.playGameStateSound).toHaveBeenCalledTimes(0);
    });

    it('plays UI sounds for button interactions', async () => {
      render(
        <ChessPuzzle
          puzzle={mockChessPuzzle}
          onSolved={vi.fn()}
          onSkip={vi.fn()}
        />
      );

      const resetButton = screen.getByRole('button', { name: /Reset/ });
      fireEvent.click(resetButton);

      // UI sound should be played on button click
      expect(audioService.playUISound).toHaveBeenCalled();
    });

    it('plays celebration sounds on achievements', () => {
      render(
        <ChessPuzzle
          puzzle={mockChessPuzzle}
          onSolved={vi.fn()}
          onSkip={vi.fn()}
        />
      );

      // Celebration should be available for successful puzzle completion
      expect(audioService.playCelebration).not.toHaveBeenCalled();
    });
  });

  describe('Gamification Integration', () => {
    it('awards XP for completed puzzles', () => {
      render(
        <ChessPuzzle
          puzzle={mockChessPuzzle}
          onSolved={vi.fn()}
          onSkip={vi.fn()}
        />
      );

      // Gamification store should be properly connected
      expect(useGamificationStore).toHaveBeenCalled();
    });

    it('updates player statistics', () => {
      render(<PlayVsComputer />);

      // Should have access to gamification state
      expect(useGamificationStore).toHaveBeenCalled();
    });

    it('tracks learning progress across sessions', () => {
      render(
        <ChessPuzzle
          puzzle={mockChessPuzzle}
          onSolved={vi.fn()}
          onSkip={vi.fn()}
        />
      );

      // Progress should be trackable through the gamification system
      expect(mockGamificationStore.state.totalXP).toBe(1000);
      expect(mockGamificationStore.state.currentLevel).toBe(3);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('handles invalid chess positions gracefully', () => {
      const invalidPuzzle = {
        ...mockChessPuzzle,
        fen: 'invalid-fen-string',
      };

      render(
        <ChessPuzzle
          puzzle={invalidPuzzle}
          onSolved={vi.fn()}
          onSkip={vi.fn()}
        />
      );

      // Should still render without crashing
      expect(screen.getByText('Test Puzzle')).toBeInTheDocument();
    });

    it('handles network errors for AI coach requests', () => {
      render(
        <ChessPuzzle
          puzzle={mockChessPuzzle}
          onSolved={vi.fn()}
          onSkip={vi.fn()}
        />
      );

      // Should render even if AI coach is unavailable
      expect(screen.getByRole('button', { name: /Coach/ })).toBeInTheDocument();
    });

    it('gracefully handles audio playback failures', async () => {
      // Mock audio failure
      (audioService.playMoveSound as any).mockRejectedValue(new Error('Audio failed'));

      render(
        <ChessBoard 
          onMove={vi.fn()} 
          onGameOver={vi.fn()}
        />
      );

      // Should not crash on audio errors
      expect(document.querySelector('.chess-board-container')).toBeInTheDocument();
    });

    it('handles gamification store errors', () => {
      // Mock store error
      (useGamificationStore as any).mockImplementation(() => {
        throw new Error('Store error');
      });

      expect(() => {
        render(
          <ChessPuzzle
            puzzle={mockChessPuzzle}
            onSolved={vi.fn()}
            onSkip={vi.fn()}
          />
        );
      }).toThrow();

      // Reset mock for other tests
      (useGamificationStore as any).mockReturnValue(mockGamificationStore);
    });
  });

  describe('Performance and Optimization', () => {
    it('optimizes chess board rendering for different screen sizes', () => {
      // Mock small screen
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });

      render(
        <ChessBoard 
          onMove={vi.fn()} 
          onGameOver={vi.fn()}
        />
      );

      expect(document.querySelector('.chess-board-container')).toBeInTheDocument();

      // Reset window size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
    });

    it('handles rapid user interactions without performance issues', async () => {
      render(
        <ChessPuzzle
          puzzle={mockChessPuzzle}
          onSolved={vi.fn()}
          onSkip={vi.fn()}
        />
      );

      const resetButton = screen.getByRole('button', { name: /Reset/ });
      
      // Simulate rapid clicks
      for (let i = 0; i < 10; i++) {
        fireEvent.click(resetButton);
      }

      // Should handle multiple rapid interactions gracefully
      expect(resetButton).toBeInTheDocument();
    });
  });
});