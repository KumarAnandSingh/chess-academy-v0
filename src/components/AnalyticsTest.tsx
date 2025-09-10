// Analytics Test Component
// Test component to verify GA4 integration and event tracking

import React from 'react';
import { useAnalytics } from '../hooks/useAnalytics';

export const AnalyticsTest: React.FC = () => {
  const analytics = useAnalytics();

  const testEvents = [
    {
      name: 'Test Sign Up',
      action: () => analytics.trackSignUp({
        method: 'email',
        chess_experience: 'beginner',
      }),
    },
    {
      name: 'Test Login',
      action: () => analytics.trackLogin({
        method: 'google',
      }),
    },
    {
      name: 'Test Chess Game Start',
      action: () => analytics.trackChessGameStart({
        game_mode: 'vs_computer',
        difficulty_level: 'intermediate',
        computer_level: 5,
        user_rating: 1200,
      }),
    },
    {
      name: 'Test Chess Game End',
      action: () => analytics.trackChessGameEnd({
        game_mode: 'vs_computer',
        result: 'win',
        duration_seconds: 1200,
        moves_count: 45,
        difficulty_level: 'intermediate',
        computer_level: 5,
        hints_used: 2,
        mistakes_count: 3,
        accuracy_percentage: 87,
        user_rating_before: 1200,
        user_rating_after: 1220,
        rating_change: 20,
      }),
    },
    {
      name: 'Test Puzzle Complete',
      action: () => analytics.trackPuzzleComplete({
        puzzle_id: 'puzzle_123',
        difficulty_level: 'intermediate',
        attempts_count: 2,
        time_taken_seconds: 180,
        was_successful: true,
        hints_used: 1,
      }),
    },
    {
      name: 'Test Lesson Progress',
      action: () => analytics.trackLessonProgress({
        lesson_id: 'lesson_456',
        lesson_category: 'openings',
        progress_percentage: 100,
        time_spent_seconds: 600,
        completed: true,
      }),
    },
    {
      name: 'Test Feature Use',
      action: () => analytics.trackFeatureUse('chess_board', 'piece_moved'),
    },
    {
      name: 'Test Level Up',
      action: () => analytics.trackLevelUp(5, 150),
    },
    {
      name: 'Test Achievement Unlock',
      action: () => analytics.trackAchievementUnlock('first_win', 'First Victory'),
    },
    {
      name: 'Test Error',
      action: () => analytics.trackError('test_error', 'This is a test error for analytics'),
    },
    {
      name: 'Test Performance',
      action: () => analytics.trackPerformance('test_metric', 250, 'ms'),
    },
  ];

  return (
    <div className="p-6 bg-gray-100 rounded-lg max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">GA4 Analytics Test Panel</h2>
        <div className="bg-white p-4 rounded border mb-4">
          <h3 className="font-semibold mb-2">Analytics Status:</h3>
          <p>Ready: <span className={analytics.isReady ? 'text-green-600' : 'text-red-600'}>{analytics.isReady ? 'Yes' : 'No'}</span></p>
          <p>Device Type: <span className="font-mono">{analytics.deviceType}</span></p>
          <p className="text-sm text-gray-600 mt-2">
            Open Developer Tools → Network tab to see GA4 events being sent.
            <br />
            Or check Console for debug messages when VITE_GA_DEBUG_MODE=true.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {testEvents.map((event, index) => (
          <button
            key={index}
            onClick={event.action}
            className="p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
            disabled={!analytics.isReady}
          >
            {event.name}
          </button>
        ))}
      </div>

      <div className="mt-6 bg-yellow-50 p-4 rounded border border-yellow-200">
        <h3 className="font-semibold text-yellow-800 mb-2">Setup Instructions:</h3>
        <ol className="text-sm text-yellow-700 space-y-1 list-decimal ml-4">
          <li>Replace <code>VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX</code> in .env with your actual GA4 measurement ID</li>
          <li>Set <code>VITE_ENABLE_ANALYTICS=true</code> in .env</li>
          <li>Restart the development server after changing environment variables</li>
          <li>Open GA4 Real-time reports to see events in action</li>
          <li>Enable debug mode with <code>VITE_GA_DEBUG_MODE=true</code> for console logging</li>
        </ol>
      </div>

      <div className="mt-6 bg-blue-50 p-4 rounded border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-2">Available Events:</h3>
        <div className="text-sm text-blue-700 grid grid-cols-2 md:grid-cols-3 gap-2">
          <div><strong>Authentication:</strong> sign_up, login, logout</div>
          <div><strong>Chess Games:</strong> chess_game_start, chess_game_end, chess_move</div>
          <div><strong>Learning:</strong> puzzle_complete, lesson_progress, tutorial_complete</div>
          <div><strong>Progression:</strong> level_up, unlock_achievement</div>
          <div><strong>Engagement:</strong> feature_use, page_view</div>
          <div><strong>System:</strong> exception, performance_metric</div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTest;