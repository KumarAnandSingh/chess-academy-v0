/**
 * Enhanced Daily Plan Component - Horizontal Tab Layout
 * Fully supports both light and dark themes
 * Displays "Solve 3 • Learn 1 • Play 1" daily progress in horizontal tabs
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Puzzle, BookOpen, Gamepad2, Target, Flame, Trophy } from 'lucide-react';

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

const DailyPlanHorizontal: React.FC = () => {
  const [dailyPlan, setDailyPlan] = useState<DailyPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'puzzles' | 'lessons' | 'games'>('puzzles');
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        <span className="ml-3" style={{ color: 'var(--color-text-secondary)' }}>Loading your daily plan...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="border rounded-lg p-6 text-center"
        style={{ 
          backgroundColor: 'var(--color-danger-subtle)',
          borderColor: 'var(--color-danger)',
          color: 'var(--color-danger)'
        }}
      >
        <h3 className="font-semibold mb-2" style={{ color: 'var(--color-danger)' }}>Unable to load daily plan</h3>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>{error}</p>
        <button
          onClick={fetchDailyPlan}
          className="px-4 py-2 rounded-md transition-colors"
          style={{ 
            backgroundColor: 'var(--color-danger)',
            color: 'white'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!dailyPlan) {
    return (
      <div className="text-center p-8">
        <p style={{ color: 'var(--color-text-secondary)' }}>No daily plan data available</p>
      </div>
    );
  }

  const tabs = [
    { 
      id: 'puzzles' as const, 
      label: 'Puzzles', 
      icon: Puzzle, 
      data: dailyPlan.tasks.puzzles,
      color: 'var(--color-success)',
      action: () => navigate('/puzzles')
    },
    { 
      id: 'lessons' as const, 
      label: 'Lessons', 
      icon: BookOpen, 
      data: dailyPlan.tasks.lessons,
      color: 'var(--color-accent-primary)',
      action: () => navigate('/lessons')
    },
    { 
      id: 'games' as const, 
      label: 'Games', 
      icon: Gamepad2, 
      data: dailyPlan.tasks.games,
      color: 'var(--color-warning)',
      action: () => navigate('/play')
    }
  ];

  const currentTab = tabs.find(tab => tab.id === activeTab)!;

  return (
    <div 
      className="rounded-xl shadow-lg overflow-hidden max-w-2xl mx-auto"
      style={{ backgroundColor: 'var(--color-surface-elevated)' }}
    >
      {/* Hero Section */}
      <div 
        className="p-6 text-white relative overflow-hidden"
        style={{ 
          background: 'linear-gradient(135deg, var(--color-accent-primary) 0%, var(--color-accent-primary-hover) 100%)'
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Target className="h-5 w-5" />
              Daily Chess Plan
            </h2>
            <div className="flex items-center gap-4">
              {/* Streak */}
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4" />
                <span className="text-sm font-medium">{dailyPlan.streak.current} day streak</span>
              </div>
              {/* XP */}
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                <span className="text-sm font-medium">{dailyPlan.progress.xpEarned} XP</span>
              </div>
            </div>
          </div>
          
          <p className="text-blue-100 text-sm leading-relaxed mb-4">
            {dailyPlan.heroMessage}
          </p>

          {/* Overall Progress */}
          <div className="relative">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Overall Progress</span>
              <span className="font-bold">{dailyPlan.progress.completionPercentage}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div
                className="bg-white h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${dailyPlan.progress.completionPercentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Horizontal Tab Navigation */}
      <div 
        className="flex border-b"
        style={{ borderColor: 'var(--color-border-default)' }}
      >
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;
          const isCompleted = tab.data.completed >= tab.data.target;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 p-4 text-center transition-all duration-200 relative"
              style={{
                backgroundColor: isActive ? 'var(--color-surface)' : 'transparent',
                borderBottom: isActive ? `3px solid ${tab.color}` : '3px solid transparent'
              }}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" style={{ color: isActive ? tab.color : 'var(--color-text-secondary)' }} />
                  <span 
                    className="text-sm font-medium"
                    style={{ color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
                  >
                    {tab.label}
                  </span>
                </div>
                
                {/* Progress indicator */}
                <div className="flex items-center gap-1">
                  <span 
                    className="text-xs font-bold"
                    style={{ color: isCompleted ? 'var(--color-success)' : tab.color }}
                  >
                    {tab.data.completed}/{tab.data.target}
                  </span>
                  {isCompleted && (
                    <span className="text-xs" style={{ color: 'var(--color-success)' }}>✓</span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Current Tab Details */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div 
                className="p-4 rounded-full"
                style={{ backgroundColor: 'var(--color-surface)' }}
              >
                <currentTab.icon className="h-8 w-8" style={{ color: currentTab.color }} />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {currentTab.label}
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {currentTab.data.completed >= currentTab.data.target 
                    ? "Complete! Great job!" 
                    : `${currentTab.data.remaining} remaining`}
                </p>
              </div>
            </div>

            {/* Progress Circle */}
            <div className="relative w-24 h-24 mx-auto mb-4">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  strokeWidth="8"
                  fill="none"
                  style={{ stroke: 'var(--color-border-default)' }}
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke={currentTab.color}
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${(currentTab.data.completed / currentTab.data.target) * 251.2} 251.2`}
                  initial={{ strokeDasharray: "0 251.2" }}
                  animate={{ strokeDasharray: `${(currentTab.data.completed / currentTab.data.target) * 251.2} 251.2` }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {currentTab.data.completed}/{currentTab.data.target}
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          {currentTab.data.completed < currentTab.data.target ? (
            <button
              onClick={currentTab.action}
              className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
              style={{
                backgroundColor: currentTab.color,
                color: 'white'
              }}
            >
              Start {currentTab.label.slice(0, -1)} ({currentTab.data.remaining} left)
            </button>
          ) : (
            <div 
              className="w-full py-3 px-4 rounded-lg text-center font-medium"
              style={{
                backgroundColor: 'var(--color-success-subtle)',
                color: 'var(--color-success)'
              }}
            >
              ✅ {currentTab.label} Complete!
            </div>
          )}
        </motion.div>
      </div>

      {/* Completion Celebration */}
      {dailyPlan.progress.isCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mx-6 mb-6 p-4 rounded-lg text-center"
          style={{
            backgroundColor: 'var(--color-success-subtle)',
            color: 'var(--color-success)'
          }}
        >
          <div className="text-2xl mb-2">🎉</div>
          <div className="font-semibold">Daily Plan Complete!</div>
          <div className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            You've earned {dailyPlan.progress.xpEarned} XP and improved your rating!
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DailyPlanHorizontal;