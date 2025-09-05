import React, { useState, useEffect, useRef } from 'react';
import { FadeIn, SlideIn } from './AnimationUtils';

// Page Transition Wrapper
interface PageTransitionProps {
  children: React.ReactNode;
  key?: string | number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale';
  duration?: number;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  direction = 'fade',
  duration = 500,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  if (direction === 'fade') {
    return (
      <FadeIn direction="up" duration={duration} className={className}>
        {children}
      </FadeIn>
    );
  }

  return (
    <SlideIn
      direction={direction === 'up' ? 'up' : direction === 'down' ? 'down' : direction === 'left' ? 'left' : 'right'}
      trigger={isVisible}
      duration={duration}
      className={className}
    >
      {children}
    </SlideIn>
  );
};

// Staggered List Animation
interface StaggeredListProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  className?: string;
}

export const StaggeredList: React.FC<StaggeredListProps> = ({
  children,
  staggerDelay = 100,
  className = ''
}) => {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <FadeIn key={index} delay={index * staggerDelay} direction="up">
          {child}
        </FadeIn>
      ))}
    </div>
  );
};

// Breadcrumb with smooth transitions
interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
}

export const AnimatedBreadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = <span className="text-gray-400 mx-2">/</span>,
  className = ''
}) => {
  return (
    <nav className={`flex items-center ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <FadeIn delay={index * 50} direction="right">
              <div className="flex items-center">
                {item.icon && (
                  <span className="mr-2 text-gray-500">{item.icon}</span>
                )}
                {item.href || item.onClick ? (
                  <button
                    onClick={item.onClick}
                    className={`
                      text-sm font-medium transition-colors duration-200
                      ${index === items.length - 1
                        ? 'text-gray-900 cursor-default'
                        : 'text-gray-500 hover:text-gray-700 hover:underline'
                      }
                    `}
                  >
                    {item.label}
                  </button>
                ) : (
                  <span className="text-sm font-medium text-gray-900">
                    {item.label}
                  </span>
                )}
              </div>
            </FadeIn>
            {index < items.length - 1 && (
              <FadeIn delay={(index * 50) + 25} direction="scale">
                {separator}
              </FadeIn>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

// Tab Navigation with smooth indicator
interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

interface AnimatedTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const AnimatedTabs: React.FC<AnimatedTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = ''
}) => {
  const [indicatorStyle, setIndicatorStyle] = useState<{
    width: number;
    left: number;
  }>({ width: 0, left: 0 });
  
  const tabsRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeTabRef.current && tabsRef.current) {
      const activeElement = activeTabRef.current;
      const container = tabsRef.current;
      
      const activeRect = activeElement.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      setIndicatorStyle({
        width: activeRect.width,
        left: activeRect.left - containerRect.left,
      });
    }
  }, [activeTab]);

  return (
    <div className={`relative ${className}`} ref={tabsRef}>
      {/* Tab buttons */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            ref={tab.id === activeTab ? activeTabRef : undefined}
            onClick={() => !tab.disabled && onTabChange(tab.id)}
            disabled={tab.disabled}
            className={`
              relative flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium
              transition-all duration-200 ease-out z-10
              ${tab.id === activeTab
                ? 'text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
              }
              ${tab.disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer'
              }
            `}
          >
            {tab.icon && (
              <span className={`
                transition-transform duration-200
                ${tab.id === activeTab ? 'scale-110' : 'scale-100'}
              `}>
                {tab.icon}
              </span>
            )}
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Active indicator */}
      <div
        className="absolute top-1 bottom-1 bg-white rounded-md shadow-sm transition-all duration-300 ease-out z-0"
        style={{
          width: `${indicatorStyle.width}px`,
          left: `${indicatorStyle.left}px`,
        }}
      />
    </div>
  );
};

// Smooth Accordion
interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpen?: string[];
  className?: string;
}

export const SmoothAccordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  defaultOpen = [],
  className = ''
}) => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(defaultOpen));

  const toggleItem = (itemId: string) => {
    const newOpenItems = new Set(openItems);
    
    if (newOpenItems.has(itemId)) {
      newOpenItems.delete(itemId);
    } else {
      if (!allowMultiple) {
        newOpenItems.clear();
      }
      newOpenItems.add(itemId);
    }
    
    setOpenItems(newOpenItems);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item, index) => {
        const isOpen = openItems.has(item.id);
        
        return (
          <FadeIn key={item.id} delay={index * 50} direction="up">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Header */}
              <button
                onClick={() => !item.disabled && toggleItem(item.id)}
                disabled={item.disabled}
                className={`
                  w-full flex items-center justify-between p-4 text-left
                  transition-all duration-200 ease-out
                  ${item.disabled
                    ? 'opacity-50 cursor-not-allowed bg-gray-50'
                    : 'hover:bg-gray-50 focus:bg-gray-50 focus:outline-none'
                  }
                  ${isOpen ? 'bg-blue-50 border-b border-gray-200' : ''}
                `}
              >
                <div className="flex items-center space-x-3">
                  {item.icon && (
                    <span className={`
                      transition-transform duration-200
                      ${isOpen ? 'text-blue-600' : 'text-gray-500'}
                    `}>
                      {item.icon}
                    </span>
                  )}
                  <span className={`
                    font-medium transition-colors duration-200
                    ${isOpen ? 'text-blue-900' : 'text-gray-900'}
                  `}>
                    {item.title}
                  </span>
                </div>
                
                <span className={`
                  transform transition-transform duration-200
                  ${isOpen ? 'rotate-180' : 'rotate-0'}
                  text-gray-400
                `}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>

              {/* Content */}
              <div
                className={`
                  overflow-hidden transition-all duration-300 ease-out
                  ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                `}
              >
                <div className="p-4 border-t border-gray-100 bg-white">
                  {item.content}
                </div>
              </div>
            </div>
          </FadeIn>
        );
      })}
    </div>
  );
};

// Smooth Modal/Dialog
interface SmoothModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const SmoothModal: React.FC<SmoothModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      const timer = setTimeout(() => setIsVisible(false), 200);
      return () => clearTimeout(timer);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        data-testid="modal-backdrop"
        className={`
          fixed inset-0 bg-black transition-opacity duration-200
          ${isOpen ? 'opacity-50' : 'opacity-0'}
        `}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="min-h-full flex items-center justify-center p-4">
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          className={`
            relative bg-white rounded-lg shadow-xl transform transition-all duration-200
            ${sizeClasses[size]} w-full
            ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
            ${className}
          `}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};