import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChessBoard } from '../chess/ChessBoard';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle, AlertCircle, Book } from 'lucide-react';
import { audioService } from '../../services/audioService';

// Mock lesson data - in production this would come from your API
interface LessonStep {
  id: string;
  title: string;
  instruction: string;
  fen?: string;
  correctMoves?: string[];
  explanation?: string;
  type: 'instruction' | 'practice' | 'quiz';
}

interface LessonData {
  id: string;
  title: string;
  description: string;
  steps: LessonStep[];
}

const mockLessonData: { [key: string]: LessonData } = {
  '1': {
    id: '1',
    title: 'Chess Basics: How the Pieces Move',
    description: 'Learn how each chess piece moves and captures. Perfect for beginners!',
    steps: [
      {
        id: '1-1',
        title: 'Welcome to Chess Basics',
        instruction: 'Welcome! In this lesson, you\'ll learn how each chess piece moves. Let\'s start with the fundamentals of chess.',
        type: 'instruction'
      },
      {
        id: '1-2', 
        title: 'The Pawn',
        instruction: 'Pawns are the foot soldiers of chess. They move forward one square, but capture diagonally. On their first move, they can advance two squares. Let\'s see a pawn on the board.',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        type: 'instruction'
      },
      {
        id: '1-3',
        title: 'Practice: Move a Pawn',
        instruction: 'Now it\'s your turn! Try moving the pawn in front of the king (the e2 pawn) forward one or two squares.',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        correctMoves: ['e2e3', 'e2e4'],
        explanation: 'Excellent! You moved the pawn correctly. Pawns are unique - they can move two squares on their first move, which helps develop your position quickly.',
        type: 'practice'
      },
      {
        id: '1-4',
        title: 'The Rook',
        instruction: 'Rooks are powerful pieces that move horizontally or vertically any number of squares, as long as the path is clear. They\'re like towers defending your kingdom.',
        fen: '8/8/8/8/8/8/8/R7 w - - 0 1',
        type: 'instruction'
      },
      {
        id: '1-5',
        title: 'Practice: Move the Rook',
        instruction: 'Move the white rook to any valid square. Remember: rooks move in straight lines along ranks (horizontal) and files (vertical)!',
        fen: '8/8/8/8/8/8/8/R7 w - - 0 1',
        correctMoves: ['a1a2', 'a1a3', 'a1a4', 'a1a5', 'a1a6', 'a1a7', 'a1a8', 'a1b1', 'a1c1', 'a1d1', 'a1e1', 'a1f1', 'a1g1', 'a1h1'],
        explanation: 'Perfect! The rook can move to any square in its rank (horizontal row) or file (vertical column). Rooks are most powerful on open files.',
        type: 'practice'
      },
      {
        id: '1-6',
        title: 'The Bishop',
        instruction: 'Bishops move diagonally any number of squares. Each player has two bishops - one that moves on light squares and one on dark squares.',
        fen: '8/8/8/8/8/8/8/2B5 w - - 0 1',
        type: 'instruction'
      },
      {
        id: '1-7',
        title: 'Practice: Move the Bishop',
        instruction: 'Move the white bishop diagonally. Notice how it can only move to squares of the same color.',
        fen: '8/8/8/8/8/8/8/2B5 w - - 0 1',
        correctMoves: ['c1d2', 'c1e3', 'c1f4', 'c1g5', 'c1h6', 'c1b2', 'c1a3'],
        explanation: 'Great! Bishops are restricted to squares of one color throughout the entire game. This bishop can only move on dark squares.',
        type: 'practice'
      },
      {
        id: '1-8',
        title: 'The Knight',
        instruction: 'Knights move in an L-shape: two squares in one direction and one square perpendicular. They\'re the only pieces that can jump over other pieces.',
        fen: '8/8/8/8/8/8/8/1N6 w - - 0 1',
        type: 'instruction'
      },
      {
        id: '1-9',
        title: 'Practice: Move the Knight',
        instruction: 'Move the white knight to any valid square. Remember the L-shape pattern!',
        fen: '8/8/8/8/8/8/8/1N6 w - - 0 1',
        correctMoves: ['b1a3', 'b1c3', 'b1d2'],
        explanation: 'Excellent! The knight\'s L-shaped move makes it a tricky piece to master, but very powerful for surprising attacks.',
        type: 'practice'
      },
      {
        id: '1-10',
        title: 'Congratulations!',
        instruction: 'You\'ve learned the basic piece movements! Practice makes perfect. Ready to move on to more advanced lessons?',
        type: 'instruction'
      }
    ]
  },
  '2': {
    id: '2',
    title: 'Checkmate Patterns',
    description: 'Learn essential checkmate patterns. Great for intermediate players.',
    steps: [
      {
        id: '2-1',
        title: 'What is Checkmate?',
        instruction: 'Checkmate is the ultimate goal in chess. It occurs when the king is under attack (in check) and has no legal moves to escape capture.',
        type: 'instruction'
      },
      {
        id: '2-2',
        title: 'Back Rank Mate Setup',
        instruction: 'One of the most common checkmate patterns is the back rank mate. Here, the enemy king is trapped on the back rank by its own pawns.',
        fen: '6k1/5ppp/8/8/8/8/8/R7 w - - 0 1',
        type: 'instruction'
      },
      {
        id: '2-3',
        title: 'Practice: Deliver Back Rank Mate!',
        instruction: 'Move your white rook to deliver checkmate in one move! Look for the square that attacks the black king with no escape.',
        fen: '6k1/5ppp/8/8/8/8/8/R7 w - - 0 1',
        correctMoves: ['a1a8'],
        explanation: 'Brilliant! Ra8# is checkmate because the king is attacked and cannot escape - the pawns block its retreat and no piece can block or capture the rook.',
        type: 'practice'
      },
      {
        id: '2-4',
        title: 'Queen and King vs King',
        instruction: 'With a queen and king, you can force checkmate against a lone king. The key is to restrict the enemy king\'s movement.',
        fen: '7k/6Q1/6K1/8/8/8/8/8 w - - 0 1',
        type: 'instruction'
      },
      {
        id: '2-5',
        title: 'Practice: Queen Checkmate',
        instruction: 'Deliver checkmate with your queen. The black king has no escape squares.',
        fen: '7k/6Q1/6K1/8/8/8/8/8 w - - 0 1',
        correctMoves: ['g7g8'],
        explanation: 'Perfect! Qg8# is checkmate. The queen attacks the king, and with your king supporting, the black king has no legal moves.',
        type: 'practice'
      },
      {
        id: '2-6',
        title: 'Smothered Mate',
        instruction: 'A smothered mate occurs when the king is surrounded by its own pieces and gets checkmated by a knight.',
        fen: '6rk/6pp/8/8/8/8/8/5N2 w - - 0 1',
        type: 'instruction'
      },
      {
        id: '2-7',
        title: 'Practice: Smothered Mate',
        instruction: 'Use the white knight to deliver a smothered mate! The black king is trapped by its own pieces.',
        fen: '6rk/6pp/8/8/8/8/8/5N2 w - - 0 1',
        correctMoves: ['f1g3', 'f1e3'],
        explanation: 'Well done! You\'ve learned about smothered mate - one of the most beautiful checkmate patterns in chess.',
        type: 'practice'
      }
    ]
  },
  '3': {
    id: '3',
    title: 'Advanced Tactics',
    description: 'Master advanced tactical patterns including forks, pins, and skewers.',
    steps: [
      {
        id: '3-1',
        title: 'Introduction to Tactics',
        instruction: 'Chess tactics are short-term combinations that win material or deliver checkmate. Mastering tactics is crucial for improvement.',
        type: 'instruction'
      },
      {
        id: '3-2',
        title: 'The Fork',
        instruction: 'A fork is when one piece attacks two or more enemy pieces simultaneously. Knights are especially good at creating forks.',
        fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 4',
        type: 'instruction'
      },
      {
        id: '3-3',
        title: 'Practice: Knight Fork',
        instruction: 'Find the knight move that forks the black king and queen! Look for a square where your knight attacks both pieces.',
        fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 4',
        correctMoves: ['f3g5'],
        explanation: 'Brilliant! Ng5+ forks the king and queen. Black must move the king, and then you can capture the queen on the next move.',
        type: 'practice'
      },
      {
        id: '3-4',
        title: 'The Pin',
        instruction: 'A pin occurs when a piece cannot move because it would expose a more valuable piece behind it to attack.',
        fen: 'rnbqkbnr/ppp2ppp/8/3pp3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 3',
        type: 'instruction'
      },
      {
        id: '3-5',
        title: 'Practice: Create a Pin',
        instruction: 'Move your bishop to create a pin on the black knight, preventing it from moving.',
        fen: 'rnbqkbnr/ppp2ppp/8/3pp3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 3',
        correctMoves: ['f1b5'],
        explanation: 'Excellent! Bb5+ pins the knight to the king. The knight cannot move because it would expose the king to check.',
        type: 'practice'
      },
      {
        id: '3-6',
        title: 'The Skewer',
        instruction: 'A skewer forces a valuable piece to move, exposing a less valuable piece behind it. It\'s like a reverse pin.',
        fen: '8/8/8/3k4/8/8/3R4/3K4 w - - 0 1',
        type: 'instruction'
      },
      {
        id: '3-7',
        title: 'Practice: Execute a Skewer',
        instruction: 'Use your rook to skewer the black king, forcing it to move and win material.',
        fen: '8/8/8/3k4/8/8/3R4/3K4 w - - 0 1',
        correctMoves: ['d2d5'],
        explanation: 'Perfect! Rd5+ skewers the king. The king must move, and you can capture whatever piece was behind it.',
        type: 'practice'
      },
      {
        id: '3-8',
        title: 'Discovery Attack',
        instruction: 'A discovery attack occurs when moving one piece unveils an attack from another piece behind it.',
        fen: '8/8/8/8/3k4/8/3BP3/3K4 w - - 0 1',
        type: 'instruction'
      },
      {
        id: '3-9',
        title: 'Tactics Mastery Complete!',
        instruction: 'Congratulations! You\'ve mastered the fundamental chess tactics. These patterns will serve you well in your games. Keep practicing!',
        type: 'instruction'
      }
    ]
  },
  '4': {
    id: '4',
    title: 'King and Pawn Endgames',
    description: 'Master the most important endgame: King and Pawn vs King.',
    steps: [
      {
        id: '4-1',
        title: 'Endgame Fundamentals',
        instruction: 'King and pawn endgames are the foundation of all endgame study. Understanding these positions is crucial for chess improvement.',
        type: 'instruction'
      },
      {
        id: '4-2',
        title: 'The Rule of the Square',
        instruction: 'The rule of the square helps you determine if a king can catch a passed pawn. Draw an imaginary square from the pawn to the promotion square.',
        fen: '8/8/8/8/8/8/4P3/4K1k1 w - - 0 1',
        type: 'instruction'
      },
      {
        id: '4-3',
        title: 'Opposition Concept',
        instruction: 'Opposition is when the two kings face each other with one square between them. The player NOT to move has the opposition.',
        fen: '8/8/8/3k4/8/3K4/8/8 w - - 0 1',
        type: 'instruction'
      },
      {
        id: '4-4',
        title: 'Practice: Win with Opposition',
        instruction: 'Use the opposition to help your pawn promote. Move your king to gain the opposition.',
        fen: '8/8/8/3k4/3P4/3K4/8/8 w - - 0 1',
        correctMoves: ['d3e3', 'd3c3'],
        explanation: 'Good! By gaining the opposition, you can support your pawn\'s advance to promotion.',
        type: 'practice'
      }
    ]
  },
  '5': {
    id: '5',
    title: 'Opening Principles',
    description: 'Learn the fundamental principles of chess openings for advanced play.',
    steps: [
      {
        id: '5-1',
        title: 'Opening Goals',
        instruction: 'The opening phase has three main goals: develop your pieces, control the center, and ensure king safety.',
        type: 'instruction'
      },
      {
        id: '5-2',
        title: 'Control the Center',
        instruction: 'The center squares (e4, e5, d4, d5) are the most important. Pieces in the center have maximum influence.',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        type: 'instruction'
      },
      {
        id: '5-3',
        title: 'Practice: Open with Center Control',
        instruction: 'Start the game by occupying the center with a pawn move.',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        correctMoves: ['e2e4', 'd2d4'],
        explanation: 'Excellent! 1.e4 or 1.d4 are the most popular first moves because they immediately stake a claim in the center.',
        type: 'practice'
      },
      {
        id: '5-4',
        title: 'Piece Development',
        instruction: 'Develop your pieces (knights before bishops) toward the center. Don\'t move the same piece twice in the opening.',
        fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
        type: 'instruction'
      },
      {
        id: '5-5',
        title: 'Practice: Develop Knights First',
        instruction: 'Develop your knight toward the center. Knights should generally be developed before bishops.',
        fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
        correctMoves: ['g1f3', 'b1c3'],
        explanation: 'Perfect! Developing knights early gives you good central control and prepares for castling.',
        type: 'practice'
      }
    ]
  }
};

