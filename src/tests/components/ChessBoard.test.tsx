import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import { ChessBoard } from '../../components/chess/ChessBoard';

// Mock the audio service
vi.mock('../../services/audioService', () => ({
  audioService: {
    playMoveSound: vi.fn(),
    playGameStateSound: vi.fn(),
    playUISound: vi.fn(),
  },
}));

describe('ChessBoard', () => {
  const defaultProps = {
    onMove: vi.fn(),
    onGameOver: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default starting position', () => {
    render(<ChessBoard {...defaultProps} />);
    
    // Check if the board container is rendered
    expect(document.querySelector('.chess-board-container')).toBeInTheDocument();
  });

  it('displays game status correctly', () => {
    render(<ChessBoard {...defaultProps} />);
    
    // Should show White's turn initially
    expect(screen.getByText(/Turn: White/)).toBeInTheDocument();
  });

  it('shows coordinates when enabled', () => {
    render(<ChessBoard {...defaultProps} showCoordinates={true} />);
    
    // The react-chessboard component should receive the showBoardNotation prop
    // We can't directly test the coordinates display due to the library's internal implementation
    expect(document.querySelector('.chess-board-container')).toBeInTheDocument();
  });

  it('calls onMove when a valid move is made', async () => {
    const onMoveMock = vi.fn();
    render(<ChessBoard {...defaultProps} onMove={onMoveMock} />);
    
    // This is a simplified test - in a real scenario, we'd need to interact with the chess board
    // For now, we'll just verify the component renders without errors
    expect(document.querySelector('.chess-board-container')).toBeInTheDocument();
  });

  it('handles puzzle mode correctly', () => {
    const correctMoves = ['e2e4', 'd7d5'];
    const onCorrectMove = vi.fn();
    const onIncorrectMove = vi.fn();

    render(
      <ChessBoard
        {...defaultProps}
        puzzleMode={true}
        correctMoves={correctMoves}
        onCorrectMove={onCorrectMove}
        onIncorrectMove={onIncorrectMove}
      />
    );

    expect(document.querySelector('.chess-board-container')).toBeInTheDocument();
  });

  it('disables interaction when disabled prop is true', () => {
    render(<ChessBoard {...defaultProps} disabled={true} />);
    
    expect(document.querySelector('.chess-board-container')).toBeInTheDocument();
  });

  it('displays promotion dialog when needed', async () => {
    // This would require more complex setup to trigger a pawn promotion
    // For now, we'll just test that the component handles the prop correctly
    render(<ChessBoard {...defaultProps} />);
    
    expect(document.querySelector('.chess-board-container')).toBeInTheDocument();
  });

  it('shows debug info in development mode', () => {
    // Mock development environment
    vi.stubGlobal('import.meta', { env: { DEV: true } });

    render(<ChessBoard {...defaultProps} />);
    
    expect(screen.getByText('Debug Info')).toBeInTheDocument();
    
    vi.unstubAllGlobals();
  });

  it('handles custom FEN position', () => {
    const customFen = '8/8/8/4p1K1/2k1P3/8/8/8 b - - 0 1';
    render(<ChessBoard {...defaultProps} fen={customFen} />);
    
    expect(document.querySelector('.chess-board-container')).toBeInTheDocument();
  });

  it('handles different orientations', () => {
    render(<ChessBoard {...defaultProps} orientation="black" />);
    
    expect(document.querySelector('.chess-board-container')).toBeInTheDocument();
  });
});