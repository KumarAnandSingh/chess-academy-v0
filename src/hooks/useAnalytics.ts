// useAnalytics Hook
// React hook for Google Analytics 4 integration with Chess Academy

import React, { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '../services/analytics';
import { initializeGA, isAnalyticsReady } from '../utils/gtag';
import { useAuthStore } from '../stores/authStore';
import type {
  AuthMethod,
  GameMode,
  GameResult,
  DifficultyLevel,
  FeatureType,
  SignUpEventParams,
  LoginEventParams,
  ChessGameStartParams,
  ChessGameEndParams,
  ChessMoveParams,
  FeatureUseParams,
  PuzzleCompleteParams,
  LessonProgressParams
} from '../services/analytics';

export interface UseAnalyticsReturn {
  // Tracking methods
  trackSignUp: (params: Omit<SignUpEventParams, 'device_type'>) => void;
  trackLogin: (params: Omit<LoginEventParams, 'device_type'>) => void;
  trackLogout: () => void;
  trackChessGameStart: (params: Omit<ChessGameStartParams, 'device_type'>) => void;
  trackChessGameEnd: (params: ChessGameEndParams) => void;
  trackChessMove: (params: ChessMoveParams) => void;
  trackFeatureUse: (feature: FeatureType, action: string) => void;
  trackPuzzleComplete: (params: PuzzleCompleteParams) => void;
  trackLessonProgress: (params: LessonProgressParams) => void;
  trackTutorialComplete: (tutorialName: string, timeSpent: number) => void;
  trackLevelUp: (newLevel: number, xpEarned: number) => void;
  trackAchievementUnlock: (achievementId: string, achievementName: string) => void;
  trackError: (errorName: string, errorDetails: string) => void;
  trackPerformance: (metricName: string, value: number, unit?: string) => void;
  
  // Utility methods
  isReady: boolean;
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

/**
 * Custom hook for Google Analytics 4 integration
 * Provides typed event tracking with automatic device detection and user context
 */
export const useAnalytics = (): UseAnalyticsReturn => {
  const location = useLocation();
  const { user, isAuthenticated, deviceInfo } = useAuthStore();
  const isInitializedRef = useRef(false);
  const sessionStartRef = useRef(Date.now());

  // Determine device type based on auth store device info
  const deviceType = deviceInfo.isMobile ? 'mobile' : 
                    deviceInfo.isTablet ? 'tablet' : 'desktop';

  // Initialize GA4 and analytics service on mount
  useEffect(() => {
    if (!isInitializedRef.current) {
      // Initialize Google Analytics 4
      initializeGA();
      
      // Wait for GA to be ready, then initialize analytics service
      const initTimer = setTimeout(() => {
        if (isAnalyticsReady()) {
          const userProperties = {
            device_type: deviceType,
            is_authenticated: isAuthenticated,
            user_agent: navigator.userAgent,
            screen_resolution: `${window.screen.width}x${window.screen.height}`,
            viewport_size: `${window.innerWidth}x${window.innerHeight}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
          };

          if (user) {
            analytics.initialize(user.id, {
              ...userProperties,
              signup_method: 'unknown', // This will be updated by auth events
              chess_experience: 'unknown', // This will be updated based on game performance
            });
          } else {
            analytics.initialize(undefined, userProperties);
          }

          isInitializedRef.current = true;
        }
      }, 100);

      return () => clearTimeout(initTimer);
    }
  }, [user, isAuthenticated, deviceType]);

  // Track page views on route changes
  useEffect(() => {
    if (isInitializedRef.current && isAnalyticsReady()) {
      // Get page title from document or generate from pathname
      const pageTitle = document.title || location.pathname.substring(1) || 'Home';
      analytics.trackPageView(location.pathname, pageTitle);
    }
  }, [location.pathname]);

  // Update user context when authentication state changes
  useEffect(() => {
    if (isInitializedRef.current && user && isAuthenticated) {
      analytics.setUserId(user.id);
      analytics.updateUserProperties({
        user_id: user.id,
        username: user.username,
        display_name: user.displayName,
        email: user.email,
        is_authenticated: true,
      });
    }
  }, [user, isAuthenticated]);

  // Tracking methods with automatic device type injection
  const trackSignUp = useCallback((params: Omit<SignUpEventParams, 'device_type'>) => {
    if (!isAnalyticsReady()) return;
    analytics.trackSignUp({ ...params, device_type: deviceType });
  }, [deviceType]);

  const trackLogin = useCallback((params: Omit<LoginEventParams, 'device_type'>) => {
    if (!isAnalyticsReady()) return;
    analytics.trackLogin({ ...params, device_type: deviceType });
  }, [deviceType]);

  const trackLogout = useCallback(() => {
    if (!isAnalyticsReady()) return;
    const sessionDuration = Math.floor((Date.now() - sessionStartRef.current) / 1000);
    analytics.trackLogout(sessionDuration);
  }, []);

  const trackChessGameStart = useCallback((params: Omit<ChessGameStartParams, 'device_type'>) => {
    if (!isAnalyticsReady()) return;
    analytics.trackChessGameStart({ ...params, device_type: deviceType });
  }, [deviceType]);

  const trackChessGameEnd = useCallback((params: ChessGameEndParams) => {
    if (!isAnalyticsReady()) return;
    analytics.trackChessGameEnd(params);
  }, []);

  const trackChessMove = useCallback((params: ChessMoveParams) => {
    if (!isAnalyticsReady()) return;
    analytics.trackChessMove(params);
  }, []);

  const trackFeatureUse = useCallback((feature: FeatureType, action: string) => {
    if (!isAnalyticsReady()) return;
    const sessionDuration = Math.floor((Date.now() - sessionStartRef.current) / 1000);
    analytics.trackFeatureUse({
      feature_name: feature,
      action,
      device_type: deviceType,
      session_duration: sessionDuration,
    });
  }, [deviceType]);

  const trackPuzzleComplete = useCallback((params: PuzzleCompleteParams) => {
    if (!isAnalyticsReady()) return;
    analytics.trackPuzzleComplete(params);
  }, []);

  const trackLessonProgress = useCallback((params: LessonProgressParams) => {
    if (!isAnalyticsReady()) return;
    analytics.trackLessonProgress(params);
  }, []);

  const trackTutorialComplete = useCallback((tutorialName: string, timeSpent: number) => {
    if (!isAnalyticsReady()) return;
    analytics.trackTutorialComplete(tutorialName, timeSpent);
  }, []);

  const trackLevelUp = useCallback((newLevel: number, xpEarned: number) => {
    if (!isAnalyticsReady()) return;
    analytics.trackLevelUp(newLevel, xpEarned);
  }, []);

  const trackAchievementUnlock = useCallback((achievementId: string, achievementName: string) => {
    if (!isAnalyticsReady()) return;
    analytics.trackAchievementUnlock(achievementId, achievementName);
  }, []);

  const trackError = useCallback((errorName: string, errorDetails: string) => {
    if (!isAnalyticsReady()) return;
    analytics.trackError(errorName, errorDetails, location.pathname);
  }, [location.pathname]);

  const trackPerformance = useCallback((metricName: string, value: number, unit?: string) => {
    if (!isAnalyticsReady()) return;
    analytics.trackPerformance(metricName, value, unit);
  }, []);

  return {
    // Tracking methods
    trackSignUp,
    trackLogin,
    trackLogout,
    trackChessGameStart,
    trackChessGameEnd,
    trackChessMove,
    trackFeatureUse,
    trackPuzzleComplete,
    trackLessonProgress,
    trackTutorialComplete,
    trackLevelUp,
    trackAchievementUnlock,
    trackError,
    trackPerformance,
    
    // Utility properties
    isReady: isAnalyticsReady(),
    deviceType,
  };
};

/**
 * Higher-order component for automatic feature usage tracking
 */
export const withAnalyticsTracking = <P extends Record<string, any>>(
  WrappedComponent: React.ComponentType<P>,
  featureName: FeatureType
) => {
  const WithAnalyticsComponent = (props: P) => {
    const { trackFeatureUse } = useAnalytics();
    const mountTimeRef = useRef(Date.now());

    useEffect(() => {
      // Track feature view on mount
      trackFeatureUse(featureName, 'view');

      // Track feature usage time on unmount
      return () => {
        const usageTime = Math.floor((Date.now() - mountTimeRef.current) / 1000);
        if (usageTime > 1) { // Only track if used for more than 1 second
          trackFeatureUse(featureName, 'time_spent');
        }
      };
    }, [trackFeatureUse]);

    return React.createElement(WrappedComponent, props);
  };

  WithAnalyticsComponent.displayName = `withAnalyticsTracking(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithAnalyticsComponent;
};

export default useAnalytics;