interface InteractiveLessonProps {}

const InteractiveLesson: React.FC<InteractiveLessonProps> = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [showHint, setShowHint] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [lessonCompleted, setLessonCompleted] = useState(false);

  const lesson = lessonId ? mockLessonData[lessonId] : null;
  const currentStep = lesson?.steps[currentStepIndex];

  useEffect(() => {
    if (!lesson && lessonId) {
      console.log('Lesson not found for ID:', lessonId);
      console.log('Available lessons:', Object.keys(mockLessonData));
      setTimeout(() => navigate('/lessons'), 100); // Delay navigation to prevent immediate redirect
      return;
    }
    
    if (lesson) {
      console.log('Lesson loaded:', lesson.title);
      // Play lesson start sound
      audioService.playGamificationSound('lessonComplete');
    }
  }, [lesson, navigate, lessonId]);

  const handleCorrectMove = useCallback(() => {
    if (!currentStep) return;

    console.log('InteractiveLesson: Correct move made');
    audioService.playGamificationSound('puzzleSolved');
    
    // Mark step as completed
    setCompletedSteps(prev => new Set([...prev, currentStep.id]));
    setShowHint(false);
    setAttemptCount(0);

    // Show explanation if available
    if (currentStep.explanation) {
      setTimeout(() => {
        // Auto-advance after showing explanation
        handleNextStep();
      }, 3000);
    } else {
      handleNextStep();
    }
  }, [currentStep]);

  const handleIncorrectMove = useCallback(() => {
    console.log('InteractiveLesson: Incorrect move made');
    audioService.playUISound('error');
    setAttemptCount(prev => prev + 1);
    
    // Show hint after 2 wrong attempts
    if (attemptCount >= 1) {
      setShowHint(true);
    }
  }, [attemptCount]);

  const handleNextStep = useCallback(() => {
    console.log('handleNextStep called', { lesson: !!lesson, currentStepIndex, totalSteps: lesson?.steps.length });
    if (!lesson) return;

    if (currentStepIndex < lesson.steps.length - 1) {
      console.log('Moving to next step');
      setCurrentStepIndex(prev => prev + 1);
      setShowHint(false);
      setAttemptCount(0);
    } else {
      // Lesson completed
      console.log('Lesson completed');
      setLessonCompleted(true);
      audioService.playGamificationSound('lessonComplete');
    }
  }, [lesson, currentStepIndex]);

  const handlePreviousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setShowHint(false);
      setAttemptCount(0);
    }
  }, [currentStepIndex]);

  const handleReset = useCallback(() => {
    setCurrentStepIndex(0);
    setCompletedSteps(new Set());
    setShowHint(false);
    setAttemptCount(0);
    setLessonCompleted(false);
  }, []);

  const handleReturnToLessons = useCallback(() => {
    console.log('Navigating back to lessons');
    navigate('/lessons');
  }, [navigate]);

  if (!lesson && lessonId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading lesson...</h2>
          <p className="text-gray-600 mb-4">Please wait while we load the lesson.</p>
          <Button onClick={handleReturnToLessons}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Lessons
          </Button>
        </div>
      </div>
    );
  }
  
  if (!lesson) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Lesson Not Found</h2>
          <p className="text-gray-600 mb-4">The requested lesson could not be loaded.</p>
          <Button onClick={handleReturnToLessons}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Lessons
          </Button>
        </div>
      </div>
    );
  }

  if (lessonCompleted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="text-center">
          <CardContent className="p-12">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-green-600 mb-4">Lesson Completed! 🎉</h1>
            <p className="text-lg text-gray-600 mb-6">
              Congratulations! You've successfully completed "{lesson?.title || 'this lesson'}".
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={handleReset} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Restart Lesson
              </Button>
              <Button onClick={handleReturnToLessons}>
                <Book className="h-4 w-4 mr-2" />
                More Lessons
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = ((currentStepIndex + 1) / lesson.steps.length) * 100;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={handleReturnToLessons}
            className="text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Lessons
          </Button>
          
          <Badge variant="secondary">
            Step {currentStepIndex + 1} of {lesson.steps.length}
          </Badge>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Instruction Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                {currentStep?.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {currentStep?.instruction}
              </p>
              
              {showHint && currentStep?.correctMoves && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    💡 <strong>Hint:</strong> Try moving to one of these squares: {currentStep.correctMoves.join(', ')}
                  </p>
                </div>
              )}

              {completedSteps.has(currentStep?.id || '') && currentStep?.explanation && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm">
                    ✅ <strong>Well done!</strong> {currentStep.explanation}
                  </p>
                </div>
              )}

              {currentStep?.type === 'instruction' && (
                <div className="mt-6">
                  <Button onClick={handleNextStep} className="w-full">
                    Continue
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousStep}
              disabled={currentStepIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <Button
              variant="outline"
              onClick={handleNextStep}
              disabled={currentStep?.type === 'practice' && !completedSteps.has(currentStep?.id || '')}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Chess Board Panel */}
        <div className="flex justify-center">
          {currentStep?.fen && (
            <div className="rounded-lg p-6 shadow-sm border" style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border-default)' }}>
              <ChessBoard
                fen={currentStep.fen}
                orientation="white"
                puzzleMode={currentStep.type === 'practice'}
                correctMoves={currentStep.correctMoves}
                onCorrectMove={handleCorrectMove}
                onIncorrectMove={handleIncorrectMove}
                disabled={completedSteps.has(currentStep.id)}
                highlightMoves={true}
                showCoordinates={true}
                showHelp={currentStep.type === 'practice'}
                showPieceTooltips={true}
                enableGamification={true}
                lessonMode={true}
              />
              
              {currentStep.type === 'practice' && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    {completedSteps.has(currentStep.id) 
                      ? '✅ Step completed!' 
                      : 'Make your move on the board'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InteractiveLesson;