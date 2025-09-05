import React, { useState, useEffect } from 'react';
import { aiCoach, CoachResponse, PuzzleHint, GameAnalysis } from '../../services/aiCoach';
import { CoachSettings } from './CoachSettings';

interface AICoachProps {
  position?: string;
  playerLevel?: number;
  isVisible?: boolean;
  onClose?: () => void;
  mode?: 'general' | 'puzzle' | 'game' | 'lesson';
  context?: {
    lastMove?: string;
    isCorrectMove?: boolean;
    attemptCount?: number;
    puzzleType?: string;
    lessonTopic?: string;
  };
}

export const AICoach: React.FC<AICoachProps> = ({
  position = '',
  playerLevel = 5,
  isVisible = true,
  onClose,
  mode = 'general',
  context = {}
}) => {
  const [coaching, setCoaching] = useState<CoachResponse | null>(null);
  const [puzzleHint, setPuzzleHint] = useState<PuzzleHint | null>(null);
  const [gameAnalysis, setGameAnalysis] = useState<GameAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (isVisible && position) {
      fetchCoaching();
    }
  }, [isVisible, position, context, mode]);

  const fetchCoaching = async () => {
    setLoading(true);
    setError(null);

    try {
      const difficulty = playerLevel < 5 ? 'beginner' : playerLevel < 15 ? 'intermediate' : 'advanced';
      
      const coachingContext = {
        position,
        moveHistory: [],
        playerLevel,
        difficulty,
        ...context
      } as any;

      switch (mode) {
        case 'puzzle':
          if (context.attemptCount !== undefined) {
            const hint = await aiCoach.getPuzzleHint(coachingContext, context.attemptCount);
            setPuzzleHint(hint);
          } else {
            const response = await aiCoach.getCoaching(coachingContext);
            setCoaching(response);
          }
          break;
          
        case 'game':
          const analysis = await aiCoach.analyzeGame(coachingContext);
          setGameAnalysis(analysis);
          break;
          
        default:
          const response = await aiCoach.getCoaching(coachingContext);
          setCoaching(response);
          break;
      }
    } catch (err) {
      setError('Failed to get coaching advice. Please try again.');
      console.error('Coaching error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCoachIcon = (type?: CoachResponse['type']) => {
    switch (type) {
      case 'celebration': return '🎉';
      case 'correction': return '🤔';
      case 'hint': return '💡';
      case 'encouragement': return '💪';
      case 'analysis': return '🔍';
      default: return '🤖';
    }
  };

  const getCoachColor = (type?: CoachResponse['type']) => {
    switch (type) {
      case 'celebration': return 'border-green-200 bg-green-50 text-green-800';
      case 'correction': return 'border-orange-200 bg-orange-50 text-orange-800';
      case 'hint': return 'border-blue-200 bg-blue-50 text-blue-800';
      case 'encouragement': return 'border-purple-200 bg-purple-50 text-purple-800';
      case 'analysis': return 'border-gray-200 bg-gray-50 text-gray-800';
      default: return 'border-blue-200 bg-blue-50 text-blue-800';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <h3 className="font-semibold text-gray-900">Claude Chess Coach</h3>
          {!aiCoach.isApiKeyConfigured() && (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Demo Mode</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(true)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            title="Configure Claude API Key"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-gray-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm">Analyzing your position...</span>
        </div>
      )}

      {error && (
        <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-2 mb-3">
          {error}
        </div>
      )}

      {coaching && (
        <div className={`p-3 rounded-lg border ${getCoachColor(coaching.type)} mb-3`}>
          <div className="flex items-start gap-2">
            <span className="text-lg">{getCoachIcon(coaching.type)}</span>
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">{coaching.message}</p>
              {coaching.explanation && (
                <p className="text-xs opacity-90">{coaching.explanation}</p>
              )}
              {coaching.suggestedMove && (
                <div className="mt-2 text-xs">
                  <span className="font-mono bg-white bg-opacity-50 px-2 py-1 rounded">
                    Suggested: {coaching.suggestedMove}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {puzzleHint && (
        <div className={`p-3 rounded-lg border ${getCoachColor('hint')} mb-3`}>
          <div className="flex items-start gap-2">
            <span className="text-lg">💡</span>
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">{puzzleHint.hint}</p>
              <div className="text-xs opacity-75">
                <span className="capitalize">{puzzleHint.level}</span> hint
              </div>
              {puzzleHint.suggestedSquares && (
                <div className="mt-2 flex gap-1">
                  <span className="text-xs">Focus on squares:</span>
                  {puzzleHint.suggestedSquares.map((square, index) => (
                    <span
                      key={index}
                      className="text-xs font-mono bg-white bg-opacity-50 px-1 rounded"
                    >
                      {square}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {gameAnalysis && (
        <div className="space-y-3">
          <div className={`p-3 rounded-lg border ${getCoachColor('analysis')}`}>
            <div className="flex items-start gap-2">
              <span className="text-lg">🔍</span>
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">{gameAnalysis.evaluation}</p>
                <p className="text-xs opacity-90">{gameAnalysis.reasoning}</p>
              </div>
            </div>
          </div>

          {gameAnalysis.playerStrengths.length > 0 && (
            <div className="p-3 rounded-lg border border-green-200 bg-green-50">
              <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center gap-1">
                <span>⭐</span> Your Strengths
              </h4>
              <ul className="text-xs text-green-700 space-y-1">
                {gameAnalysis.playerStrengths.map((strength, index) => (
                  <li key={index} className="flex items-center gap-1">
                    <span className="text-green-500">•</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {gameAnalysis.areasForImprovement.length > 0 && (
            <div className="p-3 rounded-lg border border-orange-200 bg-orange-50">
              <h4 className="text-sm font-medium text-orange-800 mb-2 flex items-center gap-1">
                <span>📈</span> Areas to Improve
              </h4>
              <ul className="text-xs text-orange-700 space-y-1">
                {gameAnalysis.areasForImprovement.map((area, index) => (
                  <li key={index} className="flex items-center gap-1">
                    <span className="text-orange-500">•</span>
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2 mt-3">
        <button
          onClick={fetchCoaching}
          disabled={loading}
          className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Thinking...' : 'New Advice'}
        </button>
        
        {mode === 'puzzle' && (
          <button
            onClick={async () => {
              if (context.attemptCount !== undefined) {
                setLoading(true);
                try {
                  const hint = await aiCoach.getHintForPuzzle(position, context.attemptCount + 1);
                  setPuzzleHint(hint);
                } catch (err) {
                  setError('Failed to get hint');
                } finally {
                  setLoading(false);
                }
              }
            }}
            disabled={loading}
            className="text-xs bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 disabled:opacity-50 transition-colors"
          >
            More Specific Hint
          </button>
        )}
      </div>

      <CoachSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
};