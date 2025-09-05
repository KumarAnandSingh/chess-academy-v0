// Feature Flags Configuration for Chess Academy V1+
// This allows safe rollout of new features without breaking V0

export interface FeatureFlags {
  // V1 Phase 1: Enhanced Gameplay
  puzzleSystem: boolean;
  openingTrainer: boolean;
  analysisBoard: boolean;
  advancedStats: boolean;
  
  // V1 Phase 2: Social Features
  multiplayerMode: boolean;
  tournamentSystem: boolean;
  userProfiles: boolean;
  chatSystem: boolean;
  
  // V1 Phase 3: Advanced Features
  studyMode: boolean;
  customTraining: boolean;
  chesscomIntegration: boolean;
  mobilePWA: boolean;
  
  // V1 Phase 4: Professional Features
  lessonsSystem: boolean;
  coachMode: boolean;
  performanceAnalytics: boolean;
  premiumFeatures: boolean;
}

// Default feature flags - all V1 features disabled for production safety
const defaultFlags: FeatureFlags = {
  // Phase 1
  puzzleSystem: false,
  openingTrainer: false,
  analysisBoard: false,
  advancedStats: false,
  
  // Phase 2
  multiplayerMode: false,
  tournamentSystem: false,
  userProfiles: false,
  chatSystem: false,
  
  // Phase 3
  studyMode: false,
  customTraining: false,
  chesscomIntegration: false,
  mobilePWA: false,
  
  // Phase 4
  lessonsSystem: false,
  coachMode: false,
  performanceAnalytics: false,
  premiumFeatures: false,
};

// Environment-specific overrides
const developmentFlags: Partial<FeatureFlags> = {
  // Enable first features in development
  puzzleSystem: true,
  openingTrainer: true,
  analysisBoard: true,
};

const stagingFlags: Partial<FeatureFlags> = {
  // Test features in staging
  puzzleSystem: true,
  openingTrainer: true,
};

// Get feature flags based on environment
export const getFeatureFlags = (): FeatureFlags => {
  const baseFlags = { ...defaultFlags };
  
  if (import.meta.env.DEV) {
    return { ...baseFlags, ...developmentFlags };
  }
  
  if (import.meta.env.VITE_APP_ENVIRONMENT === 'staging') {
    return { ...baseFlags, ...stagingFlags };
  }
  
  // Production - use default (all disabled)
  return baseFlags;
};

// Hook for using feature flags in components
export const useFeatureFlag = (flag: keyof FeatureFlags): boolean => {
  const flags = getFeatureFlags();
  return flags[flag];
};

// Utility to check multiple flags
export const useFeatureFlags = (flags: Array<keyof FeatureFlags>): Record<keyof FeatureFlags, boolean> => {
  const allFlags = getFeatureFlags();
  return flags.reduce((acc, flag) => {
    acc[flag] = allFlags[flag];
    return acc;
  }, {} as Record<keyof FeatureFlags, boolean>);
};