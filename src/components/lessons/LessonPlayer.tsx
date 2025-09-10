import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { ChessBoard } from '../chess/ChessBoard';
import { Chess } from 'chess.js';
import { getChessEngine, type EngineMove, type BotLevel } from '../../services/chessEngine';
import { getGuidedPracticeBot, type GuidedMoveResult } from '../../services/guidedPracticeBot';
import { chessAnimationService } from '../../services/chessAnimationService';
import MoveExplanationSystem from '../chess/MoveExplanationSystem';

// 🐛 Error Boundary for debugging crashes
class GuidedPracticeErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error) => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; onError?: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('🚨 GuidedPractice Error Boundary caught:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 GuidedPractice componentDidCatch:', error, errorInfo);
    console.error('🚨 Error stack:', error.stack);
    console.error('🚨 Component stack:', errorInfo.componentStack);
    console.error('🚨 Error details:', {
      name: error.name,
      message: error.message,
      cause: error.cause
    });
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800 mb-4">
            🚨 Guided Practice Error
          </h3>
          <p className="text-red-700 mb-4">
            Something went wrong in the guided practice lesson.
          </p>
          <details className="text-left text-sm text-red-600 mb-4">
            <summary className="cursor-pointer font-medium">Error Details:</summary>
            <pre className="mt-2 p-2 bg-red-100 rounded overflow-auto">
              {this.state.error?.toString()}
            </pre>
          </details>
          <Button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mr-2"
          >
            Try Again
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

interface LessonModule {
  id: string;
  title: string;
  type: 'theory' | 'interactive' | 'puzzle' | 'quiz' | 'guided-practice';
  content: string;
  fen?: string;
  moves?: string[];
  questions?: Array<{
    question: string;
    options: string[];
    correct: number;
    explanation: string;
  }>;
  // 🎯 Guided Practice Fields
  guidedPractice?: GuidedPracticeData;
}

interface GuidedPracticeStep {
  id: string;
  stepType: 'user-move' | 'computer-move' | 'explanation' | 'choice';
  title: string;
  description: string;
  
  // Visual guidance
  moveArrows?: Array<{
    from: string;
    to: string;
    color: 'green' | 'blue' | 'red' | 'yellow' | 'orange';
    style?: 'solid' | 'dashed' | 'dotted';
  }>;
  
  highlightSquares?: Array<{
    square: string;
    color: 'suggest' | 'require' | 'avoid' | 'good' | 'bad';
    animation?: 'pulse' | 'glow' | 'bounce' | 'none';
  }>;
  
  tooltip?: {
    square: string;
    message: string;
    type: 'hint' | 'instruction' | 'warning' | 'success';
  };
  
  // Move restrictions
  allowedMoves?: string[]; // Only these moves allowed
  suggestedMove?: string; // Best move for the position
  
  // Computer behavior
  computerMove?: string; // Move computer will make
  botLevel?: number; // 1-10 difficulty for dynamic response
  
  // Conditional logic
  nextStepConditions?: {
    onCorrectMove?: string; // Next step ID if correct
    onIncorrectMove?: string; // Next step ID if incorrect  
    onTimeout?: string; // Next step ID if time runs out
  };
  
  // Timing
  timeLimit?: number; // Seconds before auto-advance
  
  // Multiple choice for decision points
  choices?: Array<{
    text: string;
    nextStep: string;
    explanation: string;
  }>;
}

interface GuidedPracticeData {
  initialFen: string;
  botLevel: number; // Default bot difficulty
  steps: GuidedPracticeStep[];
  
  // Learning objectives
  objectives: string[];
  theme: string; // "Opening Development", "Tactical Patterns", etc.
  
  // Success criteria
  successCriteria: {
    minCorrectMoves: number;
    maxMistakes: number;
    timeBonus?: boolean;
  };
}

interface LessonData {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  duration: number;
  modules: LessonModule[];
  objectives: string[];
}

interface LessonPlayerProps {
  lesson: LessonData;
  onComplete?: () => void;
  onClose?: () => void;
  onProgress?: (progress: number) => void;
}

interface GuidedPracticePlayerProps {
  guidedPractice: GuidedPracticeData;
  onComplete?: () => void;
}

