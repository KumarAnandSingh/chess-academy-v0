import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface AssessmentQuestion {
  id: number;
  fen: string;
  theme: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  hint: string;
  solution: string;
  timeLimit: number;
}

interface AssessmentResult {
  rating: number;
  level: string;
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
}

const mockQuestions: AssessmentQuestion[] = [
  {
    id: 1,
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 4 4",
    theme: "Knight Fork",
    difficulty: "Easy",
    description: "White to move and win material",
    hint: "Look for a knight move that attacks two pieces at once",
    solution: "Nd5",
    timeLimit: 45
  },
  {
    id: 2,
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    theme: "Pin Tactic",
    difficulty: "Easy",
    description: "Find the tactical shot for White",
    hint: "Pin the knight to the king",
    solution: "Bg5",
    timeLimit: 45
  },
  {
    id: 3,
    fen: "r2qr1k1/ppp2ppp/2n1bn2/3pp3/3PP3/2N1BN2/PPP2PPP/R2QK2R w KQ - 0 9",
    theme: "Skewer",
    difficulty: "Easy",
    description: "White has a powerful tactic here",
    hint: "Attack the queen and rook on the same line",
    solution: "Bh6",
    timeLimit: 45
  },
  {
    id: 4,
    fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 4 4",
    theme: "Discovered Attack",
    difficulty: "Easy",
    description: "Find the best move for White",
    hint: "Move the knight to reveal a powerful attack",
    solution: "Nxe5",
    timeLimit: 50
  },
  {
    id: 5,
    fen: "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQ - 0 7",
    theme: "Double Attack",
    difficulty: "Medium",
    description: "White to play and win material",
    hint: "Find a move that attacks two targets simultaneously",
    solution: "Nd5",
    timeLimit: 60
  },
  {
    id: 6,
    fen: "r2qkb1r/ppp2ppp/2n1pn2/3p4/2PP4/2N1PN2/PP3PPP/R1BQKB1R w KQkq - 0 7",
    theme: "Deflection",
    difficulty: "Medium",
    description: "Find the tactical blow for White",
    hint: "Remove the defender of a key square",
    solution: "cxd5",
    timeLimit: 75
  },
  {
    id: 7,
    fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    theme: "Decoy",
    difficulty: "Medium",
    description: "White has a forcing continuation",
    hint: "Lure the enemy king to a vulnerable square",
    solution: "Bxf7+",
    timeLimit: 75
  },
  {
    id: 8,
    fen: "r2qkb1r/ppp2ppp/2n1pn2/3p2B1/2PP4/2N2N2/PP3PPP/R2QKB1R w KQkq - 0 8",
    theme: "Clearance",
    difficulty: "Medium",
    description: "Clear the way for a decisive attack",
    hint: "Open up a line for your pieces",
    solution: "Bxf6",
    timeLimit: 90
  },
  {
    id: 9,
    fen: "r1bq1rk1/ppp2ppp/2np1n2/4p3/2B1P3/2N2N2/PPP2PPP/R1BQK2R w KQ - 0 8",
    theme: "Interference",
    difficulty: "Hard",
    description: "Find the sophisticated tactical shot",
    hint: "Block the communication between enemy pieces",
    solution: "Nd5",
    timeLimit: 120
  },
  {
    id: 10,
    fen: "2r1k2r/p4ppp/1p2pn2/2ppP3/3P4/2P2N2/PP3PPP/R1B1K2R w KQkq - 0 14",
    theme: "Zugzwang",
    difficulty: "Hard",
    description: "Find the move that puts Black in zugzwang",
    hint: "Force the opponent into a position where any move worsens their position",
    solution: "Ke2",
    timeLimit: 150
  },
  {
    id: 11,
    fen: "r2q1rk1/ppp2ppp/2n1pn2/3p2B1/1bPP4/2N2N2/PP2QPPP/R3KB1R w KQ - 0 10",
    theme: "Advanced Combination",
    difficulty: "Hard",
    description: "White has a brilliant tactical sequence",
    hint: "Look for a forcing sequence that wins material",
    solution: "Bxf6",
    timeLimit: 180
  },
  {
    id: 12,
    fen: "r1bqk2r/pppp1ppp/2n2n2/4p3/1bB1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 4 5",
    theme: "Master Level Tactic",
    difficulty: "Hard",
    description: "Find the brilliant master move",
    hint: "This requires deep calculation and pattern recognition",
    solution: "Bxf7+",
    timeLimit: 240
  }
];

const StrengthAssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState<'intro' | 'assessment' | 'results'>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [game, setGame] = useState<Chess | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [moveFrom, setMoveFrom] = useState<string | null>(null);
  const [moveTo, setMoveTo] = useState<string | null>(null);
  const [optionSquares, setOptionSquares] = useState<{[key: string]: any}>({});
  const [enableTimer, setEnableTimer] = useState(false); // Timer is optional

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return { 
        backgroundColor: 'var(--color-success-subtle)', 
        color: 'var(--color-success)',
        borderColor: 'var(--color-success)'
      };
      case 'Medium': return { 
        backgroundColor: 'var(--color-warning-subtle)', 
        color: 'var(--color-warning)',
        borderColor: 'var(--color-warning)'
      };
      case 'Hard': return { 
        backgroundColor: 'var(--color-danger-subtle)', 
        color: 'var(--color-danger)',
        borderColor: 'var(--color-danger)'
      };
      default: return { 
        backgroundColor: 'var(--color-surface)', 
        color: 'var(--color-text-secondary)',
        borderColor: 'var(--color-border-default)'
      };
    }
  };

  useEffect(() => {
    if (stage === 'assessment' && currentQuestion < mockQuestions.length) {
      try {
        const newGame = new Chess(mockQuestions[currentQuestion].fen);
        console.log('Game created successfully:', newGame.fen());
        console.log('Game valid?', newGame.isGameOver());
        setGame(newGame);
        setTimeLeft(mockQuestions[currentQuestion].timeLimit);
        setSelectedSquare(null);
        setShowHint(false);
        setIsCorrect(null);
        setLegalMoves([]);
        setMoveFrom(null);
        setMoveTo(null);
        setOptionSquares({});
      } catch (error) {
        console.error('Error creating Chess game:', error);
      }
    }
  }, [stage, currentQuestion]);

  useEffect(() => {
    if (stage === 'assessment' && timeLeft > 0 && enableTimer) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
    // Timer just stops at 0, no auto-advance
  }, [timeLeft, stage, enableTimer]);

  const startAssessment = () => {
    setStage('assessment');
    setCurrentQuestion(0);
    setScore(0);
  };

  const handleSkipQuestion = () => {
    // Move to next question manually
    if (currentQuestion < mockQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      showResults();
    }
  };

  const playSound = (type: 'correct' | 'incorrect' | 'move') => {
    // Simple audio feedback
    const audio = new Audio();
    if (type === 'correct') {
      audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvGIgGnrI7+OZVA0PVqzr6F4AAAA==';
    } else if (type === 'incorrect') {
      audio.src = 'data:audio/wav;base64,UklGRuoCAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YacCAAC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4AAAAAA==';
    } else {
      audio.src = 'data:audio/wav;base64,UklGRl9vT19nT1BXQVZFTW9uby5hdnRb5cBAAA==';
    }
    audio.play().catch(() => {
      // Silent fail if audio can't play
    });
  };

  const getMoveOptions = (square: string) => {
    if (!game) {
      console.log('No game instance for getMoveOptions');
      return [];
    }
    try {
      const moves = game.moves({ square: square as any, verbose: true });
      console.log('Legal moves for square', square, ':', moves);
      return moves;
    } catch (error) {
      console.error('Error getting moves for square', square, ':', error);
      return [];
    }
  };

  const onSquareClick = (square: string) => {
    console.log('Square clicked:', square); // Debug log
    if (!game) {
      console.log('No game instance');
      return;
    }

    // Clear previous highlights
    setOptionSquares({});
    
    // If clicking on the same square, deselect
    if (square === selectedSquare) {
      setSelectedSquare(null);
      setLegalMoves([]);
      console.log('Deselected square');
      return;
    }

    // If we have a selected square and this is a legal move target
    if (selectedSquare && legalMoves.includes(square)) {
      console.log('Attempting move from', selectedSquare, 'to', square);
      handleMoveAttempt(selectedSquare, square);
      setSelectedSquare(null);
      setLegalMoves([]);
      setOptionSquares({});
      return;
    }

    // Select new square and show legal moves
    const moves = getMoveOptions(square);
    console.log('Legal moves for', square, ':', moves);
    
    if (moves.length > 0) {
      setSelectedSquare(square);
      const legalMoveSquares = moves.map(move => typeof move === 'string' ? move : move.to);
      setLegalMoves(legalMoveSquares);
      
      const newSquares: {[key: string]: any} = {};
      
      // Highlight selected square with yellow
      newSquares[square] = {
        background: 'radial-gradient(circle, rgba(255,255,0,0.5) 40%, transparent 42%)',
      };
      
      // Show legal move indicators
      legalMoveSquares.forEach((moveSquare) => {
        const piece = game.get(moveSquare);
        if (piece) {
          // Capture move - red circle
          newSquares[moveSquare] = {
            background: 'radial-gradient(circle, rgba(255,0,0,0.7) 85%, transparent 87%)',
          };
        } else {
          // Regular move - green dot
          newSquares[moveSquare] = {
            background: 'radial-gradient(circle, rgba(0,255,0,0.7) 30%, transparent 32%)',
          };
        }
      });
      
      console.log('Setting option squares:', newSquares);
      setOptionSquares(newSquares);
    } else {
      console.log('No legal moves for square', square);
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  const handleMoveAttempt = (sourceSquare: string, targetSquare: string) => {
    if (!game) return false;

    try {
      const gameCopy = new Chess(game.fen());
      const move = gameCopy.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
      if (move) {
        const moveString = move.from + move.to;
        const correctMove = mockQuestions[currentQuestion].solution;
        
        if (moveString.includes(correctMove) || move.san === correctMove) {
          setIsCorrect(true);
          setScore(score + 1);
          playSound('correct');
          setTimeout(() => {
            if (currentQuestion < mockQuestions.length - 1) {
              setCurrentQuestion(currentQuestion + 1);
            } else {
              showResults();
            }
          }, 2000);
        } else {
          setIsCorrect(false);
          playSound('incorrect');
          // Don't auto-advance on incorrect moves, let user try again or skip
        }
        return true;
      }
    } catch (error) {
      return false;
    }
    return false;
  };

  const showResults = () => {
    const percentage = (score / mockQuestions.length) * 100;
    let rating = 800 + (percentage * 8); // 800-1600 range
    let level = 'Beginner';
    
    if (rating >= 1400) level = 'Intermediate';
    if (rating >= 1200) level = 'Improving';
    if (rating < 1000) level = 'Beginner';

    setResult({
      rating: Math.round(rating),
      level,
      strengths: score > 2 ? ['Tactical Vision', 'Pattern Recognition'] : ['Learning Mindset'],
      improvements: score < 2 ? ['Basic Tactics', 'Pattern Recognition'] : ['Advanced Tactics'],
      nextSteps: [
        'Practice daily tactical puzzles',
        'Study fundamental chess tactics',
        'Play games at your level'
      ]
    });
    setStage('results');
  };

  if (stage === 'intro') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-bg-base)' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl w-full"
        >
          <Card className="overflow-hidden border-0 shadow-2xl">
            <div className="p-8 text-center" style={{ backgroundColor: 'var(--color-accent-primary)', color: 'var(--color-text-primary)' }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-6xl mb-4"
              >
                🎯
              </motion.div>
              <h1 className="text-4xl font-bold mb-4">Chess Strength Assessment</h1>
              <p className="text-xl text-blue-100 mb-2">
                Get your official ELO rating (400-1800) in 12 positions
              </p>
              <p className="text-blue-200">
                One-time comprehensive test to determine your exact skill level
              </p>
            </div>

            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-2xl font-semibold mb-4 flex items-center">
                    <span className="text-3xl mr-3">⚡</span>
                    How It Works
                  </h3>
                  <div className="space-y-4">
                    {[
                      'Solve 12 tactical positions of increasing difficulty',
                      'Covers all major tactical themes (fork, pin, skewer, etc.)',
                      'Each position tests specific skill levels (400-1800 ELO)',
                      'Get precise ELO rating + personalized learning plan'
                    ].map((step, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                        className="flex items-center space-x-3"
                      >
                        <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                          {i + 1}
                        </div>
                        <span style={{ color: 'var(--color-text-secondary)' }}>{step}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold mb-4 flex items-center">
                    <span className="text-3xl mr-3">🏆</span>
                    You'll Discover
                  </h3>
                  <div className="space-y-3">
                    {[
                      'Your exact ELO rating (400-1800 scale)',
                      'Tactical strengths and weaknesses breakdown',
                      'Customized learning path recommendations',
                      'Optimal puzzle difficulty and bot levels for training'
                    ].map((benefit, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                        className="flex items-center space-x-3"
                      >
                        <span className="text-2xl">✨</span>
                        <span style={{ color: 'var(--color-text-secondary)' }}>{benefit}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                >
                  <Button 
                    size="lg" 
                    onClick={startAssessment}
                    style={{ backgroundColor: 'var(--color-accent-primary)', color: 'var(--color-text-primary)' }}
                    className="px-12 py-4 text-xl font-semibold rounded-full shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105"
                  >
                    🎯 Take Assessment Test
                  </Button>
                </motion.div>
                <p className="text-sm mt-4" style={{ color: 'var(--color-text-muted)' }}>
                  Takes about 10-15 minutes • Comprehensive evaluation • Take once every few months
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (stage === 'assessment') {
    const question = mockQuestions[currentQuestion];
    const progress = ((currentQuestion + 1) / mockQuestions.length) * 100;

    return (
      <div className="min-h-screen p-4" style={{ backgroundColor: 'var(--color-bg-base)' }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <h1 className="text-3xl font-bold text-text-primary mb-2">🎯 Chess Strength Assessment</h1>
            <div className="flex justify-center items-center space-x-4 mb-4">
              <Badge variant="secondary" className="text-sm">
                Question {currentQuestion + 1} of {mockQuestions.length}
              </Badge>
              <Badge style={getDifficultyColor(question.difficulty)}>
                {question.difficulty}
              </Badge>
              <Badge variant="outline" className="text-sm">
                {question.theme}
              </Badge>
            </div>
            <div className="max-w-md mx-auto mb-4">
              <Progress value={progress} className="h-3" />
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Chess Board */}
            <div className="lg:col-span-2">
              <Card className="p-4 shadow-xl">
                <div className="aspect-square">
                  {game && (
                    <div>
                      <div style={{ width: Math.min(600, window.innerWidth - 100) }}>
                        <Chessboard
                          options={{
                            position: game.fen(),
                            onSquareClick: ({ square }: { square: string }) => {
                              console.log('Square clicked via Chessboard:', square);
                              onSquareClick(square);
                            },
                            onPieceDrop: ({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string }) => {
                              console.log('Piece dropped from', sourceSquare, 'to', targetSquare);
                              return handleMoveAttempt(sourceSquare, targetSquare);
                            },
                            squareStyles: optionSquares,
                            allowDragging: true,
                            animationDurationInMs: 200,
                            boardStyle: {
                              borderRadius: '10px',
                              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                            },
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Feedback */}
                <AnimatePresence>
                  {isCorrect !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`mt-4 p-4 rounded-lg text-center ${
                        isCorrect 
                          ? 'border border-success' 
                          : 'border border-danger'
                      }`}
                    >
                      <div className="text-2xl mb-2">
                        {isCorrect ? '🎉' : '💡'}
                      </div>
                      <div className="font-semibold" style={{
                        color: isCorrect ? 'var(--color-success)' : 'var(--color-danger)'
                      }}>
                        {isCorrect ? 'Excellent!' : 'Not quite right'}
                      </div>
                      <div className="text-sm" style={{
                        color: isCorrect ? 'var(--color-success)' : 'var(--color-danger)'
                      }}>
                        {isCorrect 
                          ? 'You found the best move!' 
                          : `The solution was: ${question.solution}`
                        }
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Timer Controls */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold">Timer</span>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableTimer}
                      onChange={(e) => setEnableTimer(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-xs">Enable</span>
                  </label>
                </div>
                
                {enableTimer ? (
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {timeLeft}
                    </div>
                    <div className="style={{ color: 'var(--color-text-secondary)' }} text-sm">seconds remaining</div>
                    <div className="mt-3">
                      <Progress 
                        value={(timeLeft / question.timeLimit) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-sm">
                    Take your time to find the best move
                  </div>
                )}
              </Card>

              {/* Question Info */}
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-3 text-text-primary">
                  {question.description}
                </h3>
                <div className="space-y-3">
                  <div className="text-sm style={{ color: 'var(--color-text-secondary)' }}">
                    <strong>Theme:</strong> {question.theme}
                  </div>
                  <div className="text-sm style={{ color: 'var(--color-text-secondary)' }}">
                    <strong>Difficulty:</strong> {question.difficulty}
                  </div>
                </div>
                
                {!showHint && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowHint(true)}
                    className="mt-4 w-full"
                  >
                    💡 Need a hint?
                  </Button>
                )}

                {showHint && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 p-3 rounded-lg"
                    style={{ backgroundColor: 'var(--color-warning-subtle)', borderColor: 'var(--color-warning)' }}
                  >
                    <div className="text-sm" style={{ color: 'var(--color-warning)' }}>
                      <strong>Hint:</strong> {question.hint}
                    </div>
                  </motion.div>
                )}

                {/* Skip Button - appears when incorrect move or timer runs out */}
                {(isCorrect === false || (enableTimer && timeLeft === 0)) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4"
                  >
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleSkipQuestion}
                      className="w-full bg-surface hover:bg-surface-elevated"
                    >
                      ⏭️ Skip to Next Question
                    </Button>
                  </motion.div>
                )}
              </Card>

              {/* Score */}
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold mb-1" style={{ color: 'var(--color-accent-primary)' }}>
                  {score} / {currentQuestion + 1}
                </div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>correct so far</div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'results' && result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-bg-base)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl w-full"
        >
          <Card className="overflow-hidden border-0 shadow-2xl">
            <div className="p-8 text-center" style={{ backgroundColor: 'var(--color-accent-primary)', color: 'var(--color-text-primary)' }}>
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-6xl mb-4"
              >
                🏆
              </motion.div>
              <h1 className="text-4xl font-bold mb-4">Your Chess Rating</h1>
              <div className="text-6xl font-bold mb-2">{result.rating}</div>
              <div className="text-2xl text-purple-100 mb-2">{result.level}</div>
              <div className="text-purple-200">
                You scored {score} out of {mockQuestions.length} puzzles correct!
              </div>
            </div>

            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-2xl font-semibold mb-4 flex items-center text-green-600">
                    <span className="text-3xl mr-3">💪</span>
                    Your Strengths
                  </h3>
                  <div className="space-y-3">
                    {result.strengths.map((strength, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                        className="flex items-center space-x-3 p-3 rounded-lg"
                        style={{ backgroundColor: 'var(--color-success-subtle)' }}
                      >
                        <span className="text-green-500">✅</span>
                        <span className="text-text-primary">{strength}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold mb-4 flex items-center text-blue-600">
                    <span className="text-3xl mr-3">🎯</span>
                    Areas to Improve
                  </h3>
                  <div className="space-y-3">
                    {result.improvements.map((improvement, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                        className="flex items-center space-x-3 p-3 rounded-lg"
                        style={{ backgroundColor: 'var(--color-accent-primary-subtle)' }}
                      >
                        <span className="text-blue-500">🔄</span>
                        <span className="text-text-primary">{improvement}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl mb-8" style={{ backgroundColor: 'var(--color-warning-subtle)', borderColor: 'var(--color-warning)', borderWidth: '1px' }}>
                <h3 className="text-2xl font-semibold mb-4 flex items-center text-orange-600">
                  <span className="text-3xl mr-3">🚀</span>
                  Your Next Steps
                </h3>
                <div className="grid gap-3">
                  {result.nextSteps.map((step, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                        {i + 1}
                      </div>
                      <span className="text-text-primary">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  onClick={() => navigate('/puzzles')}
                  style={{ backgroundColor: 'var(--color-success)', color: 'var(--color-text-primary)' }}
                  className="px-8 py-3 font-semibold rounded-full shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105"
                >
                  🧩 Start Solving Puzzles
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="px-8 py-3 font-semibold rounded-full border-2 hover:bg-surface"
                >
                  ← Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return null;
};

export default StrengthAssessmentPage;