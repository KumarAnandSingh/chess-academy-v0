import React, { useState, useEffect, useRef } from 'react';
import { audioService } from '../../services/audioService';

// Magnetic Button - follows cursor on hover
interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  strength = 20,
  className = '',
  onMouseEnter,
  onMouseLeave,
  onClick,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current || !isHovered) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    
    const moveX = deltaX * (strength / 100);
    const moveY = deltaY * (strength / 100);
    
    buttonRef.current.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsHovered(true);
    audioService.playUISound('hover');
    onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsHovered(false);
    if (buttonRef.current) {
      buttonRef.current.style.transform = 'translate(0px, 0px) scale(1)';
    }
    onMouseLeave?.(e);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    audioService.playUISound('click');
    
    // Add click ripple effect
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.6);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
        z-index: 0;
      `;
      
      buttonRef.current.appendChild(ripple);
      
      setTimeout(() => {
        if (ripple.parentNode) {
          ripple.parentNode.removeChild(ripple);
        }
      }, 600);
    }
    
    onClick?.(e);
  };

  return (
    <button
      ref={buttonRef}
      className={`
        relative overflow-hidden transition-all duration-300 ease-out
        transform-gpu will-change-transform
        ${className}
      `}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        transform: 'translate(0px, 0px) scale(1)',
      }}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <style>{`
        @keyframes ripple {
          to { transform: scale(4); opacity: 0; }
        }
      `}</style>
    </button>
  );
};

// Tilt Card - 3D tilt effect on hover
interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  glare?: boolean;
  onClick?: () => void;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  intensity = 15,
  glare = true,
  onClick
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -intensity;
    const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * intensity;
    
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
    
    if (glare) {
      const glareX = ((e.clientX - rect.left) / rect.width) * 100;
      const glareY = ((e.clientY - rect.top) / rect.height) * 100;
      cardRef.current.style.setProperty('--glare-x', `${glareX}%`);
      cardRef.current.style.setProperty('--glare-y', `${glareY}%`);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    audioService.playUISound('hover');
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    }
  };

  const handleClick = () => {
    audioService.playUISound('click');
    onClick?.();
  };

  return (
    <div
      ref={cardRef}
      className={`
        relative transition-all duration-300 ease-out transform-gpu will-change-transform
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      }}
    >
      {glare && isHovered && (
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(circle at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255,255,255,0.8) 0%, transparent 50%)`,
            mixBlendMode: 'overlay',
          }}
        />
      )}
      {children}
    </div>
  );
};

// Morphing Icon - smooth icon transitions
interface MorphingIconProps {
  icon1: React.ReactNode;
  icon2: React.ReactNode;
  isToggled: boolean;
  size?: number;
  duration?: number;
  onClick?: () => void;
  className?: string;
}

export const MorphingIcon: React.FC<MorphingIconProps> = ({
  icon1,
  icon2,
  isToggled,
  size = 24,
  duration = 300,
  onClick,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    audioService.playUISound('click');
    
    // Add micro bounce effect
    if (containerRef.current) {
      containerRef.current.style.transform = 'scale(0.9)';
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.style.transform = 'scale(1)';
        }
      }, 100);
    }
    
    onClick?.();
  };

  return (
    <div
      ref={containerRef}
      className={`
        relative inline-flex items-center justify-center cursor-pointer
        transition-transform duration-100 ease-out
        ${className}
      `}
      style={{ width: size, height: size }}
      onClick={handleClick}
    >
      <div
        className="absolute inset-0 flex items-center justify-center transition-all ease-out"
        style={{
          opacity: isToggled ? 0 : 1,
          transform: isToggled ? 'scale(0.5) rotate(180deg)' : 'scale(1) rotate(0deg)',
          transitionDuration: `${duration}ms`,
        }}
      >
        {icon1}
      </div>
      <div
        className="absolute inset-0 flex items-center justify-center transition-all ease-out"
        style={{
          opacity: isToggled ? 1 : 0,
          transform: isToggled ? 'scale(1) rotate(0deg)' : 'scale(0.5) rotate(-180deg)',
          transitionDuration: `${duration}ms`,
        }}
      >
        {icon2}
      </div>
    </div>
  );
};

// Loading Dots - animated loading indicator
interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({
  size = 'md',
  color = 'currentColor',
  className = ''
}) => {
  const sizeMap = {
    sm: { dotSize: 'w-1 h-1', gap: 'gap-1' },
    md: { dotSize: 'w-2 h-2', gap: 'gap-1.5' },
    lg: { dotSize: 'w-3 h-3', gap: 'gap-2' }
  };

  const { dotSize, gap } = sizeMap[size];

  return (
    <div className={`flex items-center ${gap} ${className}`}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`${dotSize} rounded-full animate-pulse`}
          style={{
            backgroundColor: color,
            animationDelay: `${index * 150}ms`,
            animationDuration: '1s',
          }}
        />
      ))}
    </div>
  );
};

// Floating Action Button with micro-interactions
interface FloatingActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'sm' | 'md' | 'lg';
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  label,
  position = 'bottom-right',
  size = 'md',
  className = '',
  onClick,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showLabel, setShowLabel] = useState(false);

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  const sizeClasses = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-14 h-14 text-base',
    lg: 'w-16 h-16 text-lg',
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    audioService.playUISound('click');
    onClick?.(e);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    setShowLabel(true);
    audioService.playUISound('hover');
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTimeout(() => setShowLabel(false), 150);
  };

  return (
    <div className={`fixed z-50 ${positionClasses[position]}`}>
      {/* Label */}
      {label && (
        <div
          className={`
            absolute ${position.includes('right') ? 'right-full mr-4' : 'left-full ml-4'}
            top-1/2 transform -translate-y-1/2 whitespace-nowrap
            bg-gray-800 text-white text-xs px-3 py-1 rounded-lg
            transition-all duration-200 ease-out
            ${showLabel ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
          `}
        >
          {label}
          <div
            className={`
              absolute top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-800 rotate-45
              ${position.includes('right') ? 'right-0 translate-x-1' : 'left-0 -translate-x-1'}
            `}
          />
        </div>
      )}

      {/* Button */}
      <button
        className={`
          ${sizeClasses[size]} rounded-full shadow-lg
          bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700
          text-white transition-all duration-200 ease-out
          transform ${isHovered ? 'scale-110 rotate-12' : 'scale-100 rotate-0'}
          hover:shadow-xl active:scale-95
          flex items-center justify-center
          ${className}
        `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        {...props}
      >
        <div className={`transform transition-transform duration-200 ${isHovered ? 'scale-110' : 'scale-100'}`}>
          {icon}
        </div>
      </button>
    </div>
  );
};

// Progress Ring - animated circular progress
interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  animate?: boolean;
  showPercentage?: boolean;
  children?: React.ReactNode;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color = '#3b82f6',
  backgroundColor = '#e5e7eb',
  animate = true,
  showPercentage = false,
  children
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

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          className={animate ? 'transition-all duration-1000 ease-out' : ''}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {showPercentage ? (
          <span className="text-lg font-bold text-gray-700">
            {Math.round(animatedProgress)}%
          </span>
        ) : (
          children
        )}
      </div>
    </div>
  );
};