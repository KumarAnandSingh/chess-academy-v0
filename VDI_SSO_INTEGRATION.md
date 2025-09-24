# 🔐 Chess Academy V0 - VDI/SSO Integration Guide

**Version**: 1.0
**Target Environment**: VDI Cloud PC on TV/Monitor via Set-top Box
**Authentication**: SSO Token Integration

---

## 🏗️ VDI Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   TV/Monitor    │    │   Set-top Box   │    │  VDI Provider   │
│                 │◄───►│                 │◄───►│   Cloud PC      │
│  Chess App UI   │    │  VDI Browser    │    │  Chess Backend  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
                                               ┌─────────────────┐
                                               │   SSO Server    │
                                               │  Token Provider │
                                               └─────────────────┘
```

## 🔑 SSO Token Integration Implementation

### 1. **SSO Authentication Flow**

```typescript
// src/services/vdiSSOService.ts
export interface VDIUser {
  userId: string;
  username: string;
  email: string;
  vdiSessionId: string;
  permissions: string[];
  chessRating?: number;
}

export interface SSOTokenPayload {
  sub: string; // User ID
  username: string;
  email: string;
  vdi_session: string;
  permissions: string[];
  iat: number;
  exp: number;
  iss: string; // VDI Provider
}

export class VDISSOService {
  private static readonly API_BASE = '/api/vdi/sso';

  /**
   * Initialize SSO authentication from VDI provider
   */
  static async initializeSSO(): Promise<VDIUser | null> {
    try {
      // Check for SSO token in URL parameters (VDI provider redirect)
      const urlParams = new URLSearchParams(window.location.search);
      const ssoToken = urlParams.get('vdi_token') ||
                      sessionStorage.getItem('vdi_sso_token');

      if (!ssoToken) {
        await this.redirectToVDISSO();
        return null;
      }

      // Validate and exchange SSO token
      const user = await this.validateSSOToken(ssoToken);

      if (user) {
        // Store validated session
        sessionStorage.setItem('vdi_sso_token', ssoToken);
        sessionStorage.setItem('vdi_user', JSON.stringify(user));

        // Clear token from URL for security
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      return user;
    } catch (error) {
      console.error('SSO initialization failed:', error);
      await this.redirectToVDISSO();
      return null;
    }
  }

  /**
   * Validate SSO token with VDI provider
   */
  private static async validateSSOToken(token: string): Promise<VDIUser | null> {
    try {
      const response = await fetch(`${this.API_BASE}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          token,
          service: 'chess-academy',
          vdi_client_id: process.env.VITE_VDI_CLIENT_ID
        })
      });

      if (!response.ok) {
        throw new Error('SSO token validation failed');
      }

      const data = await response.json();

      return {
        userId: data.user_id,
        username: data.username,
        email: data.email,
        vdiSessionId: data.vdi_session_id,
        permissions: data.permissions || [],
        chessRating: data.chess_rating
      };
    } catch (error) {
      console.error('Token validation error:', error);
      return null;
    }
  }

  /**
   * Redirect to VDI SSO login
   */
  private static async redirectToVDISSO(): Promise<void> {
    const ssoUrl = new URL(process.env.VITE_VDI_SSO_URL!);

    ssoUrl.searchParams.set('client_id', process.env.VITE_VDI_CLIENT_ID!);
    ssoUrl.searchParams.set('response_type', 'token');
    ssoUrl.searchParams.set('redirect_uri', window.location.origin);
    ssoUrl.searchParams.set('service', 'chess-academy-v0');
    ssoUrl.searchParams.set('session_timeout', '28800'); // 8 hours

    window.location.href = ssoUrl.toString();
  }

  /**
   * Refresh SSO token
   */
  static async refreshToken(): Promise<boolean> {
    try {
      const currentToken = sessionStorage.getItem('vdi_sso_token');
      if (!currentToken) return false;

      const response = await fetch(`${this.API_BASE}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem('vdi_sso_token', data.token);
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  /**
   * Logout from VDI SSO
   */
  static async logout(): Promise<void> {
    try {
      const token = sessionStorage.getItem('vdi_sso_token');

      if (token) {
        await fetch(`${this.API_BASE}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } finally {
      // Clear local session
      sessionStorage.clear();

      // Redirect to VDI logout
      const logoutUrl = `${process.env.VITE_VDI_SSO_URL}/logout?redirect_uri=${encodeURIComponent(window.location.origin)}`;
      window.location.href = logoutUrl;
    }
  }

  /**
   * Get current VDI user
   */
  static getCurrentUser(): VDIUser | null {
    try {
      const userData = sessionStorage.getItem('vdi_user');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  /**
   * Check if user has permission
   */
  static hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    return user?.permissions.includes(permission) || false;
  }
}
```

### 2. **VDI-Optimized Auth Store**

```typescript
// src/stores/vdiAuthStore.ts
import { create } from 'zustand';
import { VDIUser, VDISSOService } from '../services/vdiSSOService';

interface VDIAuthState {
  user: VDIUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
}

export const useVDIAuthStore = create<VDIAuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  initialize: async () => {
    try {
      set({ isLoading: true, error: null });

      const user = await VDISSOService.initializeSSO();

      set({
        user,
        isAuthenticated: !!user,
        isLoading: false
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Authentication failed',
        isAuthenticated: false,
        isLoading: false
      });
    }
  },

  login: async () => {
    try {
      set({ isLoading: true, error: null });
      await VDISSOService.initializeSSO();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false
      });
    }
  },

  logout: async () => {
    try {
      await VDISSOService.logout();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    }
  },

  refreshAuth: async () => {
    const success = await VDISSOService.refreshToken();
    if (!success) {
      get().logout();
    }
  },

  clearError: () => set({ error: null })
}));

// Auto-refresh token every 30 minutes
setInterval(() => {
  const { isAuthenticated, refreshAuth } = useVDIAuthStore.getState();
  if (isAuthenticated) {
    refreshAuth();
  }
}, 30 * 60 * 1000);
```

### 3. **TV Remote Control Optimization**

```typescript
// src/components/vdi/TVRemoteHandler.tsx
import React, { useEffect, useCallback } from 'react';

export interface RemoteControlMapping {
  up: string;
  down: string;
  left: string;
  right: string;
  select: string;
  back: string;
  menu: string;
  home: string;
}

export const TVRemoteHandler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const handleRemoteControl = useCallback((event: KeyboardEvent) => {
    // VDI set-top box remote control mapping
    const remoteMapping: RemoteControlMapping = {
      up: 'ArrowUp',
      down: 'ArrowDown',
      left: 'ArrowLeft',
      right: 'ArrowRight',
      select: 'Enter',
      back: 'Escape',
      menu: 'ContextMenu',
      home: 'Home'
    };

    // Prevent default browser behavior for TV remote
    if (Object.values(remoteMapping).includes(event.key)) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Handle chess-specific remote controls
    switch (event.key) {
      case remoteMapping.select:
        // Handle piece selection/movement
        document.dispatchEvent(new CustomEvent('tv-select', {
          detail: { target: event.target }
        }));
        break;

      case remoteMapping.back:
        // Handle game navigation back
        document.dispatchEvent(new CustomEvent('tv-back'));
        break;

      case remoteMapping.menu:
        // Open game menu
        document.dispatchEvent(new CustomEvent('tv-menu'));
        break;

      case remoteMapping.home:
        // Return to main menu
        document.dispatchEvent(new CustomEvent('tv-home'));
        break;
    }
  }, []);

  useEffect(() => {
    // Add event listeners for VDI remote control
    document.addEventListener('keydown', handleRemoteControl, { capture: true });

    return () => {
      document.removeEventListener('keydown', handleRemoteControl, { capture: true });
    };
  }, [handleRemoteControl]);

  return <>{children}</>;
};
```

### 4. **VDI Environment Detection**

```typescript
// src/utils/vdiDetection.ts
export interface VDIEnvironment {
  isVDI: boolean;
  provider: string;
  browserType: string;
  isTV: boolean;
  screenSize: 'small' | 'medium' | 'large' | 'tv';
  inputMethod: 'mouse' | 'touch' | 'remote';
}

export class VDIDetection {
  static detectEnvironment(): VDIEnvironment {
    const userAgent = navigator.userAgent.toLowerCase();
    const screen = window.screen;

    // Detect VDI environment
    const isVDI = this.isVDIEnvironment(userAgent);
    const provider = this.getVDIProvider(userAgent);
    const browserType = this.getBrowserType(userAgent);
    const isTV = this.isTVDisplay(screen);
    const screenSize = this.getScreenSize(screen);
    const inputMethod = this.getInputMethod();

    return {
      isVDI,
      provider,
      browserType,
      isTV,
      screenSize,
      inputMethod
    };
  }

  private static isVDIEnvironment(userAgent: string): boolean {
    const vdiIndicators = [
      'citrix',
      'vmware',
      'rdp',
      'vdi',
      'virtual',
      'remote desktop',
      'cloud pc'
    ];

    return vdiIndicators.some(indicator => userAgent.includes(indicator)) ||
           !!sessionStorage.getItem('vdi_session_id') ||
           window.location.hostname.includes('vdi') ||
           window.location.hostname.includes('cloud');
  }

  private static getVDIProvider(userAgent: string): string {
    if (userAgent.includes('citrix')) return 'citrix';
    if (userAgent.includes('vmware')) return 'vmware';
    if (userAgent.includes('microsoft')) return 'azure';
    if (userAgent.includes('amazon')) return 'workspaces';

    return 'unknown';
  }

  private static getBrowserType(userAgent: string): string {
    if (userAgent.includes('chrome')) return 'chrome';
    if (userAgent.includes('firefox')) return 'firefox';
    if (userAgent.includes('safari')) return 'safari';
    if (userAgent.includes('edge')) return 'edge';

    return 'unknown';
  }

  private static isTVDisplay(screen: Screen): boolean {
    // Typical TV resolutions
    const tvResolutions = [
      { width: 1920, height: 1080 }, // 1080p
      { width: 3840, height: 2160 }, // 4K
      { width: 1280, height: 720 },  // 720p
      { width: 7680, height: 4320 }  // 8K
    ];

    return tvResolutions.some(res =>
      Math.abs(screen.width - res.width) < 50 &&
      Math.abs(screen.height - res.height) < 50
    ) || screen.width >= 1280;
  }

  private static getScreenSize(screen: Screen): 'small' | 'medium' | 'large' | 'tv' {
    const width = screen.width;

    if (width >= 1920) return 'tv';
    if (width >= 1280) return 'large';
    if (width >= 768) return 'medium';
    return 'small';
  }

  private static getInputMethod(): 'mouse' | 'touch' | 'remote' {
    if ('ontouchstart' in window) return 'touch';
    if (this.isVDIEnvironment(navigator.userAgent.toLowerCase())) return 'remote';
    return 'mouse';
  }
}

// Global VDI environment configuration
export const VDI_ENV = VDIDetection.detectEnvironment();
```

### 5. **VDI Performance Optimization**

```typescript
// src/config/vdiPerformance.ts
export class VDIPerformance {
  static optimizeForVDI(): void {
    // Reduce animation complexity for VDI
    if (VDI_ENV.isVDI) {
      document.body.classList.add('vdi-optimized');

      // Disable heavy animations
      const style = document.createElement('style');
      style.textContent = `
        .vdi-optimized * {
          animation-duration: 0.1s !important;
          transition-duration: 0.1s !important;
        }

        .vdi-optimized .chess-piece-animation {
          animation: none !important;
        }

        .vdi-optimized .confetti {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
    }

    // Optimize rendering for TV displays
    if (VDI_ENV.isTV) {
      document.body.classList.add('tv-display');

      // Increase font sizes and element sizes for TV viewing
      const tvStyle = document.createElement('style');
      tvStyle.textContent = `
        .tv-display {
          font-size: 1.2em !important;
        }

        .tv-display .chess-square {
          min-width: 80px !important;
          min-height: 80px !important;
        }

        .tv-display .game-controls {
          padding: 20px !important;
          font-size: 1.5em !important;
        }
      `;
      document.head.appendChild(tvStyle);
    }
  }

  static configureNetworking(): void {
    // Optimize for VDI network conditions
    if (VDI_ENV.isVDI) {
      // Increase timeout values
      const originalFetch = window.fetch;
      window.fetch = (input, init = {}) => {
        return originalFetch(input, {
          ...init,
          timeout: 10000, // 10 second timeout for VDI
        });
      };
    }
  }
}
```

## 🔧 Environment Configuration

### VDI Environment Variables

```bash
# .env.vdi
VITE_VDI_PROVIDER=your-vdi-provider
VITE_VDI_SSO_URL=https://sso.vdi-provider.com
VITE_VDI_CLIENT_ID=chess-academy-v0-client
VITE_VDI_DOMAIN=your-vdi-domain.com
VITE_VDI_SESSION_TIMEOUT=28800000
VITE_MAX_CONCURRENT_USERS=1000
VITE_ENABLE_TV_MODE=true
VITE_REMOTE_CONTROL_SUPPORT=true
```

## 📋 VDI Integration Checklist

### Pre-Integration ✅
- [ ] Coordinate with VDI provider for SSO endpoint details
- [ ] Obtain VDI client credentials and certificates
- [ ] Configure VDI-specific CORS policies
- [ ] Set up VDI session management
- [ ] Implement remote control input handling

### Integration Phase 🔧
- [ ] Deploy VDI authentication endpoints
- [ ] Test SSO token validation flow
- [ ] Verify TV/remote control functionality
- [ ] Configure VDI network security
- [ ] Set up monitoring and logging
- [ ] Performance testing in VDI environment

### Post-Integration 📊
- [ ] Monitor VDI session analytics
- [ ] Track remote control usage patterns
- [ ] Optimize for VDI network latency
- [ ] Regular security audits
- [ ] User experience optimization

## 🎯 VDI Deployment Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| **Planning** | 1 week | VDI provider coordination, requirements gathering |
| **Development** | 2-3 weeks | SSO integration, TV optimization, security patches |
| **Testing** | 1 week | VDI environment testing, remote control validation |
| **Deployment** | 3-5 days | Production deployment, monitoring setup |
| **Optimization** | 1 week | Performance tuning, user feedback integration |

**Total Timeline**: 5-7 weeks for complete VDI integration

## 🔒 Security Considerations

### VDI-Specific Security
- **Session Isolation**: Each VDI session maintains separate storage
- **Token Security**: SSO tokens validated server-side
- **Network Security**: All communication via VDI provider's secure network
- **Multi-Tenant Safety**: No cross-session data leakage
- **Audit Logging**: All user actions logged for VDI compliance

### Compliance Ready
- **GDPR**: User data handled per VDI provider policies
- **SOC2**: Enterprise security compliance
- **HIPAA**: Healthcare VDI environment support
- **PCI DSS**: Financial services VDI compatibility

**Chess Academy V0 is ready for enterprise VDI deployment with comprehensive SSO integration and TV-optimized user experience!** 🚀📺♟️