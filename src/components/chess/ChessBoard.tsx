import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess, Square, PieceSymbol, Color } from 'chess.js';
import { audioService } from '../../services/audioService';
import { PieceTooltip } from './PieceTooltip';
import { HelpSystem } from './HelpSystem';
import { VibrationEffect, CelebrationNudge, IllegalMoveWarning, MoveQuality, Confetti } from '../ui/GamificationEffects';

interface ChessBoardProps {
  fen?: string;
  orientation?: 'white' | 'black';
  allowAllMoves?: boolean;
  onMove?: (move: { from: string; to: string; promotion?: string }) => void;
  onGameOver?: (result: 'checkmate' | 'draw' | 'stalemate') => void;
  highlightMoves?: boolean;
  showCoordinates?: boolean;
  disabled?: boolean;
  puzzleMode?: boolean;
  correctMoves?: string[];
  onCorrectMove?: () => void;
  onIncorrectMove?: () => void;
  showHelp?: boolean;
  highlightSquare?: string;
  showPieceTooltips?: boolean;
  enableGamification?: boolean;
  lessonMode?: boolean;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  fen: initialFen,
  orientation = 'white',
  allowAllMoves = true,
  onMove,
  onGameOver,
  highlightMoves = true,
  showCoordinates = true,
  disabled = false,
  puzzleMode = false,
  correctMoves = [],
  onCorrectMove,
  onIncorrectMove,
  showHelp = false,
  highlightSquare,
  showPieceTooltips = true,
  enableGamification = true,
  lessonMode = false,
}) => {
  // Use parent's FEN as the single source of truth - no internal game state
  const game = useMemo(() => new Chess(initialFen || undefined), [initialFen]);
  const [moveFrom, setMoveFrom] = useState<Square | null>(null);
  const [moveTo, setMoveTo] = useState<Square | null>(null);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [optionSquares, setOptionSquares] = useState<Record<string, any>>({});
  
  // Enhanced UI state
  const [pieceTooltip, setPieceTooltip] = useState<{
    show: boolean;
    piece?: PieceSymbol;
    color?: Color;
    square?: string;
    position: { x: number; y: number };
  }>({ show: false, position: { x: 0, y: 0 } });
  
  const [hintMessage, setHintMessage] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  const [celebrationType, setCelebrationType] = useState<'excellent' | 'good' | 'great' | 'brilliant' | 'win'>('good');
  const [showIllegalMove, setShowIllegalMove] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [moveQuality, setMoveQuality] = useState<{
    show: boolean;
    quality: 'blunder' | 'mistake' | 'inaccuracy' | 'good' | 'excellent' | 'brilliant';
  }>({ show: false, quality: 'good' });

  const resetSelection = useCallback(() => {
    setMoveFrom(null);
    setMoveTo(null);
    setShowPromotionDialog(false);
    setOptionSquares({});
  }, []);

  // Reset selection when FEN changes from parent
  useEffect(() => {
    console.log('ChessBoard: Parent FEN changed to:', initialFen);
    resetSelection();
  }, [initialFen, resetSelection]);

  // Remove internal game mutation - parent manages all game state

  // Enhanced piece hover handler
  const handlePieceHover = useCallback((event: React.MouseEvent, square: string) => {
    if (!showPieceTooltips) return;
    
    const piece = game.get(square as Square);
    if (piece) {
      setPieceTooltip({
        show: true,
        piece: piece.type,
        color: piece.color,
        square,
        position: { x: event.clientX, y: event.clientY }
      });
    }
  }, [game, showPieceTooltips]);

  const handlePieceLeave = useCallback(() => {
    setPieceTooltip(prev => ({ ...prev, show: false }));
  }, []);

  // Enhanced move evaluation
  const evaluateMove = useCallback((from: string, to: string) => {
    const moves = game.moves({ verbose: true });
    const move = moves.find(m => m.from === from && m.to === to);
    
    if (!move) return 'illegal';
    
    // Simple move evaluation logic
    if (move.captured && move.piece !== 'p') return 'excellent';
    if (move.san.includes('+')) return 'good';
    if (move.san.includes('#')) return 'brilliant';
    if (move.captured) return 'good';
    if (['e4', 'e5', 'd4', 'd5'].includes(to)) return 'good';
    
    return 'good';
  }, [game]);

  // Show celebration for good moves
  const showMoveQuality = useCallback((quality: string) => {
    if (!enableGamification) return;
    
    switch (quality) {
      case 'brilliant':
        setCelebrationMessage('Brilliant move!');
        setCelebrationType('brilliant');
        setShowCelebration(true);
        setShowConfetti(true);
        break;
      case 'excellent':
        setCelebrationMessage('Excellent move!');
        setCelebrationType('excellent');
        setShowCelebration(true);
        break;
      case 'good':
        setCelebrationMessage('Good move!');
        setCelebrationType('good');
        setShowCelebration(true);
        break;
    }
  }, [enableGamification]);

  // Handle help system callbacks
  const handleHighlightSquare = useCallback((square: string) => {
    setOptionSquares(prev => ({
      ...prev,
      [square]: {
        background: 'rgba(255, 255, 0, 0.6)',
        border: '3px solid #FFD700',
      }
    }));
    
    // Clear highlight after 2 seconds
    setTimeout(() => {
      setOptionSquares(prev => {
        const newSquares = { ...prev };
        delete newSquares[square];
        return newSquares;
      });
    }, 2000);
  }, []);

  const handleShowHint = useCallback((hint: string) => {
    setHintMessage(hint);
    setTimeout(() => setHintMessage(''), 3000);
  }, []);

  // FIXED: Proper square click handler
  const onSquareClick = useCallback(({ square }: { piece?: any; square: string }) => {
    console.log('ChessBoard: Square clicked:', square);
    
    if (disabled) {
      console.log('ChessBoard: Board disabled, ignoring click');
      return;
    }

    // If no piece selected, try to select this square
    if (!moveFrom) {
      const moves = game.moves({ square: square as Square, verbose: true });
      if (moves.length > 0) {
        console.log('ChessBoard: Selected piece at', square, 'with', moves.length, 'moves');
        setMoveFrom(square as Square);
        
        // Enhanced highlighting with green dot centers
        if (highlightMoves) {
          const newSquares: Record<string, any> = {};
          moves.forEach((move) => {
            newSquares[move.to] = {
              background: `
                radial-gradient(circle, #10B981 25%, transparent 25%),
                radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)
              `,
              borderRadius: '50%',
            };
          });
          newSquares[square] = { 
            background: 'rgba(255, 255, 0, 0.4)',
            border: '2px solid #FFD700',
            boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
          };
          setOptionSquares(newSquares);
        }
      } else {
        console.log('ChessBoard: No moves available from', square);
      }
      return;
    }

    // If same square clicked, deselect
    if (moveFrom === square) {
      console.log('ChessBoard: Deselecting piece');
      resetSelection();
      return;
    }

    // Try to make a move
    console.log('ChessBoard: Attempting move:', moveFrom, '→', square);
    attemptMove(moveFrom, square as Square);
  }, [game, moveFrom, disabled, highlightMoves, resetSelection]);

  // FIXED: Proper drag and drop handler
  const onPieceDrop = useCallback(({ sourceSquare, targetSquare }: { piece: any; sourceSquare: string; targetSquare: string }) => {
    console.log('ChessBoard: Piece dropped:', sourceSquare, '→', targetSquare);
    
    if (disabled) {
      console.log('ChessBoard: Board disabled, move rejected');
      return false;
    }

    const success = attemptMove(sourceSquare as Square, targetSquare as Square);
    console.log('ChessBoard: Drag move', success ? 'successful' : 'failed');
    return success;
  }, [disabled]);

  // FIXED: Purely controlled move validation - parent handles all game state
  const attemptMove = useCallback((from: Square, to: Square, promotion = 'q') => {
    try {
      console.log('ChessBoard: Validating move', from, to, promotion);
      
      // Check if this move requires promotion
      const moves = game.moves({ square: from, verbose: true });
      const moveDetails = moves.find(m => m.from === from && m.to === to);
      
      if (moveDetails && moveDetails.flags.includes('p')) {
        console.log('ChessBoard: Promotion move detected');
        setMoveFrom(from);
        setMoveTo(to);
        setShowPromotionDialog(true);
        return true;
      }

      // Validate the move WITHOUT making it
      const validMove = moves.find(m => m.from === from && m.to === to);
      
      if (!validMove) {
        console.log('ChessBoard: Invalid move');
        if (enableGamification) {
          setShowIllegalMove(true);
          setTimeout(() => setShowIllegalMove(false), 1500);
        }
        resetSelection();
        return false;
      }

      console.log('ChessBoard: Valid move, notifying parent');

      // Reset selection immediately  
      resetSelection();

      // Handle puzzle mode validation
      if (puzzleMode && correctMoves.length > 0) {
        const moveStr = `${from}${to}${promotion}`;
        const moveStrShort = `${from}${to}`;
        if (correctMoves.includes(moveStr) || correctMoves.includes(moveStrShort)) {
          console.log('ChessBoard: Correct puzzle move!');
          audioService.playGamificationSound('puzzleSolved');
          onCorrectMove?.();
        } else {
          console.log('ChessBoard: Incorrect puzzle move');
          audioService.playUISound('error');
          onIncorrectMove?.();
        }
      }

      // Notify parent to handle the actual move and all state changes
      onMove?.({ from, to, promotion });
      return true;

    } catch (error) {
      console.error('ChessBoard: Move validation error:', error);
      resetSelection();
      return false;
    }
  }, [game, resetSelection, puzzleMode, correctMoves, onCorrectMove, onIncorrectMove, onMove]);

  // FIXED: Handle promotion piece selection
  const onPromotionPieceSelect = useCallback((piece?: string) => {
    console.log('ChessBoard: Promotion piece selected:', piece);
    if (piece && moveFrom && moveTo) {
      const promotionPiece = piece[1]?.toLowerCase() || 'q';
      attemptMove(moveFrom, moveTo, promotionPiece);
    } else {
      console.log('ChessBoard: Promotion cancelled');
      resetSelection();
    }
    return true;
  }, [moveFrom, moveTo, attemptMove, resetSelection]);

  // Unused stub handlers removed - using proper onPieceDrop and onSquareClick handlers above

  // Debug current state
  console.log('ChessBoard render:', {
    position: game.fen(),
    disabled,
    orientation,
    allowDragging: !disabled,
    hasOnMove: !!onMove
  });

  return (
    <VibrationEffect show={showIllegalMove}>
      <div className="chess-board-container relative w-full">
        <div 
          className="relative w-full max-w-full"
          style={{
            background: 'linear-gradient(145deg, #f0f0f0, #e0e0e0)',
            borderRadius: '12px',
            padding: '8px',
            boxShadow: `
              0 8px 32px rgba(0, 0, 0, 0.1),
              inset 0 2px 4px rgba(255, 255, 255, 0.3)
            `,
            aspectRatio: '1',
          }}
        >
          <div 
            className="w-full"
            onMouseMove={(e) => {
              if (!showPieceTooltips) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              const squareWidth = rect.width / 8;
              const squareHeight = rect.height / 8;
              const file = Math.floor(x / squareWidth);
              const rank = orientation === 'white' ? 7 - Math.floor(y / squareHeight) : Math.floor(y / squareHeight);
              
              if (file >= 0 && file < 8 && rank >= 0 && rank < 8) {
                const square = `${String.fromCharCode(97 + file)}${rank + 1}` as Square;
                const piece = game.get(square);
                
                if (piece) {
                  setPieceTooltip({
                    show: true,
                    piece: piece.type,
                    color: piece.color,
                    square,
                    position: { x: e.clientX, y: e.clientY - 50 }
                  });
                } else {
                  setPieceTooltip(prev => ({ ...prev, show: false }));
                }
              }
            }}
            onMouseLeave={() => setPieceTooltip(prev => ({ ...prev, show: false }))}
          >
            <Chessboard
              options={{
                position: game.fen(),
                onSquareClick: onSquareClick,
                onPieceDrop: onPieceDrop,
                boardOrientation: orientation,
                squareStyles: optionSquares,
                allowDragging: !disabled,
                animationDurationInMs: 200,
                boardStyle: {
                  borderRadius: '8px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                },
              }}
            />
          </div>
          
          {/* Coordinates and status display */}
          {showCoordinates && (
            <div className="absolute -bottom-8 left-0 right-0 text-center">
              <div className="text-sm text-gray-600">
                Turn: {game.turn() === 'w' ? 'White' : 'Black'}
                {game.isCheck() && ' | Check!'}
                {game.isGameOver() && ' | Game Over!'}
              </div>
            </div>
          )}

          {/* Hint message display */}
          {hintMessage && (
            <div className="absolute -top-12 left-0 right-0 text-center">
              <div className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
                💡 {hintMessage}
              </div>
            </div>
          )}

          {/* Lesson mode piece highlighting */}
          {lessonMode && highlightSquare && (
            <div className="absolute inset-0 pointer-events-none">
              <div 
                className="absolute w-12 h-12 border-4 border-yellow-400 bg-yellow-200 bg-opacity-30 rounded animate-pulse"
                style={{
                  // Calculate position based on square
                  transform: `translate(${((highlightSquare.charCodeAt(0) - 97) * 50)}px, ${((8 - parseInt(highlightSquare[1])) * 50)}px)`
                }}
              />
            </div>
          )}
        </div>

        {/* Help System */}
        {showHelp && (
          <div className="mt-4">
            <HelpSystem
              game={game}
              onHighlightSquare={handleHighlightSquare}
              onShowHint={handleShowHint}
              disabled={disabled}
            />
          </div>
        )}

        {/* Piece Tooltip */}
        <PieceTooltip
          piece={pieceTooltip.piece!}
          color={pieceTooltip.color!}
          square={pieceTooltip.square!}
          show={pieceTooltip.show}
          position={pieceTooltip.position}
        />

        {/* Gamification Effects */}
        <Confetti 
          show={showConfetti}
          onComplete={() => setShowConfetti(false)}
        />
        
        <CelebrationNudge
          show={showCelebration}
          message={celebrationMessage}
          type={celebrationType}
          onComplete={() => setShowCelebration(false)}
        />
        
        <IllegalMoveWarning
          show={showIllegalMove}
          message="That move is not allowed!"
        />
      </div>
    </VibrationEffect>
  );
};