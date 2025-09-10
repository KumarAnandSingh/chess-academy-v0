// Google Analytics 4 Service for Chess Academy
// Provides typed event tracking for chess-specific user interactions

import { 
  trackEvent, 
  trackPageView, 
  setUserProperties, 
  setUserId, 
  isAnalyticsReady 
} from '../utils/gtag';

// === TYPE DEFINITIONS ===

export type AuthMethod = 'email' | 'google' | 'demo';
export type GameMode = 'vs_computer' | 'puzzle' | 'lesson' | 'practice';
export type GameResult = 'win' | 'loss' | 'draw' | 'abandoned';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type FeatureType = 'chess_board' | 'puzzles' | 'lessons' | 'settings' | 'profile' | 'leaderboard';

// User Authentication Events
export interface SignUpEventParams {
  method: AuthMethod;
  chess_experience?: DifficultyLevel;
  device_type: DeviceType;
  referrer?: string;
}

export interface LoginEventParams {
  method: AuthMethod;
  device_type: DeviceType;
  session_count?: number;
  time_since_last_login?: number; // in days
}

// Chess Game Events
export interface ChessGameStartParams {
  game_mode: GameMode;
  difficulty_level: DifficultyLevel;
  computer_level?: number;
  time_control?: string;
  device_type: DeviceType;
  user_rating?: number;
}

export interface ChessGameEndParams {
  game_mode: GameMode;
  result: GameResult;
  duration_seconds: number;
  moves_count: number;
  difficulty_level: DifficultyLevel;
  computer_level?: number;
  hints_used: number;
  mistakes_count: number;
  accuracy_percentage: number;
  user_rating_before?: number;
  user_rating_after?: number;
  rating_change?: number;
}

export interface ChessMoveParams {
  game_mode: GameMode;
  move_number: number;
  piece_type: string;
  from_square: string;
  to_square: string;
  is_capture: boolean;
  is_check: boolean;
  is_checkmate: boolean;
  move_time_seconds: number;
  is_hint_used: boolean;
}

// User Engagement Events
export interface FeatureUseParams {
  feature_name: FeatureType;
  action: string;
  device_type: DeviceType;
  session_duration?: number;
}

export interface PuzzleCompleteParams {
  puzzle_id: string;
  difficulty_level: DifficultyLevel;
  attempts_count: number;
  time_taken_seconds: number;
  was_successful: boolean;
  hints_used: number;
}

export interface LessonProgressParams {
  lesson_id: string;
  lesson_category: string;
  progress_percentage: number;
  time_spent_seconds: number;
  completed: boolean;
}

// === ANALYTICS SERVICE ===

class AnalyticsService {
  private userId: string | null = null;
  private sessionStartTime: number = Date.now();
  private currentPage: string = '';

  /**
   * Initialize analytics with user context
   */
  initialize(userId?: string, userProperties?: Record<string, any>): void {
    if (!isAnalyticsReady()) {
      console.warn('Analytics not ready - skipping initialization');
      return;
    }

    if (userId) {
      this.userId = userId;
      setUserId(userId);
    }

    if (userProperties) {
      setUserProperties(userProperties);
    }

    // Set default user properties
    const deviceType = this.getDeviceType();
    setUserProperties({
      device_type: deviceType,
      session_start_time: new Date().toISOString(),
    });
  }

  /**
   * Track page navigation
   */
  trackPageView(pagePath: string, pageTitle?: string): void {
    this.currentPage = pagePath;
    trackPageView(pagePath, pageTitle);
  }

  // === AUTHENTICATION EVENTS ===

  trackSignUp(params: SignUpEventParams): void {
    trackEvent('sign_up', {
      method: params.method,
      chess_experience: params.chess_experience,
      device_type: params.device_type,
      referrer: params.referrer,
    });
  }

  trackLogin(params: LoginEventParams): void {
    trackEvent('login', {
      method: params.method,
      device_type: params.device_type,
      session_count: params.session_count,
      time_since_last_login: params.time_since_last_login,
    });
  }

  trackLogout(sessionDuration?: number): void {
    trackEvent('logout', {
      session_duration_seconds: sessionDuration || this.getSessionDuration(),
      device_type: this.getDeviceType(),
    });
  }

  // === CHESS GAME EVENTS ===

  trackChessGameStart(params: ChessGameStartParams): void {
    trackEvent('chess_game_start', {
      game_mode: params.game_mode,
      difficulty_level: params.difficulty_level,
      computer_level: params.computer_level,
      time_control: params.time_control,
      device_type: params.device_type,
      user_rating: params.user_rating,
    });
  }

