import React, { useState, useEffect } from 'react';
import { FadeIn, Pulse } from './AnimationUtils';

interface CircularProgressProps {
  progress: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  showPercentage?: boolean;
  animate?: boolean;
  className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 'md',
  color = 'blue',
  showPercentage = true,
  animate = true,
  className = ''
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setAnimatedProgress(progress), 100);
      return () => clearTimeout(timer);
    } else {
      setAnimatedProgress(progress);
    }
  }, [progress, animate]);

  const getSizeClasses = () => {
    const sizes = {
      sm: 'w-12 h-12',
      md: 'w-16 h-16', 
      lg: 'w-24 h-24',
      xl: 'w-32 h-32'
    };
    return sizes[size];
  };

  const getTextSize = () => {
    const textSizes = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
      xl: 'text-lg'
    };
    return textSizes[size];
  };

  const getColorClasses = () => {
    const colors = {
      blue: 'stroke-blue-600',
      green: 'stroke-green-600',
      yellow: 'stroke-yellow-600',
      red: 'stroke-red-600',
      purple: 'stroke-purple-600'
    };
    return colors[color];
  };

  const radius = size === 'sm' ? 16 : size === 'md' ? 24 : size === 'lg' ? 40 : 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

  return (
    <div className={`relative ${getSizeClasses()} ${className}`}>
      <svg className="transform -rotate-90 w-full h-full">
        {/* Background circle */}
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className={`${getColorClasses()} transition-all duration-1000 ease-out`}
          strokeLinecap="round"
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold ${getTextSize()} text-gray-700`}>
            {Math.round(animatedProgress)}%
          </span>
        </div>
      )}
    </div>
  );
};

interface LinearProgressProps {
  progress: number;
  height?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  showLabel?: boolean;
  label?: string;
  animate?: boolean;
  className?: string;
}

export const LinearProgress: React.FC<LinearProgressProps> = ({
  progress,
  height = 'md',
  color = 'blue',
  showLabel = true,
  label,
  animate = true,
  className = ''
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setAnimatedProgress(progress), 100);
      return () => clearTimeout(timer);
    } else {
      setAnimatedProgress(progress);
    }
  }, [progress, animate]);

  const getHeightClass = () => {
    const heights = {
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4'
    };
    return heights[height];
  };

  const getColorClass = () => {
    const colors = {
      blue: 'bg-blue-600',
      green: 'bg-green-600',
      yellow: 'bg-yellow-600',
      red: 'bg-red-600',
      purple: 'bg-purple-600'
    };
    return colors[color];
  };

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">
            {label || `Progress: ${Math.round(progress)}%`}
          </span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${getHeightClass()}`}>
        <div
          className={`${getHeightClass()} ${getColorClass()} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${animatedProgress}%` }}
        />
      </div>
    </div>
  );
};

interface XPBarProps {
  currentXP: number;
  nextLevelXP: number;
  level: number;
  animate?: boolean;
  className?: string;
}

export const XPBar: React.FC<XPBarProps> = ({
  currentXP,
  nextLevelXP,
  level,
  animate = true,
  className = ''
}) => {
  const progress = (currentXP / nextLevelXP) * 100;
  const xpNeeded = nextLevelXP - currentXP;

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <span className="font-bold text-blue-800">Level {level}</span>
        </div>
        <span className="text-sm text-gray-600">
          {currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
        </span>
      </div>
      
      <LinearProgress
        progress={progress}
        color="blue"
        height="md"
        showLabel={false}
        animate={animate}
        className="mb-2"
      />
      
      <div className="text-xs text-gray-600 text-center">
        {xpNeeded.toLocaleString()} XP to next level
      </div>
    </div>
  );
};

interface StreakIndicatorProps {
  streakCount: number;
  maxStreak?: number;
  animate?: boolean;
  className?: string;
}

