/**
 * Move Explanation System
 * Advanced explanation and animation system for guided chess practice
 * Provides contextual move analysis, visual highlights, and interactive learning
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chess } from 'chess.js';
import { chessAnimationService, type MoveExplanationAnimation } from '../../services/chessAnimationService';
import { FadeIn, Pulse } from '../ui/AnimationUtils';

interface MoveContext {
  move: string;
  san: string;
  piece: string;
  from: string;
  to: string;
  captured?: string;
  isCheck: boolean;
  isCheckmate: boolean;
  gamePhase: 'opening' | 'middlegame' | 'endgame';
}

interface ExplanationData {
  primary: string;
  secondary?: string;
  tacticalThemes: string[];
  strategicConcepts: string[];
  teachingPoints: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  visualHighlights: Array<{
    squares: string[];
    color: 'green' | 'blue' | 'red';
    label: string;
  }>;
  arrows: Array<{
    from: string;
    to: string;
    color: string;
    label?: string;
  }>;
}

interface MoveExplanationProps {
  moveContext: MoveContext;
  position: string; // FEN
  isVisible: boolean;
  onAnimationComplete?: () => void;
  interactive?: boolean;
  lesson?: {
    theme: string;
    objectives: string[];
  };
}

export const MoveExplanationSystem: React.FC<MoveExplanationProps> = ({
  moveContext,
  position,
  isVisible,
  onAnimationComplete,
  interactive = true,
  lesson
}) => {
  const [explanation, setExplanation] = useState<ExplanationData | null>(null);
  const [currentHighlight, setCurrentHighlight] = useState<number>(-1);
  const [isAnimating, setIsAnimating] = useState(false);
  const explanationRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generate explanation when move context changes
  useEffect(() => {
    if (moveContext && position) {
      const generatedExplanation = generateMoveExplanation(moveContext, position, lesson);
      setExplanation(generatedExplanation);
      setCurrentHighlight(-1);
    }
  }, [moveContext, position, lesson]);

  // Auto-advance explanation highlights
  useEffect(() => {
    if (isVisible && explanation && interactive) {
      setIsAnimating(true);
      
      const advanceHighlight = (index: number) => {
        setCurrentHighlight(index);
        
        if (index < explanation.visualHighlights.length - 1) {
          timeoutRef.current = setTimeout(() => {
            advanceHighlight(index + 1);
          }, 2500);
        } else {
          timeoutRef.current = setTimeout(() => {
            setIsAnimating(false);
            onAnimationComplete?.();
          }, 2000);
        }
      };
      
      timeoutRef.current = setTimeout(() => {
        advanceHighlight(0);
      }, 500);
      
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [isVisible, explanation, interactive, onAnimationComplete]);

  const generateMoveExplanation = (
    context: MoveContext,
    fen: string,
    lessonContext?: { theme: string; objectives: string[] }
  ): ExplanationData => {
    const chess = new Chess(fen);
    const board = chess.board();
    
    // Basic move description
    let primary = `${context.san} `;
    
    // Add capture description
    if (context.captured) {
      primary += `captures the ${getPieceName(context.captured)}, `;
    }
    
    // Add check description
    if (context.isCheckmate) {
      primary += 'delivering checkmate!';
    } else if (context.isCheck) {
      primary += 'putting the king in check.';
    } else {
      primary += getContextualDescription(context, chess, lessonContext);
    }

    const explanation: ExplanationData = {
      primary,
      secondary: getSecondaryExplanation(context, chess),
      tacticalThemes: identifyTacticalThemes(context, chess),
      strategicConcepts: identifyStrategicConcepts(context, chess),
      teachingPoints: generateTeachingPoints(context, chess, lessonContext),
      difficulty: calculateDifficulty(context, chess),
      visualHighlights: generateVisualHighlights(context, chess),
      arrows: generateExplanationArrows(context, chess)
    };

    return explanation;
  };

  const getPieceName = (piece: string): string => {
    const names = {
      'p': 'pawn', 'n': 'knight', 'b': 'bishop',
      'r': 'rook', 'q': 'queen', 'k': 'king'
    };
    return names[piece.toLowerCase() as keyof typeof names] || 'piece';
  };

  const getContextualDescription = (
    context: MoveContext,
    chess: Chess,
    lessonContext?: { theme: string; objectives: string[] }
  ): string => {
    const { piece, from, to, gamePhase } = context;
    
    // Opening phase descriptions
    if (gamePhase === 'opening') {
      if (piece === 'p' && (to.includes('4') || to.includes('5'))) {
        return 'This controls the center, following key opening principles.';
      }
      if (piece === 'n' && chess.history().length < 6) {
        return 'This develops a knight toward the center, improving piece activity.';
      }
      if (context.san.includes('O-O')) {
        return 'Castling keeps the king safe while connecting the rooks.';
      }
    }
    
    // Middlegame descriptions
    if (gamePhase === 'middlegame') {
      if (context.captured) {
        return 'This wins material, which is often decisive.';
      }
      
      // Check if move improves piece position
      const fromSquareValue = getSquareValue(from);
      const toSquareValue = getSquareValue(to);
      if (toSquareValue > fromSquareValue) {
        return 'This improves the piece\'s position and activity.';
      }
    }
    
    // Endgame descriptions
    if (gamePhase === 'endgame') {
      if (piece === 'k') {
        return 'In endgames, the king becomes an active piece.';
      }
      if (piece === 'p') {
        return 'Advancing pawns toward promotion is key in endgames.';
      }
    }
    
    return 'This move improves the position.';
  };

  const getSquareValue = (square: string): number => {
    const file = square.charCodeAt(0) - 'a'.charCodeAt(0);
    const rank = parseInt(square[1]) - 1;
    // Center squares have higher value
    const centerDistance = Math.abs(3.5 - file) + Math.abs(3.5 - rank);
    return 7 - centerDistance;
  };

  const getSecondaryExplanation = (context: MoveContext, chess: Chess): string => {
    const moves = chess.moves({ verbose: true });
    const alternatives = moves.filter(m => m.from === context.from && m.to !== context.to);
    
    if (alternatives.length > 0) {
      return `Alternative moves from ${context.from} included ${alternatives.slice(0, 2).map(m => m.san).join(', ')}.`;
    }
    
    return '';
  };

  const identifyTacticalThemes = (context: MoveContext, chess: Chess): string[] => {
    const themes: string[] = [];
    
    if (context.captured) themes.push('Material Gain');
    if (context.isCheck) themes.push('Check');
    if (context.isCheckmate) themes.push('Checkmate');
    
    // Simple fork detection
    const newChess = new Chess(chess.fen());
    newChess.move(context.move);
    const attacks = getSquareAttacks(newChess, context.to);
    if (attacks.length >= 2) {
      themes.push('Fork');
    }
    
    return themes;
  };

  const identifyStrategicConcepts = (context: MoveContext, chess: Chess): string[] => {
    const concepts: string[] = [];
    
    if (context.gamePhase === 'opening') {
      if (context.piece === 'p' && (context.to.includes('4') || context.to.includes('5'))) {
        concepts.push('Center Control');
      }
      if (['n', 'b'].includes(context.piece)) {
        concepts.push('Piece Development');
      }
    }
    
    if (context.san.includes('O-O')) {
      concepts.push('King Safety');
    }
    
    return concepts;
  };

  const generateTeachingPoints = (
    context: MoveContext,
    chess: Chess,
    lessonContext?: { theme: string; objectives: string[] }
  ): string[] => {
    const points: string[] = [];
    
    if (context.gamePhase === 'opening') {
      points.push('Opening principles: Control center, develop pieces, castle early!');
    }
    
    if (context.captured) {
      points.push('Always look for material-winning opportunities.');
    }
    
    if (context.isCheck) {
      points.push('Checks are forcing moves that limit opponent options.');
    }
    
    // Add lesson-specific teaching points
    if (lessonContext?.objectives) {
      points.push(...lessonContext.objectives.slice(0, 2));
    }
    
    return points;
  };

  const calculateDifficulty = (context: MoveContext, chess: Chess): 1 | 2 | 3 | 4 | 5 => {
    let difficulty = 1;
    
    if (context.captured) difficulty += 1;
    if (context.isCheck) difficulty += 1;
    if (context.isCheckmate) difficulty += 2;
    if (chess.history().length > 20) difficulty += 1;
    
    return Math.min(5, difficulty) as 1 | 2 | 3 | 4 | 5;
  };

  const generateVisualHighlights = (context: MoveContext, chess: Chess) => {
    const highlights = [
      {
        squares: [context.from],
        color: 'blue' as const,
        label: 'Starting square'
      },
      {
        squares: [context.to],
        color: context.captured ? 'red' as const : 'green' as const,
        label: context.captured ? 'Capture square' : 'Destination square'
      }
    ];
    
    // Add squares the piece now attacks
    const newChess = new Chess(chess.fen());
    newChess.move(context.move);
    const attacks = getSquareAttacks(newChess, context.to);
    
    if (attacks.length > 0) {
      highlights.push({
        squares: attacks,
        color: 'blue' as const,
        label: 'Squares now under attack'
      });
    }
    
    return highlights;
  };

  const generateExplanationArrows = (context: MoveContext, chess: Chess) => {
    return [
      {
        from: context.from,
        to: context.to,
        color: '#22c55e',
        label: 'Move direction'
      }
    ];
  };

  const getSquareAttacks = (chess: Chess, square: string): string[] => {
    const attacks: string[] = [];
    try {
      const piece = chess.get(square as any);
      
      if (!piece) return attacks;
      
      // This is a simplified implementation
      // In a full version, you'd analyze all squares the piece can attack
      const moves = chess.moves({ verbose: true, square: square as any });
      return moves.filter((m: any) => m.captured).map((m: any) => m.to);
    } catch (error) {
      console.warn('Error getting square attacks:', error);
      return attacks;
    }
  };

  if (!explanation || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={explanationRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="move-explanation-system bg-white rounded-lg shadow-lg border border-gray-200 p-6"
      >
        {/* Main Explanation */}
        <div className="mb-4">
          <FadeIn direction="up">
            <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
              <span className="text-2xl">🧠</span>
              Move Analysis: {moveContext.san}
            </h3>
            <p className="text-gray-700 text-base leading-relaxed">
              {explanation.primary}
            </p>
            {explanation.secondary && (
              <p className="text-gray-600 text-sm mt-2">
                {explanation.secondary}
              </p>
            )}
          </FadeIn>
        </div>

        {/* Difficulty Indicator */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Difficulty:</span>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < explanation.difficulty ? 'bg-yellow-400' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Visual Highlights */}
        {explanation.visualHighlights.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span>👁️</span> Visual Analysis
            </h4>
            <div className="space-y-2">
              {explanation.visualHighlights.map((highlight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ 
                    opacity: currentHighlight === index ? 1 : 0.6,
                    x: 0,
                    scale: currentHighlight === index ? 1.02 : 1
                  }}
                  className={`p-3 rounded-lg border-l-4 ${
                    currentHighlight === index ? 'bg-blue-50 border-blue-400' : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full bg-${highlight.color}-400`} />
                    <div>
                      <div className="font-medium text-sm text-gray-800">
                        {highlight.label}
                      </div>
                      <div className="text-xs text-gray-600">
                        Squares: {highlight.squares.join(', ')}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Tactical Themes */}
        {explanation.tacticalThemes.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <span>⚡</span> Tactical Themes
            </h4>
            <div className="flex flex-wrap gap-2">
              {explanation.tacticalThemes.map((theme, index) => (
                <FadeIn key={theme} delay={index * 100} direction="scale">
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                    {theme}
                  </span>
                </FadeIn>
              ))}
            </div>
          </div>
        )}

        {/* Strategic Concepts */}
        {explanation.strategicConcepts.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <span>🎯</span> Strategic Concepts
            </h4>
            <div className="flex flex-wrap gap-2">
              {explanation.strategicConcepts.map((concept, index) => (
                <FadeIn key={concept} delay={index * 100} direction="scale">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {concept}
                  </span>
                </FadeIn>
              ))}
            </div>
          </div>
        )}

        {/* Teaching Points */}
        {explanation.teachingPoints.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
            <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
              <span>💡</span> Key Learning Points
            </h4>
            <ul className="space-y-2">
              {explanation.teachingPoints.map((point, index) => (
                <FadeIn key={index} delay={index * 200} direction="left">
                  <li className="flex items-start gap-2 text-sm text-green-700">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>{point}</span>
                  </li>
                </FadeIn>
              ))}
            </ul>
          </div>
        )}

        {/* Animation Status */}
        {isAnimating && (
          <div className="mt-4 flex items-center justify-center">
            <Pulse active={true}>
              <div className="flex items-center gap-2 text-blue-600 text-sm">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                Analyzing position...
              </div>
            </Pulse>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default MoveExplanationSystem;