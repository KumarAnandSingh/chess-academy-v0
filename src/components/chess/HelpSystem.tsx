import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Button } from '../ui/button';
import { HelpCircle, Lightbulb, Target } from 'lucide-react';

interface HelpSystemProps {
  game: Chess;
  onHighlightSquare: (square: string) => void;
  onShowHint: (hint: string) => void;
  disabled?: boolean;
  maxAttempts?: number;
}

export const HelpSystem: React.FC<HelpSystemProps> = ({
  game,
  onHighlightSquare,
  onShowHint,
  disabled = false,
  maxAttempts = 5
}) => {
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [isWaiting, setIsWaiting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

  // Auto-help timer (10 seconds of inactivity)
  useEffect(() => {
    if (disabled) return;
    
    let timer: number;
    
    const startWaitTimer = () => {
      setIsWaiting(true);
      setTimeRemaining(10);
      
      timer = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsWaiting(false);
            setShowHelp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };
    
    // Start timer when component mounts or game changes
    startWaitTimer();
    
    return () => {
      if (timer) clearInterval(timer);
      setIsWaiting(false);
    };
  }, [game.fen(), disabled]);

  // Reset help when game changes significantly
  useEffect(() => {
    setAttemptsUsed(0);
    setShowHelp(false);
  }, [game.fen()]);

  const getBestMove = () => {
    const moves = game.moves({ verbose: true });
    if (moves.length === 0) return null;
    
    // Simple evaluation: prioritize captures, checks, then center moves
    const sortedMoves = moves.sort((a, b) => {
      let scoreA = 0, scoreB = 0;
      
      // Prioritize captures
      if (a.captured) scoreA += 10;
      if (b.captured) scoreB += 10;
      
      // Prioritize checks
      if (a.san.includes('+')) scoreA += 8;
      if (b.san.includes('+')) scoreB += 8;
      
      // Prioritize center squares
      const centerSquares = ['e4', 'e5', 'd4', 'd5', 'f4', 'f5', 'c4', 'c5'];
      if (centerSquares.includes(a.to)) scoreA += 5;
      if (centerSquares.includes(b.to)) scoreB += 5;
      
      // Prioritize piece development
      if (a.piece === 'n' || a.piece === 'b') scoreA += 3;
      if (b.piece === 'n' || b.piece === 'b') scoreB += 3;
      
      return scoreB - scoreA;
    });
    
    return sortedMoves[0];
  };

  const getHintMessage = (level: number) => {
    const bestMove = getBestMove();
    if (!bestMove) return "No moves available!";
    
    const hints = [
      `Look for moves with your ${bestMove.piece === 'p' ? 'pawn' : bestMove.piece === 'n' ? 'knight' : bestMove.piece === 'b' ? 'bishop' : bestMove.piece === 'r' ? 'rook' : bestMove.piece === 'q' ? 'queen' : 'king'}`,
      `Consider the ${bestMove.from} square`,
      `Try moving from ${bestMove.from}`,
      `Move your piece to ${bestMove.to}`,
      `The best move is ${bestMove.san}!`
    ];
    
    return hints[Math.min(level, hints.length - 1)];
  };

  const handleHelpClick = () => {
    if (attemptsUsed >= maxAttempts || disabled) return;
    
    const newAttempts = attemptsUsed + 1;
    setAttemptsUsed(newAttempts);
    
    const bestMove = getBestMove();
    if (!bestMove) return;
    
    // Progressive hints
    if (newAttempts <= 2) {
      // First 2 attempts: highlight the piece to move
      onHighlightSquare(bestMove.from);
      onShowHint(getHintMessage(newAttempts - 1));
    } else if (newAttempts <= 4) {
      // Next 2 attempts: show both from and to squares
      onHighlightSquare(bestMove.from);
      setTimeout(() => onHighlightSquare(bestMove.to), 500);
      onShowHint(getHintMessage(newAttempts - 1));
    } else {
      // Final attempt: show the exact move
      onHighlightSquare(bestMove.from);
      setTimeout(() => onHighlightSquare(bestMove.to), 500);
      onShowHint(getHintMessage(4));
    }
  };

  const isHelpAvailable = attemptsUsed < maxAttempts && !disabled;

  return (
    <div className="relative">
      {/* Auto-help timer display */}
      {isWaiting && !showHelp && (
        <div className="fixed top-4 right-4 z-50 bg-yellow-100 border border-yellow-400 rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 text-yellow-800">
            <Lightbulb className="h-4 w-4" />
            <span className="text-sm">
              Need help? Auto-hint in <span className="font-bold">{timeRemaining}s</span>
            </span>
          </div>
        </div>
      )}

      {/* Help available notification */}
      {showHelp && isHelpAvailable && (
        <div className="fixed top-4 right-4 z-50 bg-blue-100 border border-blue-400 rounded-lg p-3 shadow-lg animate-pulse">
          <div className="flex items-center gap-2 text-blue-800">
            <HelpCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Help is available!</span>
          </div>
        </div>
      )}

      {/* Help button */}
      <div className="flex items-center gap-2">
        <Button
          onClick={handleHelpClick}
          disabled={!isHelpAvailable}
          variant={showHelp ? "primary" : "outline"}
          size="sm"
          className={`${showHelp ? 'animate-bounce' : ''} ${
            !isHelpAvailable ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Target className="h-4 w-4 mr-1" />
          Help ({maxAttempts - attemptsUsed} left)
        </Button>
        
        {attemptsUsed > 0 && (
          <div className="text-xs text-gray-600">
            Hints used: {attemptsUsed}/{maxAttempts}
          </div>
        )}
      </div>
    </div>
  );
};