// 🎯 Guided Practice Player Component
const GuidedPracticePlayer: React.FC<GuidedPracticePlayerProps> = ({ 
  guidedPractice, 
  onComplete 
}) => {
  // 🐛 DEBUG: Log incoming data
  console.log('🎯 GuidedPracticePlayer rendered with:', { guidedPractice, onComplete });
  
  // Early validation with detailed logging
  if (!guidedPractice) {
    console.error('❌ GuidedPractice data is null/undefined');
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Error: Guided practice data is missing.</p>
        <Button onClick={() => onComplete?.()} className="mt-4">
          Return to Lessons
        </Button>
      </div>
    );
  }
  
  if (!guidedPractice.steps) {
    console.error('❌ GuidedPractice steps are missing:', guidedPractice);
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Error: Guided practice steps are missing.</p>
        <Button onClick={() => onComplete?.()} className="mt-4">
          Return to Lessons
        </Button>
      </div>
    );
  }
  
  if (guidedPractice.steps.length === 0) {
    console.error('❌ GuidedPractice steps array is empty:', guidedPractice);
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Error: No guided practice steps found.</p>
        <Button onClick={() => onComplete?.()} className="mt-4">
          Return to Lessons
        </Button>
      </div>
    );
  }
  
  console.log('✅ GuidedPractice validation passed, steps:', guidedPractice.steps.length);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [game, setGame] = useState<Chess | null>(null);
  const [correctMoves, setCorrectMoves] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [stepTimer, setStepTimer] = useState<number | null>(null);
  const [isWaitingForComputer, setIsWaitingForComputer] = useState(false);
  const [chessEngine] = useState(() => {
    try {
      return getChessEngine();
    } catch (error) {
      console.error('Failed to initialize chess engine:', error);
      return null;
    }
  });
  const [practiceBot] = useState(() => {
    try {
      return getGuidedPracticeBot();
    } catch (error) {
      console.error('Failed to initialize practice bot:', error);
      return null;
    }
  });
  const [engineReady, setEngineReady] = useState(false);
  const [lastComputerMove, setLastComputerMove] = useState<GuidedMoveResult | null>(null);
  const [showMoveExplanation, setShowMoveExplanation] = useState(false);
  const [moveContext, setMoveContext] = useState<any>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const currentStep = guidedPractice.steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / guidedPractice.steps.length) * 100;
  
  // Log current step for debugging
  console.log('🎯 Current step:', { 
    currentStepIndex, 
    currentStep: currentStep?.id, 
    stepType: currentStep?.stepType,
    totalSteps: guidedPractice.steps.length 
  });

  // Initialize game state with better error handling
  useEffect(() => {
    console.log('🎯 Initializing game state with FEN:', guidedPractice.initialFen);
    
    try {
      // Always start with the standard starting position for guided practice
      const initialGame = new Chess();
      console.log('✅ Chess game created with starting position');
      console.log('✅ Initial FEN:', initialGame.fen());
      console.log('✅ Initial legal moves:', initialGame.moves());
      
      setGame(initialGame);
      setEngineReady(false); // Use pre-defined moves mode
      
      console.log('✅ Game state initialized successfully');
    } catch (error) {
      console.error('❌ Failed to create Chess game:', error);
      throw error; // Let the error boundary catch this
    }
  }, []);

  // Handle step timer
  useEffect(() => {
    if (currentStep?.timeLimit && currentStep.stepType !== 'user-move') {
      setStepTimer(currentStep.timeLimit);
      const timer = setInterval(() => {
        setStepTimer((prev) => {
          if (prev && prev > 1) {
            return prev - 1;
          } else {
            handleStepComplete();
            return null;
          }
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [currentStepIndex]);

  const handleStepComplete = () => {
    if (currentStepIndex < guidedPractice.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setStepTimer(null);
    } else {
      // Lesson complete
      onComplete?.();
    }
  };

  const handleUserMove = (move: { from: string; to: string; promotion?: string }) => {
    console.log('🎯 handleUserMove called with:', { move, currentStep: currentStep?.stepType, gameExists: !!game });
    
    try {
      // Enhanced validation to prevent crashes
      if (!game || !move || !move.from || !move.to || !currentStep || currentStep.stepType !== 'user-move') {
        console.warn('❌ Invalid move attempt:', { 
          gameExists: !!game, 
          move, 
          currentStepType: currentStep?.stepType,
          currentStepId: currentStep?.id
        });
        return;
      }
      
      const moveStr = `${move.from}${move.to}`;
      
      // Check if move is allowed
      if (currentStep.allowedMoves && !currentStep.allowedMoves.includes(moveStr)) {
        setMistakes(prev => prev + 1);
        return; // Move will be blocked by ChessBoard component
      }
      
      // Make the move with comprehensive error handling and logging
      console.log(`🎯 User attempting move: ${moveStr} from position: ${game.fen()}`);
      
      const currentFen = game.fen();
      if (!currentFen) {
        console.error('Invalid game state - no FEN available');
        return;
      }
      
      const newGame = new Chess(currentFen);
      console.log(`🎯 Legal moves for user:`, newGame.moves());
      
      const moveResult = newGame.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion || 'q'
      });
      
      if (moveResult) {
        console.log(`✅ User move executed successfully: ${moveResult.san}`);
        console.log(`✅ New position after user move: ${newGame.fen()}`);
        setGame(newGame);
        setCorrectMoves(prev => prev + 1);
        
        // Move to next step immediately for better UX
        setTimeout(() => {
          try {
            handleStepComplete();
          } catch (error) {
            console.error('Error completing step:', error);
          }
        }, 200);
      } else {
        console.error('❌ Invalid user move attempted:', moveStr);
        console.error('❌ Available moves:', newGame.moves());
        setMistakes(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error in handleUserMove:', error);
      setMistakes(prev => prev + 1);
    }
  };

  const handleMoveAttempt = (move: { from: string; to: string }) => {
    console.log('🎯 handleMoveAttempt called with:', { 
      move, 
      currentStepType: currentStep?.stepType,
      allowedMoves: currentStep?.allowedMoves,
      currentStepId: currentStep?.id
    });
    
    try {
      if (!currentStep || !currentStep.allowedMoves || !move?.from || !move?.to) {
        console.log('🎯 Move attempt: allowing (no restrictions or missing data)');
        return 'allowed';
      }
      
      const moveStr = `${move.from}${move.to}`;
      if (currentStep.allowedMoves.includes(moveStr)) {
        console.log('🎯 Move attempt: allowed -', moveStr);
        return 'allowed';
      } else {
        console.log('🎯 Move attempt: showing hint for -', moveStr);
        return 'hint';
      }
    } catch (error) {
      console.error('❌ Error in handleMoveAttempt:', error);
      return 'allowed'; // Fail safe
    }
  };

  const makeComputerMove = async () => {
    if (!game) {
      console.error('❌ No game object available for computer move');
      return;
    }
    
    setIsWaitingForComputer(true);
    
    try {
      console.log('🎯 Making computer move for step:', currentStep?.id);
      console.log('🎯 Current game state:', game.fen());
      console.log('🎯 Current turn:', game.turn());
      console.log('🎯 Available legal moves:', game.moves());
      
      // Use pre-defined move from the lesson step
      const moveToPlay = currentStep?.computerMove;
      
      if (!moveToPlay) {
        console.error('❌ No computer move defined for this step');
        setIsWaitingForComputer(false);
        return;
      }
      
      console.log('🎯 Attempting to play pre-defined move:', moveToPlay);
      
      // Create a fresh game instance from current state
      const newGame = new Chess(game.fen());
      
      // Try different move formats to see which one works
      let moveResult = null;
      
      // Method 1: Try as SAN (Standard Algebraic Notation) like "e5"
      try {
        console.log('🔧 Trying SAN format:', moveToPlay);
        moveResult = newGame.move(moveToPlay);
        if (moveResult) {
          console.log('✅ SAN format worked!');
        }
      } catch (sanError) {
        console.log('❌ SAN format failed:', sanError.message);
      }
      
      // Method 2: Try as coordinate notation like "e7e5"
      if (!moveResult && moveToPlay.length >= 4) {
        try {
          const from = moveToPlay.slice(0, 2);
          const to = moveToPlay.slice(2, 4);
          const promotion = moveToPlay.length > 4 ? moveToPlay.slice(4, 5) : undefined;
          
          console.log('🔧 Trying coordinate format:', { from, to, promotion });
          moveResult = newGame.move({ from, to, promotion });
          if (moveResult) {
            console.log('✅ Coordinate format worked!');
          }
        } catch (coordError) {
          console.log('❌ Coordinate format failed:', coordError.message);
        }
      }
      
      // Method 3: Try converting to proper SAN format
      if (!moveResult) {
        try {
          // Convert "e7e5" to "e5" for black pawn moves
          let sanMove = moveToPlay;
          if (moveToPlay === 'e7e5') {
            sanMove = 'e5';
          } else if (moveToPlay === 'b8c6') {
            sanMove = 'Nc6';
          }
          
          console.log('🔧 Trying converted SAN:', sanMove);
          moveResult = newGame.move(sanMove);
          if (moveResult) {
            console.log('✅ Converted SAN worked!');
          }
        } catch (convertError) {
          console.log('❌ Converted SAN failed:', convertError.message);
        }
      }
      
      // If we got a valid move, update the game state
      if (moveResult) {
        setGame(newGame);
        console.log('✅ Computer move executed successfully:', moveResult.san);
        console.log('✅ New position:', newGame.fen());
        
        try {
          createMoveAnimation(moveResult);
          createMoveExplanation(moveResult, newGame);
        } catch (animError) {
          console.warn('Animation error (non-critical):', animError);
        }
      } else {
        console.error('❌ All move formats failed for:', moveToPlay);
        console.error('❌ Current position:', game.fen());
        console.error('❌ Legal moves:', game.moves());
        
        // Just make the first legal move as fallback
        const legalMoves = game.moves();
        if (legalMoves.length > 0) {
          const fallbackMove = legalMoves[0];
          console.log('🔧 Using fallback legal move:', fallbackMove);
          const fallbackResult = newGame.move(fallbackMove);
          if (fallbackResult) {
            setGame(newGame);
            console.log('✅ Fallback move executed:', fallbackResult.san);
          }
        }
      }
    } catch (error) {
      console.error('❌ Computer move error:', error);
    }
    
    setIsWaitingForComputer(false);
    
    // Auto-advance after computer move
    setTimeout(() => {
      handleStepComplete();
    }, 300);
  };

  // Execute computer moves
  useEffect(() => {
    if (currentStep?.stepType === 'computer-move' && currentStep.computerMove) {
      makeComputerMove();
    }
  }, [currentStepIndex]);

  const handleChoiceSelect = (choice: any) => {
    // Handle choice navigation
    const nextStepId = choice.nextStep;
    const nextStepIndex = guidedPractice.steps.findIndex(s => s.id === nextStepId);
    if (nextStepIndex !== -1) {
      setCurrentStepIndex(nextStepIndex);
    }
  };

  // Animation helper functions with enhanced error handling and faster loading
  const createMoveAnimation = (moveResult: any) => {
    if (!boardRef.current || !moveResult) {
      console.warn('Missing board reference or move result for animation');
      return;
    }
    
    try {
      // Validate move result has required properties
      if (!moveResult.from || !moveResult.to) {
        console.warn('Invalid move result for animation:', moveResult);
        return;
      }
      
      // Skip animation if service is not available to prevent crashes
      if (!chessAnimationService?.createMoveAnimation) {
        console.warn('Animation service not available, skipping animation');
        return;
      }
      
      // Use shorter animation with immediate loading
      setTimeout(() => {
        chessAnimationService.createMoveAnimation(
          {
            from: moveResult.from,
            to: moveResult.to,
            piece: moveResult.piece || 'p',
            captured: moveResult.captured,
            san: moveResult.san || 'move'
          },
          boardRef.current
        );
      }, 0); // Immediate execution
    } catch (error) {
      console.warn('Animation error (non-critical):', error);
    }
  };

  const createMoveExplanation = (moveResult: any, newGame: Chess) => {
    if (!boardRef.current || !moveResult || !newGame) {
      console.warn('Missing required data for move explanation');
      return;
    }
    
    try {
      // Validate inputs
      if (!moveResult.from || !moveResult.to) {
        console.warn('Invalid move result for explanation:', moveResult);
        return;
      }
      
      const context = {
        move: `${moveResult.from}${moveResult.to}`,
        san: moveResult.san || 'move',
        piece: moveResult.piece || 'p',
        from: moveResult.from,
        to: moveResult.to,
        captured: moveResult.captured,
        isCheck: newGame.isCheck(),
        isCheckmate: newGame.isCheckmate(),
        gamePhase: newGame.history().length < 20 ? 'opening' : newGame.history().length > 40 ? 'endgame' : 'middlegame'
      };
      
      setMoveContext(context);
      setShowMoveExplanation(true);
      
      // Auto-hide explanation faster for better UX
      setTimeout(() => {
        setShowMoveExplanation(false);
      }, 1500);
    } catch (error) {
      console.error('Error creating move explanation:', error);
    }
  };

  const createUserMoveFeedback = (moveResult: any, isCorrect: boolean, square?: string) => {
    if (!boardRef.current) {
      console.warn('Board reference not available for feedback animation');
      return;
    }
    
    const targetSquare = square || (moveResult?.to) || 'e4';
    
    try {
      chessAnimationService.createFeedbackAnimation(
        isCorrect,
        targetSquare,
        boardRef.current
      );
    } catch (error) {
      console.warn('Feedback animation error (non-critical):', error);
    }
  };

  if (!currentStep) {
    console.error('❌ No current step available:', { currentStepIndex, totalSteps: guidedPractice.steps.length });
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="text-red-600">
            <h3 className="text-lg font-semibold">Step Loading Error</h3>
            <p>Step {currentStepIndex + 1} of {guidedPractice.steps.length} not found.</p>
          </div>
          <Button onClick={() => setCurrentStepIndex(0)}>
            Restart Lesson
          </Button>
        </div>
      </div>
    );
  }
  
  if (!game) {
    console.log('🎯 Game not ready, showing loading...');
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <div>Loading chess game...</div>
          <div className="text-sm text-gray-600">⚠️ Initializing guided practice...</div>
        </div>
      </div>
    );
  }

  // Debug current game state
  console.log('🎯 Current game state:', {
    fen: game.fen(),
    turn: game.turn(),
    moveCount: game.history().length,
    isGameOver: game.isGameOver()
  });

  return (
    <div className="guided-practice-container">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">{guidedPractice.theme}</h3>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-green-600">✅ {correctMoves} correct</span>
            <span className="text-red-500">❌ {mistakes} mistakes</span>
            {stepTimer && <span className="text-blue-600">⏱️ {stepTimer}s</span>}
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Instructions */}
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">
                {currentStep.stepType === 'user-move' && '🎯'}
                {currentStep.stepType === 'computer-move' && '🤖'}
                {currentStep.stepType === 'explanation' && '📚'}
                {currentStep.stepType === 'choice' && '🤔'}
              </span>
              <h4 className="font-bold text-xl">{currentStep.title}</h4>
            </div>
            <p className="text-blue-100 leading-relaxed">{currentStep.description}</p>
          </div>

          {/* Objectives & Bot Info */}
          <div className="space-y-3">
            <div className="bg-green-50 rounded-lg p-4">
              <h5 className="font-semibold text-green-800 mb-2">Learning Objectives:</h5>
              <ul className="list-disc list-inside text-green-700 text-sm space-y-1">
                {guidedPractice.objectives.map((obj, index) => (
                  <li key={index}>{obj}</li>
                ))}
              </ul>
            </div>
            
            {/* Simplified Bot Level Info (CSP-safe) */}
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <h5 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <span>🤖</span> Guided Practice Mode
              </h5>
              <div className="text-blue-700 text-sm space-y-1">
                <div><strong>Educational Bot</strong></div>
                <div className="text-xs">Step-by-step guided learning</div>
                <div className="text-xs">Pre-programmed optimal moves</div>
              </div>
            </div>
          </div>

          {/* Computer Move Explanation */}
          {lastComputerMove && currentStep.stepType !== 'user-move' && (
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h5 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                <span>🎓</span> Computer's Move Explanation
              </h5>
              <div className="text-purple-700 space-y-2">
                <p className="text-sm">{lastComputerMove.explanation}</p>
                {lastComputerMove.teachingPoint && (
                  <div className="bg-purple-100 p-3 rounded border border-purple-200">
                    <p className="text-xs font-medium text-purple-900">
                      💡 <strong>Teaching Point:</strong> {lastComputerMove.teachingPoint}
                    </p>
                  </div>
                )}
                <div className="flex justify-between text-xs text-purple-600">
                  <span>Category: {lastComputerMove.category}</span>
                  <span>Evaluation: {lastComputerMove.evaluation > 0 ? '+' : ''}{lastComputerMove.evaluation.toFixed(1)}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Choice buttons */}
          {currentStep.stepType === 'choice' && currentStep.choices && (
            <div className="space-y-3">
              {currentStep.choices.map((choice, index) => (
                <button
                  key={index}
                  onClick={() => handleChoiceSelect(choice)}
                  className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="font-medium">{choice.text}</div>
                  <div className="text-sm text-gray-600 mt-1">{choice.explanation}</div>
                </button>
              ))}
            </div>
          )}

          {/* Computer thinking indicator */}
          {isWaitingForComputer && (
            <div className="bg-blue-100 rounded-lg p-4 text-center">
              <div className="animate-pulse flex items-center justify-center gap-2">
                <span>🤖</span>
                <div className="space-y-1">
                  <div>Computer is thinking...</div>
                  {currentStep.botLevel && (
                    <div className="text-xs text-blue-600">
                      Bot Level: {chessEngine.getBotConfig(currentStep.botLevel)?.name || currentStep.botLevel}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* CSP Mode Status */}
          <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
            <div className="text-green-800 text-sm">
              ✅ Guided Practice Mode - Using educational move sequences
            </div>
          </div>
          
          {/* Session Performance */}
          {correctMoves + mistakes > 3 && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
              <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <span>📊</span> Practice Session
              </h5>
              {(() => {
                try {
                  if (!practiceBot?.getSessionSummary) {
                    return (
                      <div className="text-sm text-gray-600">
                        Session tracking not available
                      </div>
                    );
                  }
                  
                  const sessionSummary = practiceBot.getSessionSummary();
                  return (
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span>Success Rate:</span>
                        <span className={`font-bold ${sessionSummary.successRate > 0.7 ? 'text-green-600' : 'text-orange-600'}`}>
                          {(sessionSummary.successRate * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {sessionSummary.feedback}
                      </div>
                    </div>
                  );
                } catch (error) {
                  console.warn('Session summary error:', error);
                  return (
                    <div className="text-sm text-gray-600">
                      {correctMoves} correct, {mistakes} mistakes
                    </div>
                  );
                }
              })()}
            </div>
          )}
        </div>

        {/* Right: Chess Board and Explanations */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <div ref={boardRef} className="relative">
              <ChessBoard
                fen={game?.fen() || guidedPractice.initialFen}
                orientation="white"
                onMove={handleUserMove}
                onMoveAttempt={handleMoveAttempt}
                moveArrows={currentStep?.moveArrows || []}
                guidanceHighlights={currentStep?.highlightSquares || []}
                restrictedMoves={currentStep?.allowedMoves}
                guidanceTooltip={currentStep?.tooltip}
                stepExplanation={currentStep ? {
                  title: currentStep.title,
                  description: currentStep.description,
                  position: 'bottom'
                } : undefined}
                highlightMoves={true}
                showCoordinates={true}
                disabled={currentStep?.stepType === 'computer-move' || currentStep?.stepType === 'explanation' || currentStep?.stepType === 'choice'}
                enableGamification={true}
              />
            </div>
          </div>
          
          {/* Move Explanation System */}
          {showMoveExplanation && moveContext && (
            <div className="mt-4">
              <MoveExplanationSystem
                moveContext={moveContext}
                position={game?.fen() || guidedPractice.initialFen}
                isVisible={showMoveExplanation}
                onAnimationComplete={() => setShowMoveExplanation(false)}
                interactive={true}
                lesson={{
                  theme: guidedPractice.theme,
                  objectives: guidedPractice.objectives
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Step navigation */}
      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Step {currentStepIndex + 1} of {guidedPractice.steps.length}
        </div>
        
        {(currentStep.stepType === 'explanation' || currentStep.stepType === 'choice') && !stepTimer && (
          <Button onClick={handleStepComplete}>
            {currentStepIndex === guidedPractice.steps.length - 1 ? 'Complete Lesson' : 'Continue'}
          </Button>
        )}
      </div>
    </div>
  );
};

export const LessonPlayer: React.FC<LessonPlayerProps> = ({
  lesson,
  onComplete,
  onClose,
  onProgress
}) => {
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [moduleProgress, setModuleProgress] = useState<{[key: string]: number}>({});
  const [game, setGame] = useState<Chess | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<{[key: string]: number}>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  const currentModule = lesson.modules[currentModuleIndex];
  const progress = ((currentModuleIndex + 1) / lesson.modules.length) * 100;

  useEffect(() => {
    if (currentModule?.fen) {
      const newGame = new Chess(currentModule.fen);
      setGame(newGame);
    } else {
      setGame(null);
    }
  }, [currentModule]);

  // Handle chess moves in lessons
  const handleMove = (move: { from: string; to: string; promotion?: string }) => {
    if (!game) {
      console.error('Game state is null in handleMove');
      return;
    }
    
    try {
      const newGame = new Chess(game.fen());
      const moveResult = newGame.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion || 'q'
      });
      
      if (moveResult) {
        setGame(newGame);
      }
    } catch (error) {
      console.error('Invalid move in lesson:', error);
    }
  };

  useEffect(() => {
    onProgress?.(progress);
  }, [progress, onProgress]);

  const handleNextModule = () => {
    if (currentModuleIndex < lesson.modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
      setShowQuizResults(false);
    } else {
      onComplete?.();
    }
  };

  const handlePreviousModule = () => {
    if (currentModuleIndex > 0) {
      setCurrentModuleIndex(currentModuleIndex - 1);
      setShowQuizResults(false);
    }
  };

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    setQuizAnswers(prev => ({
      ...prev,
      [`${currentModule.id}-${questionIndex}`]: answerIndex
    }));
  };

  const handleQuizSubmit = () => {
    setShowQuizResults(true);
  };

  const renderModuleContent = () => {
    if (!currentModule) return null;

    switch (currentModule.type) {
      case 'guided-practice':
        console.log('🎯 Rendering guided-practice module:', currentModule);
        console.log('🎯 GuidedPractice data:', currentModule.guidedPractice);
        
        if (!currentModule.guidedPractice) {
          console.error('❌ No guidedPractice data in module:', currentModule);
          return (
            <div className="p-8 text-center">
              <p className="text-red-600">Error: Guided practice configuration missing.</p>
              <Button onClick={handleNextModule}>
                Skip to Next Module
              </Button>
            </div>
          );
        }

        // Try to render the actual guided practice with detailed error logging
        try {
          console.log('🔧 Attempting to render GuidedPracticePlayer...');
          
          return (
            <GuidedPracticeErrorBoundary
              onError={(error) => {
                console.error('🚨 GuidedPracticePlayer Error Boundary caught:', error);
                console.error('🚨 Error name:', error.name);
                console.error('🚨 Error message:', error.message);
                console.error('🚨 Error stack:', error.stack);
              }}
            >
              <GuidedPracticePlayer
                guidedPractice={currentModule.guidedPractice}
                onComplete={() => {
                  console.log('🎯 Guided practice completed');
                  handleNextModule();
                }}
              />
            </GuidedPracticeErrorBoundary>
          );
        } catch (renderError) {
          console.error('🚨 Failed to render GuidedPracticePlayer:', renderError);
          console.error('🚨 Render error name:', renderError.name);
          console.error('🚨 Render error message:', renderError.message);
          console.error('🚨 Render error stack:', renderError.stack);
          
          return (
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4 text-red-600">🚨 Guided Practice Render Error</h2>
              <div className="text-left bg-red-50 p-4 rounded border border-red-200">
                <p><strong>Error:</strong> {renderError.message}</p>
                <p><strong>Type:</strong> {renderError.name}</p>
                <details className="mt-4">
                  <summary className="cursor-pointer font-semibold">Error Stack</summary>
                  <pre className="text-xs mt-2 overflow-auto bg-white p-2 rounded">
                    {renderError.stack}
                  </pre>
                </details>
              </div>
              <Button onClick={handleNextModule} className="mt-4">
                Skip to Next Module
              </Button>
            </div>
          );
        }

      case 'theory':
        return (
          <div className="prose prose-lg max-w-none">
            <div className="whitespace-pre-line text-gray-700 leading-relaxed">
              {currentModule.content}
            </div>
          </div>
        );

      case 'interactive':
        return (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="prose">
                <div className="whitespace-pre-line text-gray-700">
                  {currentModule.content}
                </div>
              </div>
              {currentModule.moves && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Key Moves:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {currentModule.moves.map((move, index) => (
                      <Badge key={index} variant="outline" className="justify-center">
                        {index + 1}. {move}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {game && (
              <div className="flex justify-center">
                <ChessBoard
                  fen={game.fen()}
                  orientation="white"
                  onMove={handleMove}
                  highlightMoves={true}
                  showCoordinates={true}
                  disabled={false}
                  enableGamification={true}
                  allowAllMoves={true}
                />
              </div>
            )}
          </div>
        );

      case 'puzzle':
        return (
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Solve this position:</h3>
              <div className="whitespace-pre-line text-gray-700 mb-4">
                {currentModule.content}
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">
                  💡 <strong>Tip:</strong> Look for tactical patterns like forks, pins, or skewers!
                </p>
              </div>
            </div>
            {game && (
              <div className="flex justify-center">
                <ChessBoard
                  fen={game.fen()}
                  orientation="white"
                  onMove={handleMove}
                  highlightMoves={true}
                  showCoordinates={true}
                  puzzleMode={true}
                  correctMoves={currentModule.moves || []}
                  onCorrectMove={() => {
                    alert('Correct! Well done!');
                  }}
                  onIncorrectMove={() => {
                    alert('Not quite right. Try again!');
                  }}
                />
              </div>
            )}
          </div>
        );

      case 'quiz':
        return (
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold mb-6">Knowledge Check</h3>
            <div className="space-y-6">
              {currentModule.questions?.map((question, qIndex) => (
                <Card key={qIndex} className="p-6">
                  <h4 className="text-lg font-medium mb-4">{question.question}</h4>
                  <div className="space-y-3">
                    {question.options.map((option, oIndex) => {
                      const isSelected = quizAnswers[`${currentModule.id}-${qIndex}`] === oIndex;
                      const isCorrect = oIndex === question.correct;
                      const showResult = showQuizResults;
                      
                      return (
                        <button
                          key={oIndex}
                          onClick={() => handleQuizAnswer(qIndex, oIndex)}
                          disabled={showQuizResults}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            showResult
                              ? isCorrect
                                ? 'border-green-500 bg-green-50'
                                : isSelected && !isCorrect
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-200 bg-gray-50'
                              : isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{option}</span>
                            {showResult && isCorrect && <span className="text-green-600">✓</span>}
                            {showResult && isSelected && !isCorrect && <span className="text-red-600">✗</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {showQuizResults && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-blue-800 font-medium">Explanation:</p>
                      <p className="text-blue-700">{question.explanation}</p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
            {!showQuizResults && (
              <div className="mt-8 text-center">
                <Button onClick={handleQuizSubmit} size="lg">
                  Submit Quiz
                </Button>
              </div>
            )}
          </div>
        );

      default:
        return <div>Unknown module type</div>;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      {/* Header */}
      <div className="shadow-sm border-b" style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border-default)' }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                ← Back to Lessons
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
                <p className="text-gray-600">{lesson.description}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">
                Module {currentModuleIndex + 1} of {lesson.modules.length}
              </div>
              <Badge className="mt-1">{lesson.difficulty}</Badge>
            </div>
          </div>
          <Progress value={progress} className="h-3" />
        </div>
      </div>

      {/* Module Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentModuleIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">
                        {currentModule.type === 'theory' && '📚'}
                        {currentModule.type === 'interactive' && '🎮'}
                        {currentModule.type === 'puzzle' && '🧩'}
                        {currentModule.type === 'quiz' && '❓'}
                      </span>
                      {currentModule.title}
                    </CardTitle>
                    <CardDescription>
                      {currentModule.type === 'theory' && 'Learn the concepts'}
                      {currentModule.type === 'interactive' && 'Practice with the board'}
                      {currentModule.type === 'puzzle' && 'Solve the position'}
                      {currentModule.type === 'quiz' && 'Test your knowledge'}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {currentModule.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {renderModuleContent()}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePreviousModule}
            disabled={currentModuleIndex === 0}
          >
            ← Previous Module
          </Button>
          
          <div className="flex items-center space-x-2">
            {lesson.modules.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentModuleIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentModuleIndex
                    ? 'bg-blue-600'
                    : index < currentModuleIndex
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <Button
            onClick={handleNextModule}
            disabled={currentModule.type === 'quiz' && !showQuizResults}
          >
            {currentModuleIndex === lesson.modules.length - 1
              ? 'Complete Lesson ✓'
              : 'Next Module →'
            }
          </Button>
        </div>
      </div>
    </div>
  );
};