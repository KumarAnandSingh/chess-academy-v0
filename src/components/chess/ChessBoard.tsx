import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess, Square, PieceSymbol, Color } from 'chess.js';
import { audioService } from '../../services/audioService';
import { PieceTooltip } from './PieceTooltip';
import { HelpSystem } from './HelpSystem';
import { VibrationEffect, CelebrationNudge, IllegalMoveWarning, MoveQuality, Confetti } from '../ui/GamificationEffects';

interface MoveArrow {
  from: string;
  to: string;
  color: 'green' | 'blue' | 'red' | 'yellow' | 'orange';
  style?: 'solid' | 'dashed' | 'dotted';
}

interface GuidanceTooltip {
  square: string;
  message: string;
  type: 'hint' | 'instruction' | 'warning' | 'success';
}

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
  
  // 🎯 Guided Learning Enhancements
  moveArrows?: MoveArrow[];
  guidanceHighlights?: Array<{
    square: string;
    color: 'suggest' | 'require' | 'avoid' | 'good' | 'bad';
    animation?: 'pulse' | 'glow' | 'bounce' | 'none';
  }>;
  restrictedMoves?: string[]; // Only these moves allowed
  onMoveAttempt?: (move: { from: string; to: string }) => 'allowed' | 'hint' | 'blocked' | 'wrong-piece';
  guidanceTooltip?: GuidanceTooltip;
  stepExplanation?: {
    title: string;
    description: string;
    position: 'top' | 'bottom' | 'left' | 'right';
  };
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
  
  // 🎯 Guided Learning Props
  moveArrows = [],
  guidanceHighlights = [],
  restrictedMoves,
  onMoveAttempt,
  guidanceTooltip,
  stepExplanation,
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

  // 🎯 Helper to merge guidance highlights with option squares
  const getMergedSquareStyles = useCallback(() => {
    const merged = { ...optionSquares };
    
    // Add guidance highlights
    guidanceHighlights.forEach(highlight => {
      const baseStyle = merged[highlight.square] || {};
      const guidanceStyles = {
        suggest: { 
          background: 'var(--color-board-legal-move)',
          border: '3px solid var(--color-accent-primary)'
        },
        require: { 
          background: 'var(--color-success-subtle)',
          border: '3px solid var(--color-success)',
          boxShadow: '0 0 15px var(--color-success-subtle)'
        },
        avoid: { 
          background: 'var(--color-danger-subtle)',
          border: '3px solid var(--color-danger)'
        },
        good: { 
          background: 'var(--color-success-subtle)',
          border: '3px solid var(--color-success)'
        },
        bad: { 
          background: 'var(--color-warning-subtle)',
          border: '3px solid var(--color-warning)'
        }
      };
      
      merged[highlight.square] = {
        ...baseStyle,
        ...guidanceStyles[highlight.color]
      };
    });
    
    return merged;
  }, [optionSquares, guidanceHighlights]);

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
                radial-gradient(circle, var(--color-success) 25%, transparent 25%),
                radial-gradient(circle, var(--color-surface-overlay) 85%, transparent 85%)
              `,
              borderRadius: '50%',
            };
          });
          newSquares[square] = { 
            background: 'var(--color-board-highlight)',
            border: '2px solid var(--color-accent-primary)',
            boxShadow: '0 0 10px var(--color-accent-subtle)'
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

  // ENHANCED: Move validation with guided learning support
  const attemptMove = useCallback((from: Square, to: Square, promotion = 'q') => {
    try {
      console.log('ChessBoard: Validating move', from, to, promotion);
      
      // 🎯 Guided Learning: Check if move is in restricted moves list
      if (restrictedMoves && restrictedMoves.length > 0) {
        const moveStr = `${from}${to}`;
        if (!restrictedMoves.includes(moveStr)) {
          // Call guidance callback for feedback
          const guidance = onMoveAttempt?.({ from, to });
          
          if (guidance === 'blocked') {
            if (enableGamification) {
              setShowIllegalMove(true);
              setTimeout(() => setShowIllegalMove(false), 1500);
            }
            resetSelection();
            return false;
          } else if (guidance === 'hint') {
            // Show hint but don't make the move
            setHintMessage('Try a different move - look for the highlighted squares!');
            setTimeout(() => setHintMessage(''), 3000);
            resetSelection();
            return false;
          } else if (guidance === 'wrong-piece') {
            setHintMessage('Try moving the highlighted piece instead!');
            setTimeout(() => setHintMessage(''), 3000);
            resetSelection();
            return false;
          }
        }
      }
      
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

      // 🎯 Guided Learning: Notify guidance callback of successful move
      onMoveAttempt?.({ from, to });

      // Notify parent to handle the actual move and all state changes
      onMove?.({ from, to, promotion });
      return true;

    } catch (error) {
      console.error('ChessBoard: Move validation error:', error);
      resetSelection();
      return false;
    }
  }, [game, resetSelection, puzzleMode, correctMoves, onCorrectMove, onIncorrectMove, onMove, restrictedMoves, onMoveAttempt]);

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
          className="relative w-full max-w-full rounded-lg p-2"
          style={{
            aspectRatio: '1',
            backgroundColor: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border-default)',
            boxShadow: 'var(--elevation-card)'
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
                squareStyles: getMergedSquareStyles(),
                allowDragging: !disabled,
                animationDurationInMs: 300,
                boardStyle: {
                  borderRadius: '14px',
                  boxShadow: 'var(--elevation-card)',
                  border: '1px solid var(--color-border-default)',
                },
                lightSquareStyle: {
                  backgroundColor: 'var(--color-board-light)',
                },
                darkSquareStyle: {
                  backgroundColor: 'var(--color-board-dark)',
                },
              }}
            />
          </div>
          
          {/* Coordinates and status display */}
          {showCoordinates && (
            <div className="absolute -bottom-8 left-0 right-0 text-center">
              <div className="text-sm font-secondary" style={{ color: 'var(--color-text-secondary)' }}>
                Turn: {game.turn() === 'w' ? 'White' : 'Black'}
                {game.isCheck() && <span className="text-warning font-medium"> | Check!</span>}
                {game.isGameOver() && <span className="text-danger font-medium"> | Game Over!</span>}
              </div>
            </div>
          )}

          {/* Hint message display */}
          {hintMessage && (
            <div className="absolute -top-12 left-0 right-0 text-center">
              <div className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium shadow-card font-secondary">
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

          {/* 🎯 Guided Learning: Enhanced Square Highlights */}
          {guidanceHighlights.length > 0 && (
            <div className="absolute inset-0 pointer-events-none">
              {guidanceHighlights.map((highlight, index) => {
                const file = highlight.square.charCodeAt(0) - 97;
                const rank = parseInt(highlight.square[1]) - 1;
                const squareSize = 100 / 8; // Each square is 1/8th of the board
                
                const colorStyles = {
                  suggest: 'border-blue-400 bg-blue-200 bg-opacity-40',
                  require: 'border-green-500 bg-green-300 bg-opacity-60',
                  avoid: 'border-red-500 bg-red-200 bg-opacity-40',
                  good: 'border-emerald-400 bg-emerald-200 bg-opacity-50',
                  bad: 'border-orange-500 bg-orange-200 bg-opacity-40'
                };

                const animationStyles = {
                  pulse: 'animate-pulse',
                  glow: 'shadow-lg shadow-current',
                  bounce: 'animate-bounce',
                  none: ''
                };

                return (
                  <div
                    key={`guidance-${index}`}
                    className={`absolute border-4 rounded ${colorStyles[highlight.color]} ${animationStyles[highlight.animation || 'none']}`}
                    style={{
                      left: `${file * squareSize}%`,
                      top: `${(7 - rank) * squareSize}%`,
                      width: `${squareSize}%`,
                      height: `${squareSize}%`,
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* 🎯 Guided Learning: Move Arrows */}
          {moveArrows.length > 0 && (
            <div className="absolute inset-0 pointer-events-none">
              <svg className="w-full h-full">
                {moveArrows.map((arrow, index) => {
                  const fromFile = arrow.from.charCodeAt(0) - 97;
                  const fromRank = parseInt(arrow.from[1]) - 1;
                  const toFile = arrow.to.charCodeAt(0) - 97;
                  const toRank = parseInt(arrow.to[1]) - 1;
                  
                  const squareSize = 100 / 8;
                  const centerOffset = squareSize / 2;
                  
                  const x1 = fromFile * squareSize + centerOffset;
                  const y1 = (7 - fromRank) * squareSize + centerOffset;
                  const x2 = toFile * squareSize + centerOffset;
                  const y2 = (7 - toRank) * squareSize + centerOffset;

                  const arrowColors = {
                    green: 'var(--color-success)',
                    blue: 'var(--color-accent-primary)', 
                    red: 'var(--color-danger)',
                    yellow: 'var(--color-warning)',
                    orange: '#F97316'
                  };

                  return (
                    <g key={`arrow-${index}`}>
                      {/* Arrow line */}
                      <line
                        x1={`${x1}%`}
                        y1={`${y1}%`}
                        x2={`${x2}%`}
                        y2={`${y2}%`}
                        stroke={arrowColors[arrow.color]}
                        strokeWidth="3"
                        strokeDasharray={arrow.style === 'dashed' ? '10 5' : arrow.style === 'dotted' ? '3 3' : 'none'}
                        markerEnd="url(#arrowhead)"
                      />
                      {/* Arrowhead marker */}
                      <defs>
                        <marker
                          id="arrowhead"
                          markerWidth="10"
                          markerHeight="7"
                          refX="9"
                          refY="3.5"
                          orient="auto"
                        >
                          <polygon
                            points="0 0, 10 3.5, 0 7"
                            fill={arrowColors[arrow.color]}
                          />
                        </marker>
                      </defs>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}

          {/* 🎯 Guided Learning: Guidance Tooltip */}
          {guidanceTooltip && (
            <div className="absolute inset-0 pointer-events-none">
              {(() => {
                const file = guidanceTooltip.square.charCodeAt(0) - 97;
                const rank = parseInt(guidanceTooltip.square[1]) - 1;
                const squareSize = 100 / 8;
                
                const tooltipStyles = {
                  hint: 'bg-accent text-white',
                  instruction: 'bg-success text-white',
                  warning: 'bg-danger text-white',
                  success: 'bg-success text-white'
                };

                return (
                  <div
                    className={`absolute z-20 px-3 py-2 rounded-lg shadow-lg text-sm font-medium ${tooltipStyles[guidanceTooltip.type]} pointer-events-none`}
                    style={{
                      left: `${file * squareSize + squareSize/2}%`,
                      top: `${(7 - rank) * squareSize - 10}%`,
                      transform: 'translateX(-50%) translateY(-100%)',
                    }}
                  >
                    {guidanceTooltip.message}
                    <div 
                      className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent"
                      style={{
                        borderTopColor: guidanceTooltip.type === 'hint' ? '#3B82F6' : 
                                       guidanceTooltip.type === 'instruction' ? '#10B981' :
                                       guidanceTooltip.type === 'warning' ? '#EF4444' : '#059669'
                      }}
                    />
                  </div>
                );
              })()}
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

        {/* 🎯 Guided Learning: Step Explanation Panel */}
        {stepExplanation && (
          <div className={`mt-4 ${
            stepExplanation.position === 'top' ? '-mt-8 mb-4' :
            stepExplanation.position === 'bottom' ? 'mt-4' :
            stepExplanation.position === 'left' ? 'absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-full mr-4 w-64' :
            'absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-full ml-4 w-64'
          }`}>
            <div 
              className="text-white rounded-lg p-4"
              style={{
                backgroundColor: 'var(--color-accent-primary)',
                boxShadow: 'var(--elevation-card)'
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🎯</span>
                <h3 className="font-bold text-lg font-primary">{stepExplanation.title}</h3>
              </div>
              <p className="text-white/90 leading-relaxed font-secondary">{stepExplanation.description}</p>
              
              {/* Arrow pointer for side panels */}
              {(stepExplanation.position === 'left' || stepExplanation.position === 'right') && (
                <div 
                  className={`absolute top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-transparent ${
                    stepExplanation.position === 'left' 
                      ? 'right-0 translate-x-full border-l-8 border-accent' 
                      : 'left-0 -translate-x-full border-r-8 border-accent'
                  }`}
                />
              )}
            </div>
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

// Export guided learning types for use in other components
export type { MoveArrow, GuidanceTooltip };