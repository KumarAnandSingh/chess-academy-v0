// Google Analytics 4 Utilities
// Handles gtag initialization and configuration

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date | Record<string, any>,
      config?: Record<string, any>
    ) => void;
    dataLayer: Record<string, any>[];
  }
}

export const GA_TRACKING_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
export const IS_DEBUG_MODE = import.meta.env.VITE_GA_DEBUG_MODE === 'true';
export const IS_ANALYTICS_ENABLED = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';

/**
 * Initialize Google Analytics 4
 */
export const initializeGA = (): void => {
  if (!GA_TRACKING_ID || !IS_ANALYTICS_ENABLED) {
    console.warn('Google Analytics not initialized: Missing tracking ID or disabled');
    return;
  }

  // Initialize dataLayer if not exists
  window.dataLayer = window.dataLayer || [];
  
  // Define gtag function
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  // Initialize with current timestamp
  window.gtag('js', new Date());

  // Configure GA4 with privacy settings
  window.gtag('config', GA_TRACKING_ID, {
    // Privacy settings
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    
    // Performance settings
    send_page_view: true,
    
    // Debug settings
    debug_mode: IS_DEBUG_MODE,
    
    // Enhanced measurement (automatic events)
    enhanced_measurement: {
      scrolls: true,
      outbound_clicks: true,
      site_search: false,
      video_engagement: false,
      file_downloads: true,
    },

    // Custom parameters
    custom_map: {
      custom_parameter_1: 'chess_skill_level',
      custom_parameter_2: 'device_type',
    },
  });

  if (IS_DEBUG_MODE) {
    console.log('Google Analytics 4 initialized with tracking ID:', GA_TRACKING_ID);
  }
};

/**
 * Track page views
 */
export const trackPageView = (pagePath: string, pageTitle?: string): void => {
  if (!window.gtag || !IS_ANALYTICS_ENABLED) return;

  window.gtag('event', 'page_view', {
    page_path: pagePath,
    page_title: pageTitle,
  });

  if (IS_DEBUG_MODE) {
    console.log('GA4 Page view tracked:', { pagePath, pageTitle });
  }
};

/**
 * Set user properties for enhanced tracking
 */
export const setUserProperties = (properties: Record<string, any>): void => {
  if (!window.gtag || !IS_ANALYTICS_ENABLED) return;

  window.gtag('set', {
    user_properties: properties,
  });

  if (IS_DEBUG_MODE) {
    console.log('GA4 User properties set:', properties);
  }
};

/**
 * Set user ID for cross-session tracking
 */
export const setUserId = (userId: string): void => {
  if (!window.gtag || !IS_ANALYTICS_ENABLED) return;

  window.gtag('config', GA_TRACKING_ID, {
    user_id: userId,
  });

  if (IS_DEBUG_MODE) {
    console.log('GA4 User ID set:', userId);
  }
};

/**
 * Track custom events with enhanced error handling
 */
export const trackEvent = (
  eventName: string, 
  parameters: Record<string, any> = {}
): void => {
  if (!window.gtag || !IS_ANALYTICS_ENABLED) return;

  try {
    // Ensure parameter values are valid for GA4
    const sanitizedParams = Object.entries(parameters).reduce((acc, [key, value]) => {
      // GA4 parameter name restrictions: alphanumeric, underscore, max 40 chars
      const sanitizedKey = key.replace(/[^a-zA-Z0-9_]/g, '_').substring(0, 40);
      
      // Handle different value types
      let sanitizedValue = value;
      if (typeof value === 'object' && value !== null) {
        sanitizedValue = JSON.stringify(value);
      } else if (typeof value === 'boolean') {
        sanitizedValue = value.toString();
      } else if (typeof value === 'number') {
        // Keep numbers as-is, but handle NaN and Infinity
        if (!isFinite(value)) {
          sanitizedValue = '0';
        }
      } else if (typeof value === 'string') {
        // Truncate long strings (GA4 limit is 100 characters for most parameters)
        sanitizedValue = value.substring(0, 100);
      }

      acc[sanitizedKey] = sanitizedValue;
      return acc;
    }, {} as Record<string, any>);

    window.gtag('event', eventName, sanitizedParams);

    if (IS_DEBUG_MODE) {
      console.log('GA4 Event tracked:', eventName, sanitizedParams);
    }
  } catch (error) {
    console.error('Error tracking GA4 event:', error);
  }
};

/**
 * Check if Google Analytics is loaded and ready
 */
export const isAnalyticsReady = (): boolean => {
  return !!(window.gtag && window.dataLayer && IS_ANALYTICS_ENABLED);
};