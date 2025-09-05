import React, { useEffect, useState, useRef } from 'react';

// Fade In Animation Component
interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale';
  className?: string;
}

export const FadeIn: React.FC<FadeInProps> = ({ 
  children, 
  delay = 0, 
  duration = 600,
  direction = 'up',
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const getTransformClasses = () => {
    const base = 'transition-all ease-out';
    const directions = {
      up: isVisible 
        ? 'translate-y-0 opacity-100' 
        : 'translate-y-8 opacity-0',
      down: isVisible 
        ? 'translate-y-0 opacity-100' 
        : '-translate-y-8 opacity-0',
      left: isVisible 
        ? 'translate-x-0 opacity-100' 
        : 'translate-x-8 opacity-0',
      right: isVisible 
        ? 'translate-x-0 opacity-100' 
        : '-translate-x-8 opacity-0',
      scale: isVisible 
        ? 'scale-100 opacity-100' 
        : 'scale-95 opacity-0'
    };
    return `${base} ${directions[direction]}`;
  };

  return (
    <div 
      ref={elementRef}
      className={`${getTransformClasses()} ${className}`}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
};

// Slide In Animation Component
interface SlideInProps {
  children: React.ReactNode;
  direction: 'left' | 'right' | 'up' | 'down';
  trigger: boolean;
  duration?: number;
  className?: string;
}

export const SlideIn: React.FC<SlideInProps> = ({
  children,
  direction,
  trigger,
  duration = 300,
  className = ''
}) => {
  const getTransformClasses = () => {
    const directions = {
      left: trigger ? 'translate-x-0' : '-translate-x-full',
      right: trigger ? 'translate-x-0' : 'translate-x-full',
      up: trigger ? 'translate-y-0' : '-translate-y-full',
      down: trigger ? 'translate-y-0' : 'translate-y-full'
    };
    return `transform transition-transform ease-out ${directions[direction]}`;
  };

  return (
    <div 
      className={`${getTransformClasses()} ${className}`}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
};

// Bounce Animation Component
interface BounceProps {
  children: React.ReactNode;
  trigger: boolean;
  className?: string;
}

export const Bounce: React.FC<BounceProps> = ({ children, trigger, className = '' }) => (
  <div className={`${trigger ? 'animate-bounce' : ''} ${className}`}>
    {children}
  </div>
);

// Pulse Animation Component
interface PulseProps {
  children: React.ReactNode;
  active: boolean;
  className?: string;
}

export const Pulse: React.FC<PulseProps> = ({ children, active, className = '' }) => (
  <div className={`${active ? 'animate-pulse' : ''} ${className}`}>
    {children}
  </div>
);

// Shake Animation Component
interface ShakeProps {
  children: React.ReactNode;
  trigger: boolean;
  className?: string;
}

export const Shake: React.FC<ShakeProps> = ({ children, trigger, className = '' }) => {
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 500);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <div className={`${isShaking ? 'animate-shake' : ''} ${className}`}>
      {children}
    </div>
  );
};

// Float Animation Component
interface FloatProps {
  children: React.ReactNode;
  className?: string;
}

export const Float: React.FC<FloatProps> = ({ children, className = '' }) => (
  <div className={`animate-float ${className}`}>
    {children}
  </div>
);

// Stagger Animation Container
interface StaggerProps {
  children: React.ReactNode[];
  delay?: number;
  className?: string;
}

export const Stagger: React.FC<StaggerProps> = ({ children, delay = 100, className = '' }) => (
  <div className={className}>
    {children.map((child, index) => (
      <FadeIn key={index} delay={index * delay} direction="up">
        {child}
      </FadeIn>
    ))}
  </div>
);

// Custom CSS animations (to be added to your CSS file)
export const animationStyles = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
    20%, 40%, 60%, 80% { transform: translateX(2px); }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-4px); }
  }

  @keyframes wiggle {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(1deg); }
    75% { transform: rotate(-1deg); }
  }

  @keyframes heartbeat {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translate3d(0, 40px, 0);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  @keyframes slideInFromLeft {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0);
    }
  }

  @keyframes slideInFromRight {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }

  @keyframes zoomIn {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .animate-shake {
    animation: shake 0.5s ease-in-out;
  }

  .animate-float {
    animation: float 3s ease-in-out infinite;
  }

  .animate-wiggle {
    animation: wiggle 1s ease-in-out infinite;
  }

  .animate-heartbeat {
    animation: heartbeat 1.5s ease-in-out infinite;
  }

  .animate-fadeInUp {
    animation: fadeInUp 0.6s ease-out;
  }

  .animate-slideInFromLeft {
    animation: slideInFromLeft 0.5s ease-out;
  }

  .animate-slideInFromRight {
    animation: slideInFromRight 0.5s ease-out;
  }

  .animate-zoomIn {
    animation: zoomIn 0.3s ease-out;
  }

  /* Hover animations */
  .hover-lift {
    transition: transform 0.2s ease;
  }

  .hover-lift:hover {
    transform: translateY(-2px);
  }

  .hover-glow {
    transition: box-shadow 0.2s ease;
  }

  .hover-glow:hover {
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  }

  .hover-scale {
    transition: transform 0.2s ease;
  }

  .hover-scale:hover {
    transform: scale(1.05);
  }

  /* Loading animations */
  .loading-dots::after {
    content: '';
    animation: loading-dots 1.5s steps(4, end) infinite;
  }

  @keyframes loading-dots {
    0%, 20% {
      color: rgba(0, 0, 0, 0);
      text-shadow:
        .25em 0 0 rgba(0, 0, 0, 0),
        .5em 0 0 rgba(0, 0, 0, 0);
    }
    40% {
      color: black;
      text-shadow:
        .25em 0 0 rgba(0, 0, 0, 0),
        .5em 0 0 rgba(0, 0, 0, 0);
    }
    60% {
      text-shadow:
        .25em 0 0 black,
        .5em 0 0 rgba(0, 0, 0, 0);
    }
    80%, 100% {
      text-shadow:
        .25em 0 0 black,
        .5em 0 0 black;
    }
  }
`;

// Intersection Observer Hook for scroll animations
export const useIntersectionObserver = () => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return { isVisible, elementRef };
};

// Scroll triggered animation component
interface ScrollAnimationProps {
  children: React.ReactNode;
  animation?: 'fadeInUp' | 'slideInFromLeft' | 'slideInFromRight' | 'zoomIn';
  className?: string;
}

export const ScrollAnimation: React.FC<ScrollAnimationProps> = ({
  children,
  animation = 'fadeInUp',
  className = ''
}) => {
  const { isVisible, elementRef } = useIntersectionObserver();

  return (
    <div
      ref={elementRef as any}
      className={`${isVisible ? `animate-${animation}` : 'opacity-0'} ${className}`}
    >
      {children}
    </div>
  );
};