export const StreakIndicator: React.FC<StreakIndicatorProps> = ({
  streakCount,
  maxStreak,
  animate = true,
  className = ''
}) => {
  const getStreakIcon = () => {
    if (streakCount === 0) return '🔥';
    if (streakCount < 3) return '🔥';
    if (streakCount < 7) return '🔥🔥';
    if (streakCount < 14) return '🔥🔥🔥';
    return '🔥🔥🔥🔥';
  };

  const getStreakColor = () => {
    if (streakCount === 0) return 'text-gray-400';
    if (streakCount < 3) return 'text-orange-500';
    if (streakCount < 7) return 'text-red-500';
    if (streakCount < 14) return 'text-red-600';
    return 'text-red-700';
  };

  const getStreakBg = () => {
    if (streakCount === 0) return 'bg-gray-50 border-gray-200';
    if (streakCount < 3) return 'bg-orange-50 border-orange-200';
    if (streakCount < 7) return 'bg-red-50 border-red-200';
    if (streakCount < 14) return 'bg-red-100 border-red-300';
    return 'bg-red-200 border-red-400';
  };

  return (
    <FadeIn direction="up" className={className}>
      <div className={`p-3 rounded-lg border ${getStreakBg()} text-center`}>
        <div className={`text-2xl mb-1 ${animate && streakCount > 0 ? 'animate-bounce' : ''}`}>
          {getStreakIcon()}
        </div>
        <div className={`font-bold text-lg ${getStreakColor()}`}>
          {streakCount} Day{streakCount !== 1 ? 's' : ''}
        </div>
        <div className="text-xs text-gray-600">Streak</div>
        {maxStreak && maxStreak > streakCount && (
          <div className="text-xs text-gray-500 mt-1">
            Best: {maxStreak}
          </div>
        )}
      </div>
    </FadeIn>
  );
};

interface AchievementBadgeProps {
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  animate?: boolean;
  onClick?: () => void;
  className?: string;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  title,
  description,
  icon,
  unlocked,
  animate = true,
  onClick,
  className = ''
}) => {
  return (
    <FadeIn direction="scale" className={className}>
      <div
        className={`
          p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
          ${unlocked 
            ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300 hover:from-yellow-100 hover:to-yellow-200' 
            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
          }
          ${animate && unlocked ? 'hover:scale-105 hover:shadow-lg' : ''}
          ${onClick ? 'hover:cursor-pointer' : ''}
        `}
        onClick={onClick}
      >
        <div className="text-center">
          <div className={`text-3xl mb-2 ${animate && unlocked ? 'animate-bounce' : ''} ${!unlocked ? 'grayscale opacity-50' : ''}`}>
            {icon}
          </div>
          <h3 className={`font-bold text-sm mb-1 ${unlocked ? 'text-yellow-800' : 'text-gray-500'}`}>
            {title}
          </h3>
          <p className={`text-xs ${unlocked ? 'text-yellow-700' : 'text-gray-400'}`}>
            {description}
          </p>
          {unlocked && (
            <div className="mt-2">
              <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
                ✓ Unlocked
              </span>
            </div>
          )}
        </div>
      </div>
    </FadeIn>
  );
};

interface MotivationalNotificationProps {
  message: string;
  type: 'success' | 'achievement' | 'streak' | 'level' | 'encouragement';
  isVisible: boolean;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

export const MotivationalNotification: React.FC<MotivationalNotificationProps> = ({
  message,
  type,
  isVisible,
  onClose,
  autoClose = true,
  duration = 4000
}) => {
  useEffect(() => {
    if (isVisible && autoClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, duration, onClose]);

  const getTypeConfig = () => {
    const configs = {
      success: {
        icon: '🎉',
        bgColor: 'bg-green-100 border-green-300',
        textColor: 'text-green-800',
        iconBg: 'bg-green-500'
      },
      achievement: {
        icon: '🏆',
        bgColor: 'bg-yellow-100 border-yellow-300', 
        textColor: 'text-yellow-800',
        iconBg: 'bg-yellow-500'
      },
      streak: {
        icon: '🔥',
        bgColor: 'bg-orange-100 border-orange-300',
        textColor: 'text-orange-800',
        iconBg: 'bg-orange-500'
      },
      level: {
        icon: '⚡',
        bgColor: 'bg-blue-100 border-blue-300',
        textColor: 'text-blue-800', 
        iconBg: 'bg-blue-500'
      },
      encouragement: {
        icon: '💪',
        bgColor: 'bg-purple-100 border-purple-300',
        textColor: 'text-purple-800',
        iconBg: 'bg-purple-500'
      }
    };
    return configs[type];
  };

  if (!isVisible) return null;

  const config = getTypeConfig();

  return (
    <div className="fixed top-4 right-4 z-50">
      <FadeIn direction="right">
        <div className={`
          flex items-start gap-3 p-4 rounded-lg border-2 shadow-lg max-w-sm
          ${config.bgColor}
          animate-slideInFromRight
        `}>
          <Pulse active={true}>
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-white text-lg
              ${config.iconBg}
            `}>
              {config.icon}
            </div>
          </Pulse>
          
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${config.textColor}`}>
              {message}
            </p>
          </div>

          <button
            onClick={onClose}
            className={`${config.textColor} hover:opacity-75 transition-opacity`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </FadeIn>
    </div>
  );
};