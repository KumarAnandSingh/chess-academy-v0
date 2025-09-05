import React, { useState } from 'react';
import { audioService } from '../../services/audioService';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  soundEffect?: boolean;
  ripple?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  pulse?: boolean;
  glow?: boolean;
  children: React.ReactNode;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  soundEffect = true,
  ripple = true,
  icon,
  iconPosition = 'left',
  pulse = false,
  glow = false,
  children,
  className = '',
  onClick,
  onMouseEnter,
  onMouseLeave,
  disabled,
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const getVariantClasses = () => {
    const variants = {
      primary: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl border-0',
      secondary: 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 border border-gray-300 shadow-md hover:shadow-lg',
      success: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl border-0',
      warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-lg hover:shadow-xl border-0',
      danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl border-0',
      ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border border-gray-300 hover:border-gray-400'
    };
    return variants[variant];
  };

  const getSizeClasses = () => {
    const sizes = {
      sm: 'px-3 py-1.5 text-sm font-medium',
      md: 'px-4 py-2 text-sm font-semibold',
      lg: 'px-6 py-3 text-base font-semibold',
      xl: 'px-8 py-4 text-lg font-bold'
    };
    return sizes[size];
  };

  const getGlowClasses = () => {
    if (!glow) return '';
    const glows = {
      primary: 'shadow-blue-500/25',
      secondary: 'shadow-gray-500/25',
      success: 'shadow-green-500/25',
      warning: 'shadow-yellow-500/25',
      danger: 'shadow-red-500/25',
      ghost: 'shadow-gray-500/25'
    };
    return `shadow-2xl ${glows[variant]}`;
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    // Sound effect
    if (soundEffect) {
      audioService.playUISound('click');
    }

    // Ripple effect
    if (ripple) {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const newRipple = { id: Date.now(), x, y };
      
      setRipples(prev => [...prev, newRipple]);
      
      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 600);
    }

    // Press animation
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);

    onClick?.(event);
  };

  const handleMouseEnter = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (soundEffect && !disabled) {
      audioService.playUISound('hover');
    }
    onMouseEnter?.(event);
  };

  return (
    <button
      className={`
        relative overflow-hidden rounded-lg transition-all duration-200 
        transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-4 focus:ring-opacity-50
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${getGlowClasses()}
        ${pulse ? 'animate-pulse' : ''}
        ${isPressed ? 'scale-95' : 'hover:scale-105'}
        ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onMouseLeave}
      disabled={disabled || loading}
      {...props}
    >
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute animate-ping bg-white bg-opacity-25 rounded-full"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            animationDuration: '600ms'
          }}
        />
      ))}

      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Button content */}
      <div className={`flex items-center justify-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {icon && iconPosition === 'left' && (
          <span className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
            {icon}
          </span>
        )}
        
        <span className="flex-1">{children}</span>
        
        {icon && iconPosition === 'right' && (
          <span className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
            {icon}
          </span>
        )}
      </div>

      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
    </button>
  );
};