import React, { useState, useEffect } from 'react';
import { ChessPuzzle } from '../components/chess/ChessPuzzle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';

interface PuzzleSet {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  ratingRange: string;
  totalPuzzles: number;
  completed: number;
  puzzles: Array<{
    id: string;
    title: string;
    description: string;
    fen: string;
    solution: string[];
    rating: number;
    tags: string[];
    theme: string;
  }>;
}

// Comprehensive A-Z Chess Curriculum
const puzzleCurriculum: PuzzleSet[] = [
  {
    id: 'basic-tactics-1',
    title: '📚 Basic Tactics: Forks',
    description: 'Master the fundamental fork tactic - attacking two pieces simultaneously',
    difficulty: 'Beginner',
    ratingRange: '400-800',
    totalPuzzles: 25,
    completed: 0,
    puzzles: [
      {
        id: 'fork-1',
        title: 'Knight Fork - King and Queen',
        description: 'White to move and fork the black king and queen',
        fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 4',
        solution: ['f3d5'],
        rating: 600,
        tags: ['tactics', 'fork', 'knight'],
        theme: 'Fork'
      },
      {
        id: 'fork-2', 
        title: 'Knight Fork - King and Rook',
        description: 'Find the knight fork that wins the rook',
        fen: 'r3k2r/ppp2ppp/2n1pn2/3p4/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 8',
        solution: ['f3g5'],
        rating: 650,
        tags: ['tactics', 'fork', 'knight'],
        theme: 'Fork'
      },
      // ... more fork puzzles would go here
    ]
  },
  {
    id: 'basic-tactics-2',
    title: '🧷 Basic Tactics: Pins',
    description: 'Learn to pin pieces to more valuable targets behind them',
    difficulty: 'Beginner',
    ratingRange: '400-800',
    totalPuzzles: 25,
    completed: 0,
    puzzles: [
      {
        id: 'pin-1',
        title: 'Pin to the King',
        description: 'Pin the knight to the king and win material',
        fen: 'r1bqkb1r/ppp2ppp/2n2n2/3pp3/2B1P3/3P1N2/PPP2PPP/RNBQ1RK1 w kq - 0 6',
        solution: ['c1g5'],
        rating: 580,
        tags: ['tactics', 'pin', 'bishop'],
        theme: 'Pin'
      },
      {
        id: 'pin-2',
        title: 'Pin to the Queen',
        description: 'Pin the bishop to the queen and win material',
        fen: 'r1bqk2r/ppp2ppp/2n2n2/3pp1B1/1bB1P3/3P1N2/PPP2PPP/RN1QK2R w KQkq - 0 8',
        solution: ['g5f6'],
        rating: 620,
        tags: ['tactics', 'pin', 'bishop'],
        theme: 'Pin'
      },
    ]
  },
  {
    id: 'basic-tactics-3',
    title: '🏹 Basic Tactics: Skewers',
    description: 'Force the opponent to move a valuable piece, exposing a less valuable one',
    difficulty: 'Beginner',
    ratingRange: '500-900',
    totalPuzzles: 20,
    completed: 0,
    puzzles: [
      {
        id: 'skewer-1',
        title: 'Skewer King and Queen',
        description: 'Force the king to move and win the queen',
        fen: 'r2q1rk1/ppp2ppp/2n1pn2/3p2B1/2B1P3/3P1N2/PPP2PPP/RN1QK2R w KQ - 0 9',
        solution: ['g5h6'],
        rating: 720,
        tags: ['tactics', 'skewer', 'bishop'],
        theme: 'Skewer'
      },
    ]
  },
  {
    id: 'intermediate-tactics-1',
    title: '🔍 Intermediate: Discovered Attacks',
    description: 'Unleash hidden attacks by moving one piece to reveal another',
    difficulty: 'Intermediate',
    ratingRange: '800-1200',
    totalPuzzles: 30,
    completed: 0,
    puzzles: [
      {
        id: 'discovery-1',
        title: 'Discovered Check',
        description: 'Move the knight to reveal a discovered check',
        fen: 'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 4 4',
        solution: ['f3g5'],
        rating: 950,
        tags: ['tactics', 'discovered-attack', 'knight'],
        theme: 'Discovered Attack'
      },
    ]
  },
  {
    id: 'intermediate-tactics-2',
    title: '🎭 Intermediate: Deflection & Decoy',
    description: 'Master forcing the opponent\'s pieces away from important duties',
    difficulty: 'Intermediate',
    ratingRange: '900-1300',
    totalPuzzles: 25,
    completed: 0,
    puzzles: [
      {
        id: 'deflection-1',
        title: 'Deflect the Defender',
        description: 'Force the defending piece away from its post',
        fen: 'r2qk2r/ppp2ppp/2n1pn2/3p1b2/1bB1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 9',
        solution: ['c4xf7'],
        rating: 1150,
        tags: ['tactics', 'deflection', 'bishop'],
        theme: 'Deflection'
      },
    ]
  },
  {
    id: 'intermediate-tactics-3',
    title: '✂️ Intermediate: Double Attacks',
    description: 'Attack two targets simultaneously with one piece',
    difficulty: 'Intermediate',
    ratingRange: '1000-1400',
    totalPuzzles: 30,
    completed: 0,
    puzzles: [
      {
        id: 'double-1',
        title: 'Queen Double Attack',
        description: 'Attack both the king and rook with your queen',
        fen: 'r1b1k2r/ppp2ppp/2n1pn2/3q4/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 8',
        solution: ['d1d8'],
        rating: 1200,
        tags: ['tactics', 'double-attack', 'queen'],
        theme: 'Double Attack'
      },
    ]
  },
  {
    id: 'advanced-tactics-1',
    title: '🎯 Advanced: Combinations',
    description: 'Complex tactical sequences combining multiple themes',
    difficulty: 'Advanced',
    ratingRange: '1300-1700',
    totalPuzzles: 35,
    completed: 0,
    puzzles: [
      {
        id: 'combo-1',
        title: 'Fork + Pin Combination',
        description: 'Use a combination of fork and pin to win material',
        fen: 'r2qk2r/ppp1nppp/3p1n2/4p1B1/1bB1P3/2NP4/PPP2PPP/R2QK1NR w KQkq - 0 9',
        solution: ['g5xf6', 'c3d5'],
        rating: 1450,
        tags: ['tactics', 'combination', 'fork', 'pin'],
        theme: 'Combination'
      },
    ]
  },
  {
    id: 'advanced-tactics-2',
    title: '👑 Advanced: Clearance & Interference',
    description: 'Master clearing lines and blocking opponent pieces',
    difficulty: 'Advanced',
    ratingRange: '1400-1800',
    totalPuzzles: 25,
    completed: 0,
    puzzles: [
      {
        id: 'clearance-1',
        title: 'Clear the Diagonal',
        description: 'Clear your own pieces to unleash a powerful attack',
        fen: 'r1bqk1nr/ppp2ppp/2n5/3pp1B1/1bB1P3/3P1N2/PPP2PPP/RN1QK2R w KQkq - 0 8',
        solution: ['c4xf7'],
        rating: 1580,
        tags: ['tactics', 'clearance', 'bishop'],
        theme: 'Clearance'
      },
    ]
  },
  {
    id: 'endgame-studies',
    title: '♔ Endgame Studies: King & Pawn',
    description: 'Essential king and pawn endgame techniques',
    difficulty: 'Intermediate',
    ratingRange: '1100-1500',
    totalPuzzles: 40,
    completed: 0,
    puzzles: [
      {
        id: 'endgame-1',
        title: 'Opposition in King & Pawn',
        description: 'Use opposition to promote your pawn',
        fen: '8/8/8/3k4/3P4/3K4/8/8 w - - 0 1',
        solution: ['d3e3'],
        rating: 1250,
        tags: ['endgame', 'king-pawn', 'opposition'],
        theme: 'King & Pawn'
      },
    ]
  },
  {
    id: 'checkmate-patterns',
    title: '⚡ Checkmate Patterns',
    description: 'Learn essential mating patterns and sequences',
    difficulty: 'Beginner',
    ratingRange: '600-1200',
    totalPuzzles: 50,
    completed: 0,
    puzzles: [
      {
        id: 'mate-1',
        title: 'Back Rank Mate',
        description: 'Deliver checkmate on the back rank',
        fen: '6k1/5ppp/8/8/8/8/5PPP/R3R1K1 w - - 0 1',
        solution: ['a1a8'],
        rating: 850,
        tags: ['checkmate', 'back-rank', 'rook'],
        theme: 'Back Rank Mate'
      },
      {
        id: 'mate-2',
        title: 'Smothered Mate',
        description: 'Classic knight checkmate pattern',
        fen: 'r3k2r/ppp2Npp/1b5n/4p2q/2B1n3/3P4/PPP2PPP/RNBQK2R w KQkq - 0 10',
        solution: ['f7d8', 'd8f7'],
        rating: 1100,
        tags: ['checkmate', 'smothered-mate', 'knight'],
        theme: 'Smothered Mate'
      },
    ]
  }
];

