/**
 * Calibration Test Component - 12-Position Strength Assessment
 * Determines user's tactics rating and identifies weak motifs
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { motion, AnimatePresence } from 'framer-motion';

interface CalibrationPosition {
  position: number;
  fen: string;
  theme: string;
  difficulty: number;
  timeLimit: number;
  description: string;
  totalPositions: number;
  progress: number;
}

interface CalibrationResult {
  tacticsRating: number;
  weakMotifs: string[];
  completedAt: string;
  summary: {
    level: string;
    message: string;
    rating: number;
    nextSteps: string[];
  };
}

interface MoveResult {
  isCorrect: boolean;
  correctMove: string;
  explanation: string;
}

const CalibrationTest: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'not_started' | 'in_progress' | 'completed'>('loading');
  const [currentPosition, setCurrentPosition] = useState<CalibrationPosition | null>(null);
  const [game, setGame] = useState<Chess | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isThinking, setIsThinking] = useState(false);
  const [moveResult, setMoveResult] = useState<MoveResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<CalibrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mock token for API calls
  const mockToken = 'mock-jwt-token';

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && status === 'in_progress' && !isThinking) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && currentPosition && !isThinking) {
      // Time's up - submit empty move
      handleMoveSubmit('');
    }
  }, [timeLeft, status, isThinking, currentPosition]);

  // Initialize calibration
  useEffect(() => {
    initializeCalibration();
  }, []);

  const initializeCalibration = async () => {
    try {
      setStatus('loading');
      const response = await fetch('http://localhost:3001/api/calibration/start', {
        headers: {
          'Authorization': `Bearer ${mockToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to start calibration');
      }

      const data = await response.json();

      if (data.status === 'completed') {
        setResult(data);
        setStatus('completed');
      } else if (data.status === 'in_progress' || data.status === 'started') {
        setCurrentPosition(data);
        setGame(new Chess(data.fen));
        setTimeLeft(data.timeLimit);
        setStatus('in_progress');
      }
    } catch (err) {
      console.error('Error initializing calibration:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize calibration');
      setStatus('not_started');
    }
  };

  const handleMoveSubmit = async (move: string) => {
    if (!currentPosition || isThinking) return;

    setIsThinking(true);
    const timeSpent = currentPosition.timeLimit - timeLeft;

    try {
      const response = await fetch('http://localhost:3001/api/calibration/submit-move', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mockToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          move: move || 'timeout',
          timeSpent
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit move');
      }

      const data = await response.json();
      setMoveResult(data.result);
      setShowResult(true);

      // Auto-advance after showing result
      setTimeout(() => {
        if (data.status === 'completed') {
          // Fetch final results
          fetchCalibrationResult();
        } else if (data.next) {
          // Move to next position
          setCurrentPosition(data.next);
          setGame(new Chess(data.next.fen));
          setTimeLeft(data.next.timeLimit);
          setMoveResult(null);
          setShowResult(false);
        }
        setIsThinking(false);
      }, 3000);

    } catch (err) {
      console.error('Error submitting move:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit move');
      setIsThinking(false);
    }
  };

  const fetchCalibrationResult = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/calibration/result', {
        headers: {
          'Authorization': `Bearer ${mockToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }

      const data = await response.json();
      setResult(data);
      setStatus('completed');
    } catch (err) {
      console.error('Error fetching results:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch results');
    }
  };

  const handlePieceDrop = useCallback((sourceSquare: string, targetSquare: string) => {
    if (!game || isThinking || showResult) return false;

    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      });

      if (move) {
        handleMoveSubmit(move.san);
        return true;
      }
    } catch (error) {
      // Invalid move
    }
    return false;
  }, [game, isThinking, showResult]);

  const handleSkipPosition = () => {
    handleMoveSubmit('skip');
  };

  if (error) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={initializeCalibration}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calibration test...</p>
        </div>
      </div>
    );
  }

  if (status === 'completed' && result) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto bg-white rounded-xl shadow-lg overflow-hidden"
      >
        {/* Results Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-600 p-6 text-white text-center">
          <div className="text-4xl mb-2">🎉</div>
          <h2 className="text-2xl font-bold mb-2">Calibration Complete!</h2>
          <p className="text-green-100">Your chess strength has been assessed</p>
        </div>

        {/* Results Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {result.tacticsRating}
            </div>
            <div className="text-lg text-gray-600 mb-1">Tactics Rating</div>
            <div className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full inline-block">
              {result.summary.level}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Assessment Summary</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              {result.summary.message}
            </p>
          </div>

          {result.weakMotifs && result.weakMotifs.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Areas to Focus On</h3>
              <div className="flex flex-wrap gap-2">
                {result.weakMotifs.map((motif, index) => (
                  <span
                    key={index}
                    className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full"
                  >
                    {motif}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Next Steps</h3>
            <ul className="space-y-1">
              {result.summary.nextSteps.map((step, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 flex-shrink-0"></span>
                  {step}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => window.location.href = '/phase0'}
            className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-4 rounded-md font-medium hover:from-green-600 hover:to-blue-700 transition-colors"
          >
            Start Your Learning Journey
          </button>
        </div>
      </motion.div>
    );
  }

  if (status === 'in_progress' && currentPosition && game) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chess Board */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Position Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">
                      Position {currentPosition.progress} of {currentPosition.totalPositions}
                    </h3>
                    <p className="text-sm text-blue-100 capitalize">
                      {currentPosition.theme} • Difficulty: {currentPosition.difficulty}/6
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{timeLeft}</div>
                    <div className="text-xs text-blue-100">seconds</div>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="mt-3 bg-blue-400/30 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentPosition.progress / currentPosition.totalPositions) * 100}%` }}
                  />
                </div>
              </div>

              {/* Chess Board */}
              <div className="p-4">
                <div className="mb-4">
                  <p className="text-gray-700 text-center font-medium">
                    {currentPosition.description}
                  </p>
                </div>
                
                <Chessboard
                  options={{
                    position: game.fen(),
                    onPieceDrop: ({ sourceSquare, targetSquare }: any) => handlePieceDrop(sourceSquare, targetSquare),
                    allowDragging: !(isThinking || showResult),
                    boardOrientation: "white",
                    boardStyle: {
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            {/* Instructions */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Instructions</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Find the best move for the position</li>
                <li>• Drag and drop pieces to make your move</li>
                <li>• Think quickly - time is limited!</li>
                <li>• Each position tests different tactics</li>
              </ul>
            </div>

            {/* Current Theme */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-1 capitalize">
                {currentPosition.theme.replace('_', ' ')} Theme
              </h3>
              <p className="text-sm text-blue-700">
                Look for patterns involving this tactical motif
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={handleSkipPosition}
                disabled={isThinking}
                className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Skip Position
              </button>
            </div>

            {/* Status */}
            {isThinking && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                  <span className="text-sm text-yellow-800">Processing your move...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Move Result Modal */}
        <AnimatePresence>
          {showResult && moveResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-xl p-6 max-w-md mx-4"
              >
                <div className="text-center">
                  <div className={`text-4xl mb-3 ${moveResult.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                    {moveResult.isCorrect ? '✓' : '✗'}
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${moveResult.isCorrect ? 'text-green-900' : 'text-red-900'}`}>
                    {moveResult.isCorrect ? 'Correct!' : 'Incorrect'}
                  </h3>
                  {!moveResult.isCorrect && (
                    <p className="text-gray-600 text-sm mb-2">
                      Best move: <strong>{moveResult.correctMove}</strong>
                    </p>
                  )}
                  <p className="text-gray-700 text-sm">
                    {moveResult.explanation}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return null;
};

export default CalibrationTest;