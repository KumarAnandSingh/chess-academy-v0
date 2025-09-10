import React, { useState, useEffect } from 'react';
import { ChessBoard } from './ChessBoard';
import { useGamificationStore } from '../../stores/gamificationStore';
import { AICoach } from '../ai/AICoach';
import { usePuzzleCoach } from '../../hooks/useAICoach';
import { ResponsiveContainer } from '../ui/ResponsiveContainer';
import { AnimatedButton } from '../ui/AnimatedButton';
import { LinearProgress, MotivationalNotification } from '../ui/ProgressIndicators';
import { FadeIn, Bounce } from '../ui/AnimationUtils';
import { audioService } from '../../services/audioService';

interface ChessPuzzleData {
  id: string;
  title: string;
  description: string;
  fen: string;
  solution: string[];
  rating: number;
  tags: string[];
}

interface ChessPuzzleProps {
  puzzle: ChessPuzzleData;
  onSolved?: (puzzleId: string, attempts: number, timeSpent: number) => void;
  onSkip?: (puzzleId: string) => void;
  showHints?: boolean;
}

export const ChessPuzzle: React.FC<ChessPuzzleProps> = ({
  puzzle,
  onSolved,
  onSkip,
  showHints = true,
}) => {
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [isComplete, setIsComplete] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'hint' | null;
    message: string;
  }>({ type: null, message: '' });
  const [showSolution, setShowSolution] = useState(false);
  const [xpGained, setXpGained] = useState(0);
  const [showAICoach, setShowAICoach] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'achievement' | 'streak' | 'level' | 'encouragement';
    isVisible: boolean;
  }>({ message: '', type: 'success', isVisible: false });

  const { solvePuzzle } = useGamificationStore();
  const aiCoach = usePuzzleCoach();

  useEffect(() => {
    setStartTime(Date.now());
    setCurrentMoveIndex(0);
    setAttempts(0);
    setIsComplete(false);
    setFeedback({ type: null, message: '' });
    setShowSolution(false);
    setXpGained(0);
  }, [puzzle.id]);

  const handleCorrectMove = () => {
    const newMoveIndex = currentMoveIndex + 1;
    setCurrentMoveIndex(newMoveIndex);
    
    if (newMoveIndex >= puzzle.solution.length) {
      // Puzzle completed!
      setIsComplete(true);
      const timeSpent = Date.now() - startTime;
      
      // Calculate XP based on attempts and time (matching gamification store logic)
      let xpGain = 30; // Base XP for puzzle solving
      const bonuses = [];
      if (attempts === 0) {
        xpGain += 20;
        bonuses.push('Perfect!');
      }
      if (timeSpent < 30000) {
        xpGain += 15;
        bonuses.push('Speed Bonus!');
      }
      setXpGained(xpGain);
      
      // Award XP through gamification system
      solvePuzzle(puzzle.id, attempts + 1, timeSpent);
      
      // Play celebration sounds
      audioService.playCelebration();
      
      // Show motivational notification
      setNotification({
        message: `Puzzle Solved! +${xpGain} XP${bonuses.length > 0 ? ' (' + bonuses.join(', ') + ')' : ''}`,
        type: 'achievement',
        isVisible: true
      });
      
      setFeedback({
        type: 'success',
        message: '🎉 Puzzle solved!',
      });
      
      onSolved?.(puzzle.id, attempts + 1, timeSpent);
    } else {
      // Correct move, but not finished yet
      audioService.playUISound('success');
      setFeedback({
        type: 'success',
        message: 'Correct! Keep going...',
      });
      
      // Encouraging notification for progress
      if (newMoveIndex === 1) {
        setNotification({
          message: 'Great start! You found the right move!',
          type: 'encouragement',
          isVisible: true
        });
      }
    }
  };

  const handleIncorrectMove = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    
    // Play error sound
    audioService.playUISound('error');
    
    // Get AI coaching for incorrect move
    aiCoach.onMoveAnalysis('', false, puzzle.fen);
    
    let message = 'Not quite right. Try again!';
    
    if (newAttempts >= 3 && showHints) {
      const nextMove = puzzle.solution[currentMoveIndex];
      if (nextMove) {
        const fromSquare = nextMove.slice(0, 2);
        const toSquare = nextMove.slice(2, 4);
        message = `💡 Hint: Try moving from ${fromSquare} to ${toSquare}`;
        audioService.playUISound('notification');
      }
    } else if (newAttempts === 2) {
      message = "Don't give up! Think about the position...";
    } else if (newAttempts >= 5) {
      message = "Keep trying! Every attempt makes you stronger 💪";
    }
    
    setFeedback({
      type: newAttempts >= 3 ? 'hint' : 'error',
      message,
    });
    
    // Show encouraging notification for multiple attempts
    if (newAttempts === 3) {
      setNotification({
        message: "Hang in there! Learning takes practice.",
        type: 'encouragement',
        isVisible: true
      });
    }
  };

  const handleSkip = () => {
    onSkip?.(puzzle.id);
    setShowSolution(true);
  };

  const resetPuzzle = () => {
    setCurrentMoveIndex(0);
    setAttempts(0);
    setStartTime(Date.now());
    setIsComplete(false);
    setFeedback({ type: null, message: '' });
    setShowSolution(false);
    setXpGained(0);
  };

  return (
    <ResponsiveContainer maxWidth="xl" className="chess-puzzle">
      {/* Motivational Notification */}
      <MotivationalNotification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={() => setNotification({ ...notification, isVisible: false })}
      />

      <div className="min-h-screen flex flex-col gap-8 lg:flex-row lg:justify-between">
        {/* Chess Board Section */}
        <div className="flex flex-col items-center lg:w-1/2">
          <FadeIn direction="up">
            <div className="relative">
              <ChessBoard
                fen={puzzle.fen}
                puzzleMode={true}
                correctMoves={puzzle.solution}
                onCorrectMove={handleCorrectMove}
                onIncorrectMove={handleIncorrectMove}
                disabled={isComplete || showSolution}
                highlightMoves={true}
                showCoordinates={true}
              />
              
              {/* Completion overlay */}
              {isComplete && (
                <div className="absolute inset-0 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-success-subtle)', opacity: 0.9 }}>
                  <Bounce trigger={true}>
                    <div className="text-4xl">🎉</div>
                  </Bounce>
                </div>
              )}
            </div>
          </FadeIn>
          
          {/* Board Controls */}
          <FadeIn direction="up" delay={200}>
            <div className="flex flex-wrap gap-2 mt-6">
              <AnimatedButton
                onClick={resetPuzzle}
                variant="secondary"
                size="md"
                icon={<span>🔄</span>}
              >
                Reset
              </AnimatedButton>
              
              <AnimatedButton
                onClick={handleSkip}
                variant="warning"
                size="md"
                disabled={isComplete}
                icon={<span>💡</span>}
              >
                Show Solution
              </AnimatedButton>
              
              <AnimatedButton
                onClick={() => setShowAICoach(!showAICoach)}
                variant="primary"
                size="md"
                icon={<span>🤖</span>}
                pulse={aiCoach.isVisible}
              >
                Coach
              </AnimatedButton>
              
              {aiCoach.canRequestHint && !isComplete && (
                <AnimatedButton
                  onClick={() => aiCoach.getHint(puzzle.fen, attempts, 'tactical')}
                  variant="ghost"
                  size="md"
                  icon={<span>💭</span>}
                >
                  Hint
                </AnimatedButton>
              )}
            </div>
          </FadeIn>
        </div>

        {/* Puzzle Info Section */}
        <div className="flex flex-col gap-6 lg:w-1/2">
          {/* AI Coach */}
          {(showAICoach || aiCoach.isVisible) && (
            <FadeIn direction="left">
              <AICoach
                position={puzzle.fen}
                playerLevel={puzzle.rating / 100}
                isVisible={showAICoach || aiCoach.isVisible}
                onClose={() => {
                  setShowAICoach(false);
                  aiCoach.hideCoach();
                }}
                mode="puzzle"
                context={{
                  attemptCount: attempts,
                  puzzleType: 'tactical',
                  isCorrectMove: feedback.type === 'success'
                }}
              />
            </FadeIn>
          )}

          {/* Puzzle Header */}
          <FadeIn direction="right" delay={100}>
            <div className="p-6 rounded-xl shadow-sm" style={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)' }}>
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>{puzzle.title}</h2>
              <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>{puzzle.description}</p>
              
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: 'var(--color-accent-primary-subtle)', color: 'var(--color-accent-primary)' }}>
                  Rating: {puzzle.rating}
                </span>
                {puzzle.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-sm hover-lift" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-secondary)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Feedback */}
          {feedback.type && (
            <FadeIn direction="right" delay={150}>
              <div
                className="p-4 rounded-lg border-l-4 shadow-sm" style={{
                  backgroundColor: feedback.type === 'success' ? 'var(--color-success-subtle)' : feedback.type === 'error' ? 'var(--color-danger-subtle)' : 'var(--color-warning-subtle)',
                  color: feedback.type === 'success' ? 'var(--color-success)' : feedback.type === 'error' ? 'var(--color-danger)' : 'var(--color-warning)',
                  borderLeftColor: feedback.type === 'success' ? 'var(--color-success)' : feedback.type === 'error' ? 'var(--color-danger)' : 'var(--color-warning)'
                }}
              >
                <p className="font-medium flex items-center gap-2">
                  {feedback.type === 'success' && <span>✅</span>}
                  {feedback.type === 'error' && <span>❌</span>}
                  {feedback.type === 'hint' && <span>💡</span>}
                  {feedback.message}
                </p>
              </div>
            </FadeIn>
          )}

          {/* Progress */}
          <FadeIn direction="right" delay={200}>
            <div className="p-6 rounded-xl" style={{ background: 'linear-gradient(135deg, var(--color-accent-primary-subtle) 0%, var(--color-surface-elevated) 100%)', border: '1px solid var(--color-border-subtle)' }}>
              <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                <span>📊</span> Progress
              </h3>
              
              <div className="space-y-4">
                <LinearProgress
                  progress={(currentMoveIndex / puzzle.solution.length) * 100}
                  color="blue"
                  label={`Moves completed: ${currentMoveIndex} / ${puzzle.solution.length}`}
                  animate={true}
                />
                
                <div className="flex justify-between text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  <div className="flex items-center gap-1">
                    <span>🎯</span>
                    <span>Attempts: {attempts}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>⏱️</span>
                    <span>Time: {Math.floor((Date.now() - startTime) / 1000)}s</span>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Solution (when shown) */}
          {showSolution && (
            <FadeIn direction="right" delay={250}>
              <div className="p-6 rounded-xl shadow-sm" style={{ background: 'linear-gradient(135deg, var(--color-accent-primary-subtle) 0%, var(--color-surface-elevated) 100%)', border: '1px solid var(--color-border-subtle)' }}>
                <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-accent-primary)' }}>
                  <span>🔍</span> Solution
                </h3>
                <div className="space-y-2 text-sm" style={{ color: 'var(--color-accent-primary)' }}>
                  {puzzle.solution.map((move, index) => (
                    <div key={index} className="flex justify-between py-2 px-3 rounded-lg hover-lift" style={{ backgroundColor: 'var(--color-surface)', opacity: 0.8 }}>
                      <span className="font-medium">Move {index + 1}:</span>
                      <span className="font-mono font-bold" style={{ color: 'var(--color-accent-primary)' }}>{move}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}

          {/* Completion */}
          {isComplete && (
            <FadeIn direction="scale" delay={300}>
              <div className="p-6 rounded-xl shadow-lg" style={{ background: 'linear-gradient(135deg, var(--color-success-subtle) 0%, var(--color-surface-elevated) 100%)', border: '1px solid var(--color-success)' }}>
                <Bounce trigger={true}>
                  <h3 className="font-bold mb-4 text-xl flex items-center gap-2" style={{ color: 'var(--color-success)' }}>
                    <span>🎉</span> Puzzle Solved!
                  </h3>
                </Bounce>
                
                <div className="flex flex-col gap-2 text-sm" style={{ color: 'var(--color-success)' }}>
                  <div className="flex justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--color-surface)', opacity: 0.8 }}>
                    <span>🎯 Attempts:</span>
                    <span className="font-bold">{attempts + 1}</span>
                  </div>
                  
                  <div className="flex justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--color-surface)', opacity: 0.8 }}>
                    <span>⏱️ Time:</span>
                    <span className="font-bold">{Math.floor((Date.now() - startTime) / 1000)}s</span>
                  </div>
                  
                  <div className="p-3 rounded-lg text-center" style={{ background: 'linear-gradient(90deg, var(--color-warning-subtle) 0%, var(--color-surface-elevated) 100%)' }}>
                    <div className="text-2xl font-bold mb-2" style={{ color: 'var(--color-success)' }}>
                      +{xpGained} XP
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                      {attempts === 0 && (
                        <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: 'var(--color-warning-subtle)', color: 'var(--color-warning)' }}>
                          🌟 Perfect!
                        </span>
                      )}
                      {(Date.now() - startTime) < 30000 && (
                        <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: 'var(--color-accent-primary-subtle)', color: 'var(--color-accent-primary)' }}>
                          ⚡ Speed Bonus!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          )}
        </div>
      </div>
    </ResponsiveContainer>
  );
};