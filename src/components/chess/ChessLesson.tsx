import React, { useState, useEffect } from 'react';
import { ChessBoard } from './ChessBoard';
import { useGamificationStore } from '../../stores/gamificationStore';
import { AICoach } from '../ai/AICoach';
import { useLessonCoach } from '../../hooks/useAICoach';

interface LessonStep {
  id: string;
  title: string;
  content: string;
  fen?: string;
  highlightSquares?: string[];
  allowedMoves?: string[];
  targetMove?: string;
  explanation?: string;
}

interface ChessLessonData {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  steps: LessonStep[];
}

interface ChessLessonProps {
  lesson: ChessLessonData;
  onComplete?: (lessonId: string, timeSpent: number, score: number) => void;
  onStepComplete?: (stepId: string, isCorrect: boolean) => void;
}

export const ChessLesson: React.FC<ChessLessonProps> = ({
  lesson,
  onComplete,
  onStepComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAnswers, setTotalAnswers] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [stepFeedback, setStepFeedback] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [showAICoach, setShowAICoach] = useState(false);
  
  const { completeLesson } = useGamificationStore();
  const aiCoach = useLessonCoach(lesson.title);

  const currentStep = lesson.steps[currentStepIndex];
  const isLastStep = currentStepIndex === lesson.steps.length - 1;

  useEffect(() => {
    setStartTime(Date.now());
    setCurrentStepIndex(0);
    setScore(0);
    setIsComplete(false);
    setShowExplanation(false);
    setStepFeedback({ type: null, message: '' });
  }, [lesson.id]);

  const handleMoveAttempt = (move: { from: string; to: string; promotion?: string }) => {
    if (!currentStep.targetMove) {
      // This step doesn't require a specific move, just advance
      handleStepComplete(true);
      return;
    }

    const moveString = `${move.from}${move.to}${move.promotion || ''}`;
    const isCorrect = currentStep.allowedMoves?.includes(moveString) || 
                     moveString === currentStep.targetMove;

    // Get AI coaching for the move
    if (currentStep.fen) {
      aiCoach.onMoveAnalysis(moveString, isCorrect, currentStep.fen);
    }

    if (isCorrect) {
      handleStepComplete(true);
    } else {
      setStepFeedback({
        type: 'error',
        message: 'That\'s not the right move. Try again!',
      });
      onStepComplete?.(currentStep.id, false);
    }
  };

  const handleStepComplete = (isCorrect: boolean) => {
    setTotalAnswers(prev => prev + 1);
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setScore(score + 10);
      setStepFeedback({
        type: 'success',
        message: 'Excellent! Well done.',
      });
    } else {
      setStepFeedback({
        type: 'error',
        message: 'Not quite right, but keep trying!',
      });
    }

    onStepComplete?.(currentStep.id, isCorrect);

    // Show explanation if available
    if (currentStep.explanation) {
      setShowExplanation(true);
    } else {
      // Move to next step immediately if no explanation
      setTimeout(() => {
        nextStep();
      }, 1500);
    }
  };

  const nextStep = () => {
    setShowExplanation(false);
    setStepFeedback({ type: null, message: '' });

    if (isLastStep) {
      // Lesson complete
      const timeSpent = Date.now() - startTime;
      const accuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 100;
      
      // Award XP through gamification system
      completeLesson(lesson.id, Math.floor(timeSpent / 60000), accuracy); // Convert ms to minutes
      
      setIsComplete(true);
      onComplete?.(lesson.id, timeSpent, score);
    } else {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const previousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setShowExplanation(false);
      setStepFeedback({ type: null, message: '' });
    }
  };

  const restartLesson = () => {
    setCurrentStepIndex(0);
    setStartTime(Date.now());
    setScore(0);
    setIsComplete(false);
    setShowExplanation(false);
    setStepFeedback({ type: null, message: '' });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-600 bg-green-50';
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-50';
      case 'advanced':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (isComplete) {
    return (
      <div className="chess-lesson max-w-4xl mx-auto p-6">
        <div className="text-center bg-green-50 border border-green-200 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-green-800 mb-4">
            🎉 Lesson Complete!
          </h2>
          <p className="text-lg text-green-700 mb-4">
            Congratulations on completing "{lesson.title}"
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-surface-elevated)' }}>
              <div className="text-2xl font-bold text-green-600">{score}</div>
              <div className="text-sm text-gray-600">Points Earned</div>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-surface-elevated)' }}>
              <div className="text-2xl font-bold text-blue-600">
                {Math.floor((Date.now() - startTime) / 1000 / 60)}m
              </div>
              <div className="text-sm text-gray-600">Time Spent</div>
            </div>
          </div>
          <button
            onClick={restartLesson}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Practice Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chess-lesson max-w-6xl mx-auto p-6">
      {/* Lesson Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(lesson.difficulty)}`}>
            {lesson.difficulty}
          </span>
        </div>
        <p className="text-gray-600">{lesson.description}</p>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{currentStepIndex + 1} / {lesson.steps.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentStepIndex + 1) / lesson.steps.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chess Board */}
        <div className="flex flex-col items-center">
          <ChessBoard
            fen={currentStep.fen}
            onMove={handleMoveAttempt}
            highlightMoves={true}
            showCoordinates={true}
            allowAllMoves={!currentStep.targetMove}
            disabled={showExplanation}
          />
          
          {/* Step Controls */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={previousStep}
              disabled={currentStepIndex === 0}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => handleStepComplete(false)}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
            >
              Skip
            </button>
            <button
              onClick={() => setShowAICoach(!showAICoach)}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            >
              🤖 Coach
            </button>
          </div>
        </div>

        {/* Lesson Content */}
        <div className="space-y-6">
          {/* AI Coach */}
          {(showAICoach || aiCoach.isVisible) && (
            <AICoach
              position={currentStep.fen || ''}
              playerLevel={Math.floor(score / 10) + 1}
              isVisible={showAICoach || aiCoach.isVisible}
              onClose={() => {
                setShowAICoach(false);
                aiCoach.hideCoach();
              }}
              mode="lesson"
              context={{
                lessonTopic: lesson.title,
                isCorrectMove: stepFeedback.type === 'success'
              }}
            />
          )}

          {/* Current Step */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Step {currentStepIndex + 1}: {currentStep.title}
            </h2>
            <div className="prose prose-sm text-gray-700">
              {currentStep.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-2">{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Feedback */}
          {stepFeedback.type && (
            <div
              className={`p-4 rounded-lg ${
                stepFeedback.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              <p className="font-medium">{stepFeedback.message}</p>
            </div>
          )}

          {/* Explanation (shown after correct move) */}
          {showExplanation && currentStep.explanation && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Explanation</h3>
              <p className="text-blue-800 text-sm mb-4">{currentStep.explanation}</p>
              <button
                onClick={nextStep}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                {isLastStep ? 'Complete Lesson' : 'Next Step'}
              </button>
            </div>
          )}

          {/* Lesson Stats */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Lesson Stats</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Score:</span>
                <span className="font-medium ml-2">{score} points</span>
              </div>
              <div>
                <span className="text-gray-600">Time:</span>
                <span className="font-medium ml-2">
                  {Math.floor((Date.now() - startTime) / 1000 / 60)}m {Math.floor(((Date.now() - startTime) / 1000) % 60)}s
                </span>
              </div>
              <div>
                <span className="text-gray-600">Difficulty:</span>
                <span className="font-medium ml-2 capitalize">{lesson.difficulty}</span>
              </div>
              <div>
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium ml-2">{lesson.duration} min</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};