  trackChessGameEnd(params: ChessGameEndParams): void {
    trackEvent('chess_game_end', {
      game_mode: params.game_mode,
      result: params.result,
      duration_seconds: params.duration_seconds,
      moves_count: params.moves_count,
      difficulty_level: params.difficulty_level,
      computer_level: params.computer_level,
      hints_used: params.hints_used,
      mistakes_count: params.mistakes_count,
      accuracy_percentage: params.accuracy_percentage,
      user_rating_before: params.user_rating_before,
      user_rating_after: params.user_rating_after,
      rating_change: params.rating_change,
      value: params.duration_seconds, // GA4 standard parameter for engagement
    });
  }

  trackChessMove(params: ChessMoveParams): void {
    trackEvent('chess_move', {
      game_mode: params.game_mode,
      move_number: params.move_number,
      piece_type: params.piece_type,
      from_square: params.from_square,
      to_square: params.to_square,
      is_capture: params.is_capture,
      is_check: params.is_check,
      is_checkmate: params.is_checkmate,
      move_time_seconds: params.move_time_seconds,
      is_hint_used: params.is_hint_used,
    });
  }

  // === USER ENGAGEMENT EVENTS ===

  trackFeatureUse(params: FeatureUseParams): void {
    trackEvent('feature_use', {
      feature_name: params.feature_name,
      action: params.action,
      device_type: params.device_type,
      session_duration: params.session_duration || this.getSessionDuration(),
    });
  }

  trackPuzzleComplete(params: PuzzleCompleteParams): void {
    trackEvent('puzzle_complete', {
      puzzle_id: params.puzzle_id,
      difficulty_level: params.difficulty_level,
      attempts_count: params.attempts_count,
      time_taken_seconds: params.time_taken_seconds,
      was_successful: params.was_successful,
      hints_used: params.hints_used,
      value: params.was_successful ? 1 : 0, // GA4 conversion value
    });
  }

  trackLessonProgress(params: LessonProgressParams): void {
    trackEvent('lesson_progress', {
      lesson_id: params.lesson_id,
      lesson_category: params.lesson_category,
      progress_percentage: params.progress_percentage,
      time_spent_seconds: params.time_spent_seconds,
      completed: params.completed,
      value: params.progress_percentage, // Progress as value
    });
  }

  // === CONVERSION EVENTS ===

  trackTutorialComplete(tutorialName: string, timeSpent: number): void {
    trackEvent('tutorial_complete', {
      tutorial_name: tutorialName,
      time_spent_seconds: timeSpent,
      device_type: this.getDeviceType(),
      value: 1, // Conversion value
    });
  }

  trackLevelUp(newLevel: number, xpEarned: number): void {
    trackEvent('level_up', {
      level: newLevel,
      xp_earned: xpEarned,
      character: 'chess_player', // GA4 gaming parameter
      device_type: this.getDeviceType(),
    });
  }

  trackAchievementUnlock(achievementId: string, achievementName: string): void {
    trackEvent('unlock_achievement', {
      achievement_id: achievementId,
      achievement_name: achievementName,
      device_type: this.getDeviceType(),
    });
  }

  // === ERROR TRACKING ===

  trackError(errorName: string, errorDetails: string, page?: string): void {
    trackEvent('exception', {
      description: errorName,
      fatal: false,
      error_details: errorDetails,
      page: page || this.currentPage,
    });
  }

  trackCriticalError(errorName: string, errorDetails: string): void {
    trackEvent('exception', {
      description: errorName,
      fatal: true,
      error_details: errorDetails,
      page: this.currentPage,
    });
  }

  // === PERFORMANCE TRACKING ===

  trackPerformance(metricName: string, value: number, unit?: string): void {
    trackEvent('performance_metric', {
      metric_name: metricName,
      metric_value: value,
      unit: unit || 'ms',
      page: this.currentPage,
    });
  }

  // === UTILITY METHODS ===

  private getDeviceType(): DeviceType {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private getSessionDuration(): number {
    return Math.floor((Date.now() - this.sessionStartTime) / 1000);
  }

  /**
   * Update user properties (for user progression tracking)
   */
  updateUserProperties(properties: Record<string, any>): void {
    setUserProperties(properties);
  }

  /**
   * Set user ID for authenticated users
   */
  setUserId(userId: string): void {
    this.userId = userId;
    setUserId(userId);
  }

  /**
   * Get current user ID
   */
  getUserId(): string | null {
    return this.userId;
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();

// Export for dependency injection or testing
export default AnalyticsService;