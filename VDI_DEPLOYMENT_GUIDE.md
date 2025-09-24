# Chess Academy V0 - VDI Security Patches

## Critical Security Fixes for VDI Deployment

### 1. Route Protection Implementation

```typescript
// src/components/auth/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, token } = useAuthStore();

  // VDI SSO token validation
  if (!isAuthenticated || !token) {
    return <Navigate to="/sso-login" replace />;
  }

  return <>{children}</>;
};
```

### 2. WebSocket Authentication

```javascript
// server-complete.js - Add authentication middleware
const jwt = require('jsonwebtoken');

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    // Validate VDI SSO token
    const decoded = jwt.verify(token, process.env.VDI_SSO_SECRET);

    socket.userId = decoded.userId;
    socket.username = decoded.username;
    socket.vdiSession = decoded.vdiSessionId;

    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
});

// Rate limiting for VDI environments
const rateLimit = require('express-rate-limit');
const socketRateLimit = new Map();

const checkSocketRateLimit = (socket) => {
  const key = socket.vdiSession;
  const now = Date.now();
  const windowMs = 1000; // 1 second
  const maxRequests = 10;

  if (!socketRateLimit.has(key)) {
    socketRateLimit.set(key, { requests: 1, resetTime: now + windowMs });
    return true;
  }

  const limit = socketRateLimit.get(key);
  if (now > limit.resetTime) {
    limit.requests = 1;
    limit.resetTime = now + windowMs;
    return true;
  }

  if (limit.requests >= maxRequests) {
    return false;
  }

  limit.requests++;
  return true;
};
```

### 3. Secure Session Management

```typescript
// src/services/authService.ts - VDI-safe authentication
export class VDIAuthService {
  private static readonly TOKEN_KEY = 'chess-academy-vdi-session';

  static setToken(token: string, vdiSessionId: string): void {
    // Use sessionStorage for VDI isolation
    const sessionData = {
      token,
      vdiSessionId,
      timestamp: Date.now()
    };

    sessionStorage.setItem(this.TOKEN_KEY, JSON.stringify(sessionData));
  }

  static getToken(): string | null {
    try {
      const data = sessionStorage.getItem(this.TOKEN_KEY);
      if (!data) return null;

      const session = JSON.parse(data);

      // Check if session is expired (VDI session timeout)
      const maxAge = 8 * 60 * 60 * 1000; // 8 hours
      if (Date.now() - session.timestamp > maxAge) {
        this.clearToken();
        return null;
      }

      return session.token;
    } catch {
      return null;
    }
  }

  static clearToken(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
  }

  static async validateVDIToken(token: string): Promise<boolean> {
    try {
      const response = await fetch('/api/validate-vdi-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}
```

### 4. VDI Environment Configuration

```typescript
// src/config/vdiConfig.ts
export interface VDIConfig {
  providerDomain: string;
  ssoEndpoint: string;
  sessionTimeout: number;
  maxConcurrentGames: number;
}

export const getVDIConfig = (): VDIConfig => {
  return {
    providerDomain: process.env.VITE_VDI_DOMAIN || 'localhost',
    ssoEndpoint: process.env.VITE_VDI_SSO_ENDPOINT || '/sso/validate',
    sessionTimeout: 8 * 60 * 60 * 1000, // 8 hours
    maxConcurrentGames: parseInt(process.env.VITE_MAX_GAMES || '1000')
  };
};
```

### 5. TV/Set-Top Box Input Handling

```typescript
// src/components/chess/TVChessBoard.tsx - Remote control optimization
import React, { useEffect, useCallback } from 'react';

export const TVChessBoard: React.FC = () => {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [focusedSquare, setFocusedSquare] = useState<string>('e2');

  const handleRemoteInput = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp':
        // Move focus up on chess board
        moveFocus('up');
        break;
      case 'ArrowDown':
        // Move focus down on chess board
        moveFocus('down');
        break;
      case 'ArrowLeft':
        // Move focus left on chess board
        moveFocus('left');
        break;
      case 'ArrowRight':
        // Move focus right on chess board
        moveFocus('right');
        break;
      case 'Enter':
      case ' ':
        // Select/move piece
        handleSquareClick(focusedSquare);
        break;
      case 'Escape':
        // Cancel selection
        setSelectedSquare(null);
        break;
    }
  }, [focusedSquare]);

  useEffect(() => {
    // Add remote control event listeners for VDI environment
    document.addEventListener('keydown', handleRemoteInput);
    return () => document.removeEventListener('keydown', handleRemoteInput);
  }, [handleRemoteInput]);

  // ... rest of component
};
```

### 6. VDI-Specific Error Handling

```typescript
// src/services/vdiErrorHandler.ts
export class VDIErrorHandler {
  static handleVDIError(error: Error, context: string): void {
    const vdiError = {
      message: error.message,
      context,
      timestamp: new Date().toISOString(),
      vdiSession: sessionStorage.getItem('vdi-session-id'),
      userAgent: navigator.userAgent
    };

    // Log to VDI provider's logging system
    this.logToVDIProvider(vdiError);

    // Handle specific VDI errors
    if (error.message.includes('VDI_SESSION_EXPIRED')) {
      this.handleSessionExpired();
    } else if (error.message.includes('VDI_NETWORK_ERROR')) {
      this.handleNetworkError();
    }
  }

  private static handleSessionExpired(): void {
    // Clear local session data
    sessionStorage.clear();

    // Redirect to VDI SSO login
    window.location.href = '/sso/login';
  }

  private static handleNetworkError(): void {
    // Show VDI-appropriate error message
    console.error('VDI Network Error: Please check your connection');
  }

  private static async logToVDIProvider(error: any): Promise<void> {
    try {
      await fetch('/api/vdi/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(error)
      });
    } catch {
      console.error('Failed to log to VDI provider');
    }
  }
}
```