const PuzzlesPage: React.FC = () => {
  const [selectedSet, setSelectedSet] = useState<PuzzleSet | null>(null);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [solvedPuzzles, setSolvedPuzzles] = useState<Set<string>>(new Set());
  const [userProgress, setUserProgress] = useState<{[key: string]: number}>({});

  useEffect(() => {
    // Initialize progress for each puzzle set
    const initialProgress: {[key: string]: number} = {};
    puzzleCurriculum.forEach(set => {
      initialProgress[set.id] = 0;
    });
    setUserProgress(initialProgress);
  }, []);

  const handlePuzzleSolved = (puzzleId: string, attempts: number, timeSpent: number) => {
    setSolvedPuzzles(prev => new Set(prev).add(puzzleId));
    
    if (selectedSet) {
      setUserProgress(prev => ({
        ...prev,
        [selectedSet.id]: prev[selectedSet.id] + 1
      }));
    }

    console.log(`Puzzle ${puzzleId} solved in ${attempts} attempts and ${timeSpent}ms`);
    
    // Auto-advance to next puzzle after a short delay
    setTimeout(() => {
      if (selectedSet && currentPuzzleIndex < selectedSet.puzzles.length - 1) {
        setCurrentPuzzleIndex(currentPuzzleIndex + 1);
      }
    }, 2000);
  };

  const handlePuzzleSkip = (puzzleId: string) => {
    console.log(`Puzzle ${puzzleId} skipped`);
    if (selectedSet && currentPuzzleIndex < selectedSet.puzzles.length - 1) {
      setCurrentPuzzleIndex(currentPuzzleIndex + 1);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return { 
        backgroundColor: 'var(--color-success-subtle)', 
        color: 'var(--color-success)',
        borderColor: 'var(--color-success)'
      };
      case 'Intermediate': return { 
        backgroundColor: 'var(--color-warning-subtle)', 
        color: 'var(--color-warning)',
        borderColor: 'var(--color-warning)'
      };
      case 'Advanced': return { 
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

  const getTotalPuzzles = () => {
    return puzzleCurriculum.reduce((total, set) => total + set.totalPuzzles, 0);
  };

  const getTotalSolved = () => {
    return Object.values(userProgress).reduce((total, solved) => total + solved, 0);
  };

  if (selectedSet) {
    const currentPuzzle = selectedSet.puzzles[currentPuzzleIndex];
    const progressPercent = Math.round((userProgress[selectedSet.id] / selectedSet.totalPuzzles) * 100);

    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-base)' }}>
        <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header with back button */}
        <div className="flex items-center mb-8">
          <Button 
            variant="outline" 
            onClick={() => setSelectedSet(null)}
            className="mr-4"
          >
            ← Back to Curriculum
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{selectedSet.title}</h1>
            <p className="text-muted-foreground">{selectedSet.description}</p>
          </div>
        </div>

        {/* Progress Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 text-center" style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border-default)' }}>
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--color-accent-primary)' }}>
              {currentPuzzleIndex + 1}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Current Puzzle</div>
          </Card>
          
          <Card className="p-4 text-center" style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border-default)' }}>
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--color-success)' }}>
              {userProgress[selectedSet.id]}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Solved</div>
          </Card>
          
          <Card className="p-4 text-center" style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border-default)' }}>
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--color-accent-primary)' }}>
              {progressPercent}%
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Progress</div>
          </Card>

          <Card className="p-4 text-center" style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border-default)' }}>
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--color-warning)' }}>
              {selectedSet.ratingRange}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Rating Range</div>
          </Card>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span>Set Progress</span>
            <span>{userProgress[selectedSet.id]} / {selectedSet.totalPuzzles}</span>
          </div>
          <Progress value={progressPercent} className="h-3" />
        </div>

        {/* Current Puzzle */}
        {currentPuzzle && (
          <div className="max-w-4xl mx-auto">
            <ChessPuzzle
              puzzle={currentPuzzle}
              onSolved={handlePuzzleSolved}
              onSkip={handlePuzzleSkip}
              showHints={true}
            />
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentPuzzleIndex(Math.max(0, currentPuzzleIndex - 1))}
            disabled={currentPuzzleIndex === 0}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentPuzzleIndex + 1} of {selectedSet.puzzles.length}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPuzzleIndex(Math.min(selectedSet.puzzles.length - 1, currentPuzzleIndex + 1))}
            disabled={currentPuzzleIndex === selectedSet.puzzles.length - 1}
          >
            Next
          </Button>
        </div>
        </div>
      </div>
    );
  }

  // Main curriculum view
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--color-accent-primary)' }}>
              🧩 Chess Puzzles Curriculum
            </h1>
            <p className="text-lg mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              Complete A→Z structured learning path from basic tactics to advanced combinations
            </p>
            
            {/* Overall Progress Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <Card className="p-6 text-center" style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-accent-primary)', borderWidth: '2px' }}>
                <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-accent-primary)' }}>
                  {getTotalPuzzles()}
                </div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Total Puzzles</div>
              </Card>
              
              <Card className="p-6 text-center" style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-success)', borderWidth: '2px' }}>
                <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-success)' }}>
                  {getTotalSolved()}
                </div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Puzzles Solved</div>
              </Card>
              
              <Card className="p-6 text-center" style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-accent-primary)', borderWidth: '2px' }}>
                <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-accent-primary)' }}>
                  {puzzleCurriculum.length}
                </div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Learning Modules</div>
              </Card>
            </div>
          </motion.div>
        </div>

        {/* Curriculum Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {puzzleCurriculum.map((puzzleSet, index) => {
            const completed = userProgress[puzzleSet.id] || 0;
            const progressPercent = Math.round((completed / puzzleSet.totalPuzzles) * 100);
            
            return (
              <motion.div
                key={puzzleSet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card 
                  className="h-full hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                  style={{
                    backgroundColor: 'var(--color-surface-elevated)',
                    borderColor: 'var(--color-border-default)',
                    borderWidth: '2px'
                  }}
                  onClick={() => {
                    setSelectedSet(puzzleSet);
                    setCurrentPuzzleIndex(0);
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-3">
                      <Badge style={getDifficultyColor(puzzleSet.difficulty)}>
                        {puzzleSet.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {puzzleSet.ratingRange}
                      </Badge>
                    </div>
                    
                    <CardTitle className="text-lg font-bold leading-tight">
                      {puzzleSet.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {puzzleSet.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {/* Progress */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium">Progress</span>
                          <span className="text-text-secondary">
                            {completed} / {puzzleSet.totalPuzzles}
                          </span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--color-surface)' }}>
                          <div className="text-lg font-bold" style={{ color: 'var(--color-accent-primary)' }}>
                            {puzzleSet.totalPuzzles}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Puzzles</div>
                        </div>
                        <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--color-surface)' }}>
                          <div className="text-lg font-bold" style={{ color: 'var(--color-success)' }}>
                            {progressPercent}%
                          </div>
                          <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Complete</div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button 
                        className="w-full" 
                        variant={completed > 0 ? "primary" : "outline"}
                      >
                        {completed > 0 ? '📚 Continue' : '🚀 Start Learning'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Learning Path Info */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-12 text-center"
        >
          <Card className="max-w-4xl mx-auto p-8" style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-warning)', borderWidth: '2px' }}>
            <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              🎯 Structured Learning Path
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div>
                <h4 className="font-semibold text-green-700 mb-2">📚 Beginner (400-1000)</h4>
                <ul className="text-sm text-green-600 space-y-1">
                  <li>• Basic Tactics (Forks, Pins, Skewers)</li>
                  <li>• Fundamental Checkmate Patterns</li>
                  <li>• Simple Combinations</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-yellow-700 mb-2">🔍 Intermediate (1000-1500)</h4>
                <ul className="text-sm text-yellow-600 space-y-1">
                  <li>• Advanced Tactics & Combinations</li>
                  <li>• Deflection, Decoy, Discovery</li>
                  <li>• King & Pawn Endgames</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-red-700 mb-2">🎯 Advanced (1500-1800)</h4>
                <ul className="text-sm text-red-600 space-y-1">
                  <li>• Complex Combinations</li>
                  <li>• Clearance & Interference</li>
                  <li>• Master-level Tactics</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default PuzzlesPage;