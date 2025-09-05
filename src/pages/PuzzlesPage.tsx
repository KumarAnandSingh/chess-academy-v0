import React, { useState } from 'react';
import { ChessPuzzle } from '../components/chess/ChessPuzzle';

// Mock puzzle data - this would come from your backend API
const mockPuzzles = [
  {
    id: '1',
    title: 'Mate in 2',
    description: 'White to move and checkmate in 2 moves. This is a classic back-rank mate pattern.',
    fen: '6k1/5ppp/8/8/8/8/5PPP/R3R1K1 w - - 0 1',
    solution: ['a1a8', 'e1e8'],
    rating: 1200,
    tags: ['checkmate', 'back-rank', 'beginner'],
  },
  {
    id: '2',
    title: 'Fork the King and Queen',
    description: 'White to move and win material by forking the black king and queen.',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 4',
    solution: ['f3g5'],
    rating: 800,
    tags: ['tactics', 'fork', 'beginner'],
  },
  {
    id: '3',
    title: 'Pin and Win',
    description: 'Use a pin to win material. Black cannot move the knight without losing the queen.',
    fen: 'r1bqkb1r/ppp2ppp/2n2n2/3pp3/2B1P3/3P1N2/PPP2PPP/RNBQ1RK1 w kq - 0 6',
    solution: ['c1g5'],
    rating: 1000,
    tags: ['tactics', 'pin', 'beginner'],
  },
];

const PuzzlesPage: React.FC = () => {
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [solvedPuzzles, setSolvedPuzzles] = useState<Set<string>>(new Set());
  
  const currentPuzzle = mockPuzzles[currentPuzzleIndex];

  const handlePuzzleSolved = (puzzleId: string, attempts: number, timeSpent: number) => {
    setSolvedPuzzles(prev => new Set(prev).add(puzzleId));
    console.log(`Puzzle ${puzzleId} solved in ${attempts} attempts and ${timeSpent}ms`);
    
    // Auto-advance to next puzzle after a short delay
    setTimeout(() => {
      if (currentPuzzleIndex < mockPuzzles.length - 1) {
        setCurrentPuzzleIndex(currentPuzzleIndex + 1);
      }
    }, 2000);
  };

  const handlePuzzleSkip = (puzzleId: string) => {
    console.log(`Puzzle ${puzzleId} skipped`);
    if (currentPuzzleIndex < mockPuzzles.length - 1) {
      setCurrentPuzzleIndex(currentPuzzleIndex + 1);
    }
  };

  const goToPuzzle = (index: number) => {
    setCurrentPuzzleIndex(index);
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Chess Puzzles</h1>
          <p className="text-gray-600 mb-6">
            Sharpen your tactical skills with these chess puzzles. Look for checkmates, forks, pins, and other tactical motifs!
          </p>
          
          {/* Puzzle Navigation */}
          <div className="flex gap-2 mb-6">
            <span className="text-sm font-medium text-gray-700 self-center mr-2">Puzzles:</span>
            {mockPuzzles.map((puzzle, index) => (
              <button
                key={puzzle.id}
                onClick={() => goToPuzzle(index)}
                className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                  index === currentPuzzleIndex
                    ? 'bg-blue-600 text-white'
                    : solvedPuzzles.has(puzzle.id)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {/* Progress Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">
                {currentPuzzleIndex + 1}
              </div>
              <div className="text-sm text-gray-600">Current Puzzle</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-green-600">
                {solvedPuzzles.size}
              </div>
              <div className="text-sm text-gray-600">Solved</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((solvedPuzzles.size / mockPuzzles.length) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Completion</div>
            </div>
          </div>
        </div>

        {/* Current Puzzle */}
        {currentPuzzle && (
          <ChessPuzzle
            puzzle={currentPuzzle}
            onSolved={handlePuzzleSolved}
            onSkip={handlePuzzleSkip}
            showHints={true}
          />
        )}

        {/* Completion Message */}
        {currentPuzzleIndex >= mockPuzzles.length && (
          <div className="text-center bg-green-50 border border-green-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-green-800 mb-2">
              🎉 All Puzzles Complete!
            </h2>
            <p className="text-green-700 mb-4">
              Congratulations! You've solved {solvedPuzzles.size} out of {mockPuzzles.length} puzzles.
            </p>
            <button
              onClick={() => setCurrentPuzzleIndex(0)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Start Over
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PuzzlesPage;