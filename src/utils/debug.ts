/**
 * Debug utilities for development
 * Automatically disabled in production builds
 */

// Check if we're in development mode
export const isDevelopment = import.meta.env.DEV || import.meta.env.NODE_ENV === 'development';

// Debug logging function that only logs in development
export const debugLog = (...args: any[]) => {
  if (isDevelopment) {
    console.log(...args);
  }
};

// Debug error logging
export const debugError = (...args: any[]) => {
  if (isDevelopment) {
    console.error(...args);
  }
};

// Debug warning logging
export const debugWarn = (...args: any[]) => {
  if (isDevelopment) {
    console.warn(...args);
  }
};

// Check if debug mode is enabled
export const isDebugMode = (): boolean => {
  return isDevelopment || localStorage.getItem('chessAcademyDebug') === 'true';
};

// Enable debug mode manually (for production debugging if needed)
export const enableDebugMode = () => {
  localStorage.setItem('chessAcademyDebug', 'true');
  console.log('🐛 Chess Academy Debug Mode Enabled');
};

// Disable debug mode
export const disableDebugMode = () => {
  localStorage.removeItem('chessAcademyDebug');
  console.log('🐛 Chess Academy Debug Mode Disabled');
};

// Export debug status
export const DEBUG_CONFIG = {
  isDevelopment,
  isDebugMode: isDebugMode(),
  version: '1.0.0',
  lastUpdated: '2025-09-08'
};