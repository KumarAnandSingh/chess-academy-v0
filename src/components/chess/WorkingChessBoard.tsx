import React, { useState, useCallback, useMemo } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess, Square } from 'chess.js';
import { audioService } from '../../services/audioService';

interface WorkingChessBoardProps {
  fen?: string;
  orientation?: 'white' | 'black';
  onMove?: (move: { from: string; to: string; promotion?: string }) => void;
  onGameOver?: (result: 'checkmate' | 'draw' | 'stalemate') => void;
  disabled?: boolean;
  puzzleMode?: boolean;
  correctMoves?: string[];
  onCorrectMove?: () => void;
  onIncorrectMove?: () => void;
}

export const WorkingChessBoard: React.FC<WorkingChessBoardProps> = ({
  fen: initialFen,
  orientation = 'white',
  onMove,
  onGameOver,
  disabled = false,
  puzzleMode = false,
  correctMoves = [],
  onCorrectMove,
  onIncorrectMove,
}) => {
  // Core game state
  const [game, setGame] = useState(() => new Chess(initialFen || undefined));
  const [moveFrom, setMoveFrom] = useState<Square | null>(null);
  const [moveTo, setMoveTo] = useState<Square | null>(null);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [optionSquares, setOptionSquares] = useState<Record<string, any>>({});

  // Reset game when FEN changes
  React.useEffect(() => {
    if (initialFen && initialFen !== game.fen()) {
      const newGame = new Chess(initialFen);
      setGame(newGame);
      resetSelection();
    }
  }, [initialFen]);

  const resetSelection = () => {
    setMoveFrom(null);
    setMoveTo(null);
    setShowPromotionDialog(false);
    setOptionSquares({});
  };

  // Safe game mutation that preserves React state
  const safeGameMutate = useCallback((modify: (g: Chess) => void) => {
    setGame((currentGame) => {
      const gameCopy = new Chess(currentGame.fen());
      modify(gameCopy);
      return gameCopy;
    });
  }, []);

  // Handle square clicks for piece selection and movement
  const onSquareClick = useCallback((square: Square) => {
    console.log('Square clicked:', square);
    
    if (disabled) return;

    // If no piece selected, try to select this square
    if (!moveFrom) {
      const moves = game.moves({ square, verbose: true });
      if (moves.length > 0) {
        setMoveFrom(square);
        
        // Highlight possible moves
        const newSquares: Record<string, any> = {};
        moves.forEach((move) => {
          newSquares[move.to] = {
            background: 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)',
            borderRadius: '50%',
          };
        });
        newSquares[square] = { background: 'rgba(255, 255, 0, 0.4)' };
        setOptionSquares(newSquares);
        
        console.log('Selected piece at', square, 'with', moves.length, 'possible moves');
      }
      return;
    }

    // If same square clicked, deselect
    if (moveFrom === square) {
      console.log('Deselecting piece');
      resetSelection();
      return;
    }

    // Try to make a move
    console.log('Attempting move:', moveFrom, '→', square);
    attemptMove(moveFrom, square);
  }, [game, moveFrom, disabled]);

  // Handle drag and drop
  const onPieceDrop = useCallback((sourceSquare: Square, targetSquare: Square) => {
    console.log('Piece dropped:', sourceSquare, '→', targetSquare);
    
    if (disabled) return false;

    const success = attemptMove(sourceSquare, targetSquare);
    return success;
  }, [disabled]);

  // Attempt to make a move
  const attemptMove = (from: Square, to: Square, promotion = 'q') => {
    try {
      // Check if this move requires promotion
      const moves = game.moves({ square: from, verbose: true });
      const moveDetails = moves.find(m => m.from === from && m.to === to);
      
      if (moveDetails && moveDetails.flags.includes('p')) {
        // Promotion move
        setMoveFrom(from);
        setMoveTo(to);
        setShowPromotionDialog(true);
        return true;
      }

      // Regular move
      const gameCopy = new Chess(game.fen());
      const moveResult = gameCopy.move({ from, to, promotion });
      
      if (!moveResult) {
        console.log('Invalid move attempted');
        resetSelection();
        return false;
      }

      console.log('Move successful:', moveResult);

      // Update game state
      setGame(gameCopy);
      resetSelection();

      // Play audio
      audioService.playMoveSound(!!moveResult.captured);

      // Check game over conditions
      if (gameCopy.isGameOver()) {
        if (gameCopy.isCheckmate()) {
          audioService.playGameStateSound('checkmate');
          onGameOver?.('checkmate');
        } else if (gameCopy.isDraw()) {
          audioService.playUISound('notification');
          onGameOver?.('draw');
        } else if (gameCopy.isStalemate()) {
          audioService.playUISound('notification');
          onGameOver?.('stalemate');
        }
      } else if (gameCopy.isCheck()) {
        audioService.playGameStateSound('check');
      }

      // Handle puzzle mode
      if (puzzleMode && correctMoves.length > 0) {
        const moveStr = `${from}${to}${promotion}`;
        if (correctMoves.includes(moveStr) || correctMoves.includes(`${from}${to}`)) {
          audioService.playGamificationSound('puzzleSolved');
          onCorrectMove?.();
        } else {
          audioService.playUISound('error');
          onIncorrectMove?.();
        }
      }

      // Notify parent
      onMove?.({ from, to, promotion });
      return true;

    } catch (error) {
      console.error('Move error:', error);
      resetSelection();
      return false;
    }
  };

  // Handle promotion piece selection
  const onPromotionPieceSelect = useCallback((piece?: string) => {
    if (piece && moveFrom && moveTo) {
      const promotionPiece = piece[1]?.toLowerCase() || 'q';
      attemptMove(moveFrom, moveTo, promotionPiece);
    } else {
      resetSelection();
    }
    return true;
  }, [moveFrom, moveTo]);

  // FIXED: Proper handlers for react-chessboard v5.5.0 API
  const handleSquareClick = useCallback(({ piece, square }: { piece: any; square: string }) => {
    onSquareClick(square as any);
  }, [onSquareClick]);

  const handlePieceDrop = useCallback(({ sourceSquare, targetSquare }: { piece: any; sourceSquare: string; targetSquare: string }) => {
    return onPieceDrop(sourceSquare as any, targetSquare as any);
  }, [onPieceDrop]);

  // FIXED: Memoize board options using correct API structure
  const boardOptions = useMemo(() => ({
    position: game.fen(),
    onSquareClick: handleSquareClick,
    onPieceDrop: handlePieceDrop,
    boardOrientation: orientation,
    squareStyles: optionSquares,
    allowDragging: !disabled,
    animationDurationInMs: 200,
    boardStyle: {
      borderRadius: '4px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
    },
  }), [game, handleSquareClick, handlePieceDrop, orientation, optionSquares, disabled]);

  return (
    <div className="working-chess-board">
      <div className="relative">
        <Chessboard
          options={boardOptions}
        />
        
        {/* Game status overlay */}
        <div className="absolute -bottom-8 left-0 right-0 text-center">
          <div className="text-sm text-gray-600">
            Turn: {game.turn() === 'w' ? 'White' : 'Black'} | 
            {game.isCheck() && ' Check! |'}
            {game.isGameOver() && ' Game Over!'}
          </div>
        </div>
      </div>
    </div>
  );
};