import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Confetti Component
interface ConfettiProps {
  show: boolean;
  onComplete?: () => void;
}

export const Confetti: React.FC<ConfettiProps> = ({ show, onComplete }) => {
  const [particles] = useState(() => 
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.5,
      color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][Math.floor(Math.random() * 6)]
    }))
  );

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-2 h-2 rounded"
              style={{
                left: `${particle.x}%`,
                backgroundColor: particle.color,
              }}
              initial={{
                y: -20,
                rotate: 0,
                scale: 0,
              }}
              animate={{
                y: window.innerHeight + 20,
                rotate: particle.rotation * 4,
                scale: particle.scale,
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};

// Celebration Nudge Component
interface CelebrationNudgeProps {
  show: boolean;
  message: string;
  type: 'excellent' | 'good' | 'great' | 'brilliant' | 'win';
  onComplete?: () => void;
}

export const CelebrationNudge: React.FC<CelebrationNudgeProps> = ({
  show,
  message,
  type,
  onComplete
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'brilliant':
        return {
          bg: 'bg-gradient-to-r from-purple-500 to-pink-500',
          text: 'text-white',
          emoji: '🎯',
          animation: 'animate-bounce'
        };
      case 'excellent':
        return {
          bg: 'bg-gradient-to-r from-green-500 to-emerald-500',
          text: 'text-white',
          emoji: '⭐',
          animation: 'animate-pulse'
        };
      case 'great':
        return {
          bg: 'bg-gradient-to-r from-blue-500 to-cyan-500',
          text: 'text-white',
          emoji: '🎉',
          animation: 'animate-bounce'
        };
      case 'good':
        return {
          bg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
          text: 'text-white',
          emoji: '👏',
          animation: 'animate-pulse'
        };
      case 'win':
        return {
          bg: 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600',
          text: 'text-black',
          emoji: '🏆',
          animation: 'animate-bounce'
        };
      default:
        return {
          bg: 'bg-blue-500',
          text: 'text-white',
          emoji: '🎯',
          animation: 'animate-pulse'
        };
    }
  };

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  const styles = getTypeStyles();

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <div className={`${styles.bg} ${styles.text} px-6 py-4 rounded-xl shadow-2xl ${styles.animation}`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{styles.emoji}</span>
              <span className="font-bold text-lg">{message}</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Vibration Effect for Illegal Moves
interface VibrationEffectProps {
  show: boolean;
  children: React.ReactNode;
}

export const VibrationEffect: React.FC<VibrationEffectProps> = ({ show, children }) => {
  useEffect(() => {
    if (show && 'vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  }, [show]);

  return (
    <motion.div
      animate={show ? { x: [-5, 5, -5, 5, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
};

// Move Quality Indicator
interface MoveQualityProps {
  quality: 'blunder' | 'mistake' | 'inaccuracy' | 'good' | 'excellent' | 'brilliant';
  show: boolean;
}

export const MoveQuality: React.FC<MoveQualityProps> = ({ quality, show }) => {
  const getQualityInfo = () => {
    switch (quality) {
      case 'brilliant':
        return { color: 'text-purple-600', symbol: '‼', text: 'Brilliant!' };
      case 'excellent':
        return { color: 'text-green-600', symbol: '!', text: 'Excellent!' };
      case 'good':
        return { color: 'text-blue-600', symbol: '✓', text: 'Good move' };
      case 'inaccuracy':
        return { color: 'text-yellow-600', symbol: '?!', text: 'Inaccuracy' };
      case 'mistake':
        return { color: 'text-orange-600', symbol: '?', text: 'Mistake' };
      case 'blunder':
        return { color: 'text-red-600', symbol: '??', text: 'Blunder!' };
      default:
        return { color: 'text-gray-600', symbol: '', text: '' };
    }
  };

  const info = getQualityInfo();

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={`absolute -top-8 left-1/2 transform -translate-x-1/2 ${info.color} font-bold text-sm whitespace-nowrap`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-lg">{info.symbol}</span> {info.text}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Thinking Animation for Computer
interface ThinkingAnimationProps {
  show: boolean;
  message: string;
}

export const ThinkingAnimation: React.FC<ThinkingAnimationProps> = ({ show, message }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <div className="flex gap-1">
              <motion.div
                className="w-2 h-2 bg-blue-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
              />
              <motion.div
                className="w-2 h-2 bg-blue-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
              />
              <motion.div
                className="w-2 h-2 bg-blue-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
              />
            </div>
            <span className="text-sm">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Illegal Move Warning
interface IllegalMoveWarningProps {
  show: boolean;
  message?: string;
}

export const IllegalMoveWarning: React.FC<IllegalMoveWarningProps> = ({ 
  show, 
  message = "Move not allowed!" 
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <span className="font-medium">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};