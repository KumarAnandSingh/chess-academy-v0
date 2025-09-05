import React from 'react';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  centerContent?: boolean;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  maxWidth = 'lg',
  padding = 'md',
  centerContent = false
}) => {
  const getMaxWidthClass = () => {
    const widths = {
      sm: 'max-w-sm',
      md: 'max-w-md', 
      lg: 'max-w-4xl',
      xl: 'max-w-6xl',
      '2xl': 'max-w-7xl',
      full: 'max-w-full'
    };
    return widths[maxWidth];
  };

  const getPaddingClass = () => {
    const paddings = {
      none: '',
      sm: 'px-2 sm:px-4',
      md: 'px-4 sm:px-6 lg:px-8',
      lg: 'px-6 sm:px-8 lg:px-12',
      xl: 'px-8 sm:px-12 lg:px-16'
    };
    return paddings[padding];
  };

  return (
    <div className={`
      w-full ${getMaxWidthClass()} ${getPaddingClass()}
      ${centerContent ? 'mx-auto' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className = '',
  cols = { default: 1, sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 'md'
}) => {
  const getGridCols = () => {
    const gridCols = [];
    if (cols.default) gridCols.push(`grid-cols-${cols.default}`);
    if (cols.sm) gridCols.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) gridCols.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) gridCols.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) gridCols.push(`xl:grid-cols-${cols.xl}`);
    return gridCols.join(' ');
  };

  const getGapClass = () => {
    const gaps = {
      sm: 'gap-2 sm:gap-3',
      md: 'gap-3 sm:gap-4 lg:gap-6',
      lg: 'gap-4 sm:gap-6 lg:gap-8',
      xl: 'gap-6 sm:gap-8 lg:gap-12'
    };
    return gaps[gap];
  };

  return (
    <div className={`
      grid ${getGridCols()} ${getGapClass()}
      ${className}
    `}>
      {children}
    </div>
  );
};

interface FlexContainerProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'row' | 'col';
  wrap?: boolean;
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'center' | 'end' | 'stretch';
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  responsive?: {
    sm?: { direction?: 'row' | 'col'; justify?: string; align?: string };
    md?: { direction?: 'row' | 'col'; justify?: string; align?: string };
    lg?: { direction?: 'row' | 'col'; justify?: string; align?: string };
  };
}

export const FlexContainer: React.FC<FlexContainerProps> = ({
  children,
  className = '',
  direction = 'row',
  wrap = false,
  justify = 'start',
  align = 'start',
  gap = 'md',
  responsive = {}
}) => {
  const getFlexClasses = () => {
    const classes = ['flex'];
    
    // Base direction and properties
    classes.push(`flex-${direction}`);
    if (wrap) classes.push('flex-wrap');
    classes.push(`justify-${justify}`);
    classes.push(`items-${align}`);
    
    // Gap
    const gaps = {
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8'
    };
    classes.push(gaps[gap]);
    
    // Responsive classes
    Object.entries(responsive).forEach(([breakpoint, props]) => {
      if (props.direction) classes.push(`${breakpoint}:flex-${props.direction}`);
      if (props.justify) classes.push(`${breakpoint}:justify-${props.justify}`);
      if (props.align) classes.push(`${breakpoint}:items-${props.align}`);
    });
    
    return classes.join(' ');
  };

  return (
    <div className={`${getFlexClasses()} ${className}`}>
      {children}
    </div>
  );
};

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  children,
  title
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        onClick={onClose}
      />
      
      {/* Menu */}
      <div className={`
        fixed inset-y-0 right-0 w-80 max-w-full bg-white shadow-xl z-50 md:hidden
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};