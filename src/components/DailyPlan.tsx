/**
 * Daily Plan Component - Phase 0 Implementation
 * Displays "Solve 3 • Learn 1 • Play 1" daily progress
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface DailyPlanData {
  id: string;
  date: string;
  tasks: {
    puzzles: { target: number; completed: number; remaining: number };
    lessons: { target: number; completed: number; remaining: number };
    games: { target: number; completed: number; remaining: number };
  };
  progress: {
    completionPercentage: number;
    xpEarned: number;
    estimatedRatingGain: number;
    isCompleted: boolean;
    completedAt?: string;
  };
  streak: {
    current: number;
    longest: number;
    isActive: boolean;
  };
  heroMessage: string;
}

const DailyPlan: React.FC = () => {
  const [dailyPlan, setDailyPlan] = useState<DailyPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Mock user token for testing - In production, get from auth context
  const mockToken = 'mock-jwt-token';

  useEffect(() => {
    fetchDailyPlan();
  }, []);

  const fetchDailyPlan = async () => {
    try {
      setLoading(true);
      // For now, use mock data instead of API call until backend is ready
      const mockData: DailyPlanData = {
        id: 'daily-plan-1',
        date: new Date().toISOString().split('T')[0],
        tasks: {
          puzzles: { target: 3, completed: 1, remaining: 2 },
          lessons: { target: 1, completed: 0, remaining: 1 },
          games: { target: 1, completed: 0, remaining: 1 }
        },
        progress: {
          completionPercentage: 20,
          xpEarned: 15,
          estimatedRatingGain: 5,
          isCompleted: false
        },
        streak: {
          current: 3,
          longest: 7,
          isActive: true
        },
        heroMessage: "Great start! You've solved 1 puzzle today. Keep the momentum going! 🚀"
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      setDailyPlan(mockData);
      setError(null);
    } catch (err) {
      console.error('Error fetching daily plan:', err);
      setError(err instanceof Error ? err.message : 'Failed to load daily plan');
    } finally {
      setLoading(false);
    }
  };

  const completeActivity = async (activityType: 'puzzle' | 'lesson' | 'game') => {
    try {
      const response = await fetch('http://localhost:3001/api/daily-plan/complete-activity', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mockToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          activityType,
          xpEarned: 15 // Mock XP value
        })
      });

      if (response.ok) {
        // Refresh the daily plan data
        await fetchDailyPlan();
      } else {
        console.error('Failed to complete activity');
      }
    } catch (err) {
      console.error('Error completing activity:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading your daily plan...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-red-800 font-semibold mb-2">Unable to load daily plan</h3>
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <button
          onClick={fetchDailyPlan}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!dailyPlan) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">No daily plan data available</p>
      </div>
    );
  }

  const TaskRing: React.FC<{ 
    completed: number; 
    target: number; 
    color: string; 
    label: string;
    onComplete: () => void;
  }> = ({ completed, target, color, label, onComplete }) => {
    const percentage = (completed / target) * 100;
    const circumference = 2 * Math.PI * 40;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24 mb-2">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200"
            />
            {/* Progress ring */}
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              stroke={color}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-gray-800">
              {completed}/{target}
            </span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900 mb-1">{label}</div>
          {completed < target && (
            <button
              onClick={onComplete}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
            >
              Complete +1
            </button>
          )}
          {completed >= target && (
            <div className="text-xs text-green-600 font-medium">✓ Done!</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl font-bold mb-2">Daily Chess Plan</h2>
          <p className="text-blue-100 text-sm leading-relaxed">
            {dailyPlan.heroMessage}
          </p>
        </motion.div>

        {/* Streak Info */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-blue-400/30">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🔥</span>
            <div>
              <div className="text-sm font-medium">Streak</div>
              <div className="text-xs text-blue-100">
                Current: {dailyPlan.streak.current} • Best: {dailyPlan.streak.longest}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">{dailyPlan.progress.xpEarned} XP</div>
            <div className="text-xs text-blue-100">earned today</div>
          </div>
        </div>
      </div>

      {/* Progress Rings */}
      <div className="p-6">
        <div className="flex justify-around items-center">
          <TaskRing
            completed={dailyPlan.tasks.puzzles.completed}
            target={dailyPlan.tasks.puzzles.target}
            color="#10B981"
            label="Puzzles"
            onComplete={() => navigate('/puzzles')}
          />
          <TaskRing
            completed={dailyPlan.tasks.lessons.completed}
            target={dailyPlan.tasks.lessons.target}
            color="#3B82F6"
            label="Lessons"
            onComplete={() => navigate('/lessons')}
          />
          <TaskRing
            completed={dailyPlan.tasks.games.completed}
            target={dailyPlan.tasks.games.target}
            color="#8B5CF6"
            label="Games"
            onComplete={() => navigate('/play')}
          />
        </div>

        {/* Overall Progress */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-bold text-gray-900">
              {dailyPlan.progress.completionPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${dailyPlan.progress.completionPercentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Completion Celebration */}
        {dailyPlan.progress.isCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center"
          >
            <div className="text-2xl mb-2">🎉</div>
            <div className="text-green-800 font-semibold">Daily Plan Complete!</div>
            <div className="text-green-600 text-sm mt-1">
              You've earned {dailyPlan.progress.xpEarned} XP and improved your rating!
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        {!dailyPlan.progress.isCompleted && (
          <div className="mt-6 space-y-2">
            {dailyPlan.tasks.puzzles.remaining > 0 && (
              <button 
                onClick={() => navigate('/puzzles')}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition-colors text-sm font-medium"
              >
                Solve a Puzzle ({dailyPlan.tasks.puzzles.remaining} left)
              </button>
            )}
            {dailyPlan.tasks.lessons.remaining > 0 && (
              <button 
                onClick={() => navigate('/lessons')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors text-sm font-medium"
              >
                Take a Lesson ({dailyPlan.tasks.lessons.remaining} left)
              </button>
            )}
            {dailyPlan.tasks.games.remaining > 0 && (
              <button 
                onClick={() => navigate('/play')}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-md transition-colors text-sm font-medium"
              >
                Play vs Bot ({dailyPlan.tasks.games.remaining} left)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyPlan;