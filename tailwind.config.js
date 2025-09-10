/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    /* PREMIUM GRID SYSTEM */
    container: {
      center: true,
      padding: {
        DEFAULT: "16px", // Mobile margins
        sm: "24px",
        md: "32px", 
        lg: "72px", // Desktop margins per spec
        xl: "72px",
        "2xl": "72px",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1440px", // Design system max-width
      },
    },
    screens: {
      xs: "320px",
      sm: "390px", // Mobile design width
      md: "768px", // Tablet
      lg: "1024px",
      xl: "1280px",
      "2xl": "1440px", // Desktop design width
      "3xl": "1600px",
      
      // Design system breakpoints
      mobile: {"max": "767px"},
      tablet: {"min": "768px", "max": "1023px"},
      desktop: {"min": "1024px"},
      
      // Interaction breakpoints
      touch: {"raw": "(hover: none) and (pointer: coarse)"},
      "no-touch": {"raw": "(hover: hover) and (pointer: fine)"},
      "reduced-motion": {"raw": "(prefers-reduced-motion: reduce)"},
      "high-contrast": {"raw": "(prefers-contrast: high)"},
    },
    extend: {
      colors: {
        /* PREMIUM DESIGN SYSTEM COLORS */
        // Background System (Dark Theme Primary)
        'dark-bg': '#0E1116',
        'dark-bg-alt': '#0F172A', 
        'dark-surface': '#131822',
        'dark-elevated': '#1A212C',
        'dark-overlay': '#212936',
        
        // Text Hierarchy  
        'light-text': '#E6EAF2',
        'muted-text': '#A7B3C7', 
        'subtle-text': '#7C8AA3',
        'disabled-text': '#5A6B86',
        'inverse-text': '#0E1116',
        
        // Accent System (#7C5CFF primary)
        'accent': {
          DEFAULT: '#7C5CFF',
          50: '#F4F1FF',
          100: '#E9E3FF', 
          200: '#D6CCFF',
          300: '#BBA8FF',
          400: '#9B7BFF',
          500: '#7C5CFF', // Primary
          600: '#6A4BFF', // Hover
          700: '#5A3FE3', // Pressed
          800: '#4A33BF',
          900: '#3D2A9C',
          'subtle': 'rgba(124, 92, 255, 0.12)',
        },
        
        // Semantic Colors
        'success': {
          DEFAULT: '#22C55E',
          'subtle': 'rgba(34, 197, 94, 0.12)',
        },
        'warning': {
          DEFAULT: '#F59E0B', 
          'subtle': 'rgba(245, 158, 11, 0.12)',
        },
        'danger': {
          DEFAULT: '#EF4444',
          'subtle': 'rgba(239, 68, 68, 0.12)', 
        },
        
        // Chess Board Colors (Premium)
        'board': {
          'light': '#EAEFF7',
          'dark': '#5A6B86',
          'highlight': 'rgba(155, 180, 255, 0.24)',
          'legal': 'rgba(124, 92, 255, 0.16)',
          'capture': 'rgba(239, 68, 68, 0.2)', 
          'check': 'rgba(245, 158, 11, 0.3)',
        },
        
        // Border System
        'border-subtle': 'rgba(167, 179, 199, 0.1)',
        'border-default': 'rgba(167, 179, 199, 0.16)',
        'border-strong': 'rgba(167, 179, 199, 0.24)',
        'border-accent': '#7C5CFF',
        
        // Legacy support for existing components
        background: 'var(--color-bg-base)',
        foreground: 'var(--color-text-primary)',
        primary: {
          DEFAULT: '#7C5CFF',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#A7B3C7',
          foreground: '#0E1116', 
        },
        muted: {
          DEFAULT: '#131822',
          foreground: '#7C8AA3',
        },
        card: {
          DEFAULT: '#131822',
          foreground: '#E6EAF2',
        },
        popover: {
          DEFAULT: '#1A212C',
          foreground: '#E6EAF2',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#FFFFFF',
        },
        
        // Additional premium colors
        'premium': {
          'gold': '#FFD700',
          'silver': '#C0C0C0', 
          'bronze': '#CD7F32',
        },
      },
      /* PREMIUM RADIUS SYSTEM (Per Design Spec) */
      borderRadius: {
        'none': '0',
        'xs': '6px',   // Cards, small elements
        'sm': '10px',  // Buttons, inputs
        'md': '14px',  // Cards, panels  
        'lg': '18px',  // Modals, large cards
        'xl': '24px',  // Hero sections
        'full': '9999px', // Pills, circles
      },
      
      /* PREMIUM SPACING SYSTEM (8px baseline) */
      spacing: {
        'px': '1px',
        '0': '0',
        '1': '4px',   // xs
        '2': '8px',   // sm  
        '3': '12px',  // md
        '4': '16px',  // lg
        '5': '20px',
        '6': '24px',  // xl
        '7': '28px',
        '8': '32px',  // 2xl
        '10': '40px',
        '12': '48px', // 3xl
        '14': '56px',
        '16': '64px', // 4xl
        '20': '80px', // 5xl
        '24': '96px', // 6xl
        '28': '112px',
        '32': '128px',
        '36': '144px',
        '40': '160px',
        '44': '176px',
        '48': '192px',
        '52': '208px',
        '56': '224px',
        '60': '240px',
        '64': '256px',
        '72': '288px',
        '80': '320px',
        '96': '384px',
        
        // Safe area spacing
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
        
        // Component-specific spacing
        'button-padding-x': '16px',
        'button-padding-y': '8px',
        'card-padding': '24px',
        'section-padding': '48px',
        'page-padding': '72px', // Desktop margins
      },
      minHeight: {
        'screen-safe': ['100vh', '100dvh'],
        'mobile': '600px',
        'chess-board': 'min(80vw, 80vh)',
      },
      minWidth: {
        'mobile': '320px',
        'chess-board': 'min(80vw, 80vh)',
      },
      maxWidth: {
        'mobile': '767px',
        'chess-board': 'min(90vw, 90vh)',
      },
      /* PREMIUM TYPOGRAPHY SYSTEM (Manrope + Inter) */
      fontSize: {
        // Design System Type Scale
        'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],     // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.016em' }], // 14px  
        'base': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],          // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '0' }],       // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],  // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.01em' }],     // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.02em' }],   // 36px
        '5xl': ['3rem', { lineHeight: '3rem', letterSpacing: '-0.02em' }],        // 48px
        '6xl': ['3.75rem', { lineHeight: '3.75rem', letterSpacing: '-0.02em' }], // 60px
        
        // Component-specific sizes
        'title': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h1': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.01em', fontWeight: '700' }],
        'h2': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.01em', fontWeight: '600' }],
        'h3': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em', fontWeight: '600' }],
        'body': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0', fontWeight: '400' }],
        'caption': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.016em', fontWeight: '400' }],
        'mono': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0', fontFamily: 'JetBrains Mono' }],
      },
      
      fontFamily: {
        'primary': ['Manrope', 'system-ui', 'sans-serif'],
        'secondary': ['Inter', 'system-ui', 'sans-serif'], 
        'mono': ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        // Legacy support
        'sans': ['Manrope', 'system-ui', 'sans-serif'],
      },
      
      fontWeight: {
        'thin': '100',
        'extralight': '200', 
        'light': '300',
        'normal': '400',
        'medium': '500',
        'semibold': '600',
        'bold': '700',
        'extrabold': '800',
        'black': '900',
      },
      /* PREMIUM MOTION SYSTEM (150-200ms, cubic-bezier easing) */
      keyframes: {
        // Core UI Animations
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "slide-in-up": {
          "0%": { transform: "translateY(16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-in-down": {
          "0%": { transform: "translateY(-16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(-16px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.96)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        
        // Premium Button Interactions
        "button-press": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(0.98)" },
          "100%": { transform: "scale(1)" },
        },
        
        // Progress Animations  
        "progress-fill": {
          "0%": { transform: "scaleX(0)", transformOrigin: "left" },
          "100%": { transform: "scaleX(1)", transformOrigin: "left" },
        },
        "progress-ring": {
          "0%": { strokeDashoffset: "251.2" }, 
          "100%": { strokeDashoffset: "0" },
        },
        
        // Chess Board Animations
        "board-highlight": {
          "0%": { backgroundColor: "transparent" },
          "50%": { backgroundColor: "rgba(124, 92, 255, 0.2)" },
          "100%": { backgroundColor: "rgba(124, 92, 255, 0.1)" },
        },
        "piece-move": {
          "0%": { transform: "translate(var(--from-x), var(--from-y))" },
          "100%": { transform: "translate(var(--to-x), var(--to-y))" },
        },
        "legal-move-pulse": {
          "0%": { transform: "scale(1)", opacity: "0.6" },
          "50%": { transform: "scale(1.1)", opacity: "0.8" },
          "100%": { transform: "scale(1)", opacity: "0.6" },
        },
        
        // Success/Achievement Animations
        "confetti-fall": {
          "0%": { 
            transform: "translateY(-100vh) rotate(0deg)", 
            opacity: "1" 
          },
          "100%": { 
            transform: "translateY(100vh) rotate(360deg)", 
            opacity: "0" 
          },
        },
        "achievement-bounce": {
          "0%": { transform: "scale(0)", opacity: "0" },
          "60%": { transform: "scale(1.1)", opacity: "0.9" },
          "80%": { transform: "scale(0.95)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        
        // Toast Notifications
        "toast-slide-in": {
          "0%": { 
            transform: "translateX(100%) translateY(-50%)", 
            opacity: "0" 
          },
          "100%": { 
            transform: "translateX(0) translateY(-50%)", 
            opacity: "1" 
          },
        },
        "toast-slide-out": {
          "0%": { 
            transform: "translateX(0) translateY(-50%)", 
            opacity: "1" 
          },
          "100%": { 
            transform: "translateX(100%) translateY(-50%)", 
            opacity: "0" 
          },
        },
        
        // Loading States
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "pulse-subtle": {
          "0%": { opacity: "0.6" },
          "50%": { opacity: "1" },
          "100%": { opacity: "0.6" },
        },
        
        // Legacy animations (for compatibility)
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      
      animation: {
        // Core UI (150-200ms with premium easing)
        "fade-in": "fade-in 200ms cubic-bezier(0.2, 0.6, 0.2, 1)",
        "fade-out": "fade-out 150ms cubic-bezier(0.2, 0.6, 0.2, 1)",
        "slide-in-up": "slide-in-up 200ms cubic-bezier(0.2, 0.6, 0.2, 1)",
        "slide-in-down": "slide-in-down 200ms cubic-bezier(0.2, 0.6, 0.2, 1)",
        "slide-in-right": "slide-in-right 200ms cubic-bezier(0.2, 0.6, 0.2, 1)",
        "scale-in": "scale-in 200ms cubic-bezier(0.2, 0.6, 0.2, 1)",
        
        // Interactive
        "button-press": "button-press 150ms cubic-bezier(0.2, 0.6, 0.2, 1)",
        
        // Progress  
        "progress-fill": "progress-fill 800ms cubic-bezier(0.2, 0.6, 0.2, 1)",
        "progress-ring": "progress-ring 1000ms cubic-bezier(0.2, 0.6, 0.2, 1)",
        
        // Chess Board (120ms for responsiveness)
        "board-highlight": "board-highlight 120ms cubic-bezier(0.2, 0.6, 0.2, 1)",
        "piece-move": "piece-move 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "legal-move-pulse": "legal-move-pulse 1500ms ease-in-out infinite",
        
        // Success States
        "confetti": "confetti-fall 3000ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
        "achievement": "achievement-bounce 600ms cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        
        // Toast (3s auto-dismiss)
        "toast-in": "toast-slide-in 200ms cubic-bezier(0.2, 0.6, 0.2, 1)",
        "toast-out": "toast-slide-out 150ms cubic-bezier(0.2, 0.6, 0.2, 1)",
        
        // Loading
        "spin-slow": "spin-slow 2s linear infinite",
        "pulse-subtle": "pulse-subtle 2s ease-in-out infinite",
        
        // Legacy support
        "accordion-down": "accordion-down 200ms cubic-bezier(0.2, 0.6, 0.2, 1)",
        "accordion-up": "accordion-up 200ms cubic-bezier(0.2, 0.6, 0.2, 1)",
        
        // Reduced motion alternatives (will be overridden by CSS)
        "fade-in-reduced": "fade-in 50ms ease-out",
        "scale-in-reduced": "scale-in 50ms ease-out",
      },
      /* PREMIUM ELEVATION SYSTEM (Layered shadows with soft blurs) */
      boxShadow: {
        'none': 'none',
        'subtle': '0 1px 3px rgba(0, 0, 0, 0.1)', 
        'card': '0 2px 10px rgba(0, 0, 0, 0.15)',
        'dropdown': '0 4px 16px rgba(0, 0, 0, 0.2)',
        'modal': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'premium': '0 12px 48px rgba(124, 92, 255, 0.15)',
        
        // Component-specific shadows
        'button': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'button-hover': '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
        'input': 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
        'input-focus': '0 0 0 3px rgba(124, 92, 255, 0.1), inset 0 1px 3px rgba(0, 0, 0, 0.1)',
        
        // Chess-specific shadows
        'chess-board': '0 8px 32px rgba(0, 0, 0, 0.12)',
        'chess-piece': '0 2px 8px rgba(0, 0, 0, 0.15)',
        'chess-piece-hover': '0 4px 12px rgba(0, 0, 0, 0.2)',
        
        // Mobile-optimized shadows 
        'mobile-card': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'mobile-nav': '0 -2px 16px rgba(0, 0, 0, 0.1)',
      },
      backdropBlur: {
        xs: '2px',
      },
      zIndex: {
        'mobile-nav': '1000',
        'mobile-overlay': '999',
        'chess-board': '10',
        'auth-modal': '2000',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}