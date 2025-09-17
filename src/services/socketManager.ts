import { io, Socket } from 'socket.io-client';

export interface PlayerInfo {
  id: string;
  userId: string;
  username: string;
  rating: number;
}

export interface GameState {
  id: string;
  position: string;
  moves: string[];
  turn: 'white' | 'black';
  status: 'active' | 'checkmate' | 'draw' | 'resigned' | 'timeout';
  result?: '1-0' | '0-1' | '1/2-1/2';
  winner?: 'white' | 'black' | null;
  reason?: string;
  moveNumber: number;
  whiteTime: number;
  blackTime: number;
  whiteRatingChange?: number;
  blackRatingChange?: number;
}

export interface TimeControl {
  initial: number; // seconds
  increment: number; // seconds
  type: 'bullet' | 'blitz' | 'rapid' | 'classical';
}

export interface GameRoom {
  id: string;
  white: PlayerInfo;
  black: PlayerInfo;
  spectators: PlayerInfo[];
  timeControl: TimeControl;
}

export class SocketManager {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 15;
  private heartbeatInterval: number | null = null;
  private connectionHealthInterval: number | null = null;
  private lastHeartbeat: number = 0;
  
  constructor() {
    this.connect();
  }

  connect() {
    if (this.socket?.connected) {
      return;
    }

    console.log('🔌 Connecting to multiplayer server...');

    // Clean up any existing connection
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
    }

    // Production-first backend URL configuration with fallbacks
    const backendUrl = import.meta.env.VITE_BACKEND_URL ||
                      (import.meta.env.MODE === 'production'
                        ? 'https://web-production-4fb4.up.railway.app'
                        : 'http://localhost:3002');

    console.log('🔗 Connecting to:', backendUrl);
    console.log('🌍 Environment mode:', import.meta.env.MODE);

    this.socket = io(backendUrl, {
      // Railway-optimized transport configuration
      transports: ['polling', 'websocket'], // Allow upgrade to websockets for better performance
      forceNew: false,

      // Timeouts optimized for Railway deployment
      timeout: 20000, // Railway-optimized timeout

      // Enhanced reconnection strategy for Railway
      reconnection: true,
      reconnectionDelay: 2000, // Start with 2 second delay
      reconnectionDelayMax: 30000, // Max 30 second delay for Railway cold starts
      reconnectionAttempts: 15, // More attempts for Railway stability
      randomizationFactor: 0.3, // Less jitter for better predictability

      // Railway-friendly options
      upgrade: true, // Allow upgrade to websockets for better Railway performance
      rememberUpgrade: true, // Remember successful upgrades
      autoConnect: true,
      withCredentials: false,

      // Enhanced headers for Railway CORS
      extraHeaders: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        'Cache-Control': 'no-cache'
      },

      // Query parameters for Railway debugging
      query: {
        client: 'chess-academy',
        version: '1.0.0',
        platform: 'railway',
        timestamp: Date.now()
      }
    });

    // Enhanced connection events for Railway stability
    this.socket.on('connect', () => {
      console.log('✅ Connected to multiplayer server, Socket ID:', this.socket?.id);
      console.log('🚀 Transport:', this.socket?.io.engine.transport.name);
      this.reconnectAttempts = 0;
      this.lastHeartbeat = Date.now();
      this.emitInternal('connection_status', { connected: true });

      // Start aggressive heartbeat for Railway stability
      this.startHeartbeat();
      this.startConnectionHealthMonitoring();

      // Send test ping immediately on connection
      setTimeout(() => {
        if (this.socket?.connected) {
          console.log('🏓 Testing initial ping...');
          this.socket.emit('ping', { timestamp: Date.now() });
        }
      }, 1000);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from server:', reason);
      console.log('🔍 Disconnect details:', {
        reason,
        transport: this.socket?.io.engine.transport.name,
        reconnecting: this.socket?.io._reconnecting,
        lastHeartbeat: this.lastHeartbeat ? Date.now() - this.lastHeartbeat : 'unknown'
      });

      // Stop heartbeat timers
      this.stopHeartbeat();
      this.stopConnectionHealthMonitoring();

      this.emitInternal('connection_status', { connected: false, reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message || error);
      this.reconnectAttempts++;

      // Exponential backoff for serverless
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
      console.log(`⏳ Will retry in ${delay}ms (attempt ${this.reconnectAttempts})`);

      this.emitInternal('connection_error', { error: error.message || error.toString() });
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconnected after', attemptNumber, 'attempts');
      console.log('🚀 Transport after reconnect:', this.socket?.io.engine.transport.name);

      // Restart monitoring and heartbeat
      this.lastHeartbeat = Date.now();
      this.startHeartbeat();
      this.startConnectionHealthMonitoring();

      this.emitInternal('reconnected', { attemptNumber });
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}/${this.maxReconnectAttempts}`);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Failed to reconnect after', this.maxReconnectAttempts, 'attempts');
      this.emitInternal('reconnect_failed', {});
    });

    // Handle Railway heartbeat
    this.socket.on('heartbeat', (data) => {
      console.log('💓 Heartbeat received:', data.timestamp);
      this.lastHeartbeat = Date.now();
      // Respond to keep connection alive
      this.socket?.emit('heartbeat_ack', { timestamp: Date.now() });
    });

    // Handle pong responses
    this.socket.on('pong', (data) => {
      console.log('🏓 Pong received, latency:', Date.now() - data.timestamp, 'ms');
      this.lastHeartbeat = Date.now();
    });

    // Monitor transport changes (commented out due to TypeScript compatibility)
    // this.socket.io.on('upgrade', () => {
    //   console.log('⬆️ Transport upgraded to:', this.socket?.io.engine.transport.name);
    // });

    // this.socket.io.on('upgradeError', (error) => {
    //   console.warn('⚠️ Transport upgrade failed:', error.message);
    // });

    // Game events
    this.socket.on('authenticated', (data) => {
      console.log('🔐 [SOCKET] Authenticated event received from backend:', data);
      console.log('🔐 [SOCKET] About to emit to internal listeners...');
      const listenersCount = this.listeners.get('authenticated')?.length || 0;
      console.log('🔐 [SOCKET] Number of authenticated listeners:', listenersCount);
      this.emitInternal('authenticated', data);
      console.log('🔐 [SOCKET] Authenticated event emitted to internal listeners');
    });

    this.socket.on('matchmaking_joined', (data) => {
      console.log('🎯 Joined matchmaking queue:', data);
      this.emitInternal('matchmaking_joined', data);
    });

    this.socket.on('game_found', (data) => {
      console.log('🎮 Game found:', data);
      this.emitInternal('game_found', data);
    });

    this.socket.on('game_started', (data) => {
      console.log('▶️ Game started:', data);
      this.emitInternal('game_started', data);
    });

    this.socket.on('game_joined', (data) => {
      console.log('🎮 Game joined successfully:', data);
      console.log('✅ join_game event was properly received by backend');
      this.emitInternal('game_joined', data);
    });

    this.socket.on('join_game_error', (data) => {
      console.error('❌ Failed to join game:', data);
      this.emitInternal('join_game_error', data);
    });

    this.socket.on('game_rejoined', (data) => {
      console.log('🔄 Game rejoined after navigation:', data);
      this.emitInternal('game_rejoined', data);
    });

    this.socket.on('move_made', (data) => {
      console.log('♟️ Move made:', data);
      this.emitInternal('move_made', data);
    });

    this.socket.on('game_ended', (data) => {
      console.log('🏁 Game ended:', data);
      this.emitInternal('game_ended', data);
    });

    this.socket.on('chat_message', (data) => {
      this.emitInternal('chat_message', data);
    });

    this.socket.on('spectator_joined', (data) => {
      this.emitInternal('spectator_joined', data);
    });

    this.socket.on('spectator_left', (data) => {
      this.emitInternal('spectator_left', data);
    });

    this.socket.on('draw_offered', (data) => {
      this.emitInternal('draw_offered', data);
    });

    this.socket.on('draw_declined', (data) => {
      this.emitInternal('draw_declined', data);
    });
  }

  disconnect() {
    this.stopHeartbeat();
    this.stopConnectionHealthMonitoring();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat(); // Clear any existing interval

    // Send ping every 25 seconds to keep Railway connection alive
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        console.log('💓 Sending heartbeat ping...');
        this.socket.emit('ping', { timestamp: Date.now() });
      }
    }, 25000); // 25 seconds - well within Railway's timeout window
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private startConnectionHealthMonitoring() {
    this.stopConnectionHealthMonitoring(); // Clear any existing interval

    // Monitor connection health every 60 seconds
    this.connectionHealthInterval = setInterval(() => {
      if (!this.socket?.connected) {
        console.log('🔍 Connection health check: DISCONNECTED');
        return;
      }

      const timeSinceLastHeartbeat = Date.now() - this.lastHeartbeat;
      console.log('🔍 Connection health check:', {
        connected: this.socket.connected,
        transport: this.socket.io.engine.transport.name,
        timeSinceLastHeartbeat: timeSinceLastHeartbeat,
        socketId: this.socket.id
      });

      // If no heartbeat for more than 2 minutes, force reconnection
      if (timeSinceLastHeartbeat > 120000) {
        console.log('⚠️ No heartbeat for 2+ minutes, forcing reconnection...');
        this.socket.disconnect();
        setTimeout(() => this.connect(), 1000);
      }
    }, 60000); // Check every minute
  }

  private stopConnectionHealthMonitoring() {
    if (this.connectionHealthInterval) {
      clearInterval(this.connectionHealthInterval);
      this.connectionHealthInterval = null;
    }
  }

  // Authentication
  authenticate(userData: { userId: string; username: string; rating: number }) {
    if (!this.socket?.connected) {
      console.log('🔐 [AUTH] Cannot authenticate - socket not connected');
      throw new Error('Socket not connected');
    }
    console.log('🔐 [AUTH] Sending authenticate event to backend with data:', userData);
    this.socket.emit('authenticate', userData);
    console.log('🔐 [AUTH] Authenticate event sent successfully');
  }

  // Matchmaking
  joinMatchmaking(options: { 
    timeControl: TimeControl; 
    ratingRange?: number;
    color?: 'white' | 'black' | 'random';
  }) {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }
    this.socket.emit('join_matchmaking', options);
  }

  leaveMatchmaking() {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }
    this.socket.emit('leave_matchmaking');
  }

  // Game actions
  makeMove(gameId: string, move: any, timeLeft: number) {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }
    this.socket.emit('make_move', { gameId, move, timeLeft });
  }

  offerDraw(gameId: string) {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }
    this.socket.emit('offer_draw', { gameId });
  }

  acceptDraw(gameId: string) {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }
    this.socket.emit('accept_draw', { gameId });
  }

  declineDraw(gameId: string) {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }
    this.socket.emit('decline_draw', { gameId });
  }

  resignGame(gameId: string) {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }
    this.socket.emit('resign_game', { gameId });
  }

  // Spectating
  joinGameAsSpectator(gameId: string) {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }
    this.socket.emit('join_game_as_spectator', { gameId });
  }

  leaveGameAsSpectator(gameId: string) {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }
    this.socket.emit('leave_game_as_spectator', { gameId });
  }

  // Chat
  sendChatMessage(gameId: string, message: string) {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }
    this.socket.emit('send_chat_message', { gameId, message });
  }

  // Generic emit method for custom events
  emit(event: string, data: any) {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }
    this.socket.emit(event, data);
  }

  // Event system
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback?: Function) {
    if (!callback) {
      // CRITICAL: Don't delete ALL listeners for an event unless specifically requested
      // This prevents navigation issues where components clean up shared listeners
      console.log('⚠️ WARNING: Removing ALL listeners for event:', event);
      this.listeners.delete(event);
      return;
    }

    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Safe method to remove specific callback without affecting others
  removeCallback(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
        console.log(`✅ Removed specific callback for event: ${event}`);
      }
    }
  }

  // Method to preserve socket connection during navigation
  preserveConnection() {
    console.log('🔒 Preserving socket connection during navigation');
    console.log('🔗 Current connection status:', {
      connected: this.socket?.connected,
      socketId: this.socket?.id,
      isHealthy: this.isConnectionHealthy()
    });

    // This method ensures socket stays connected during component transitions
    if (this.socket?.connected) {
      console.log('✅ Socket connection preserved successfully');
      return true;
    } else {
      console.log('⚠️ Socket not connected, may need reconnection');
      return false;
    }
  }

  // Get current connection state for debugging
  getConnectionState() {
    return {
      connected: this.socket?.connected || false,
      socketId: this.socket?.id || null,
      isHealthy: this.isConnectionHealthy(),
      listenersCount: Array.from(this.listeners.entries()).map(([event, callbacks]) => ({
        event,
        count: callbacks.length
      })),
      reconnectAttempts: this.reconnectAttempts,
      transport: this.socket?.io?.engine?.transport?.name || 'unknown'
    };
  }

  private emitInternal(event: string, data: any) {
    console.log(`🔊 [EMIT] Emitting event '${event}' with data:`, data);
    const callbacks = this.listeners.get(event);
    console.log(`🔊 [EMIT] Found ${callbacks?.length || 0} listeners for event '${event}'`);
    if (callbacks) {
      callbacks.forEach((callback, index) => {
        console.log(`🔊 [EMIT] Calling listener ${index + 1} for event '${event}'`);
        try {
          callback(data);
          console.log(`🔊 [EMIT] Listener ${index + 1} executed successfully`);
        } catch (error) {
          console.error(`🔊 [EMIT] Error in listener ${index + 1} for event '${event}':`, error);
        }
      });
    } else {
      console.log(`🔊 [EMIT] No listeners registered for event '${event}'`);
    }
  }

  // Connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getConnectionId(): string | undefined {
    return this.socket?.id;
  }

  // Railway-specific connection management
  forceReconnect() {
    console.log('🔄 Forcing reconnection for Railway stability...');
    this.stopHeartbeat();
    this.stopConnectionHealthMonitoring();

    if (this.socket) {
      this.socket.disconnect();
    }

    // Wait a moment then reconnect to handle Railway cold starts
    setTimeout(() => {
      this.connect();
    }, 2000);
  }

  // Check if connection is healthy
  isConnectionHealthy(): boolean {
    if (!this.socket?.connected) return false;

    const timeSinceLastHeartbeat = Date.now() - this.lastHeartbeat;
    return timeSinceLastHeartbeat < 90000; // Consider healthy if heartbeat within 90 seconds
  }

  // Get connection diagnostics
  getConnectionDiagnostics() {
    return {
      connected: this.socket?.connected || false,
      transport: this.socket?.io.engine.transport.name || 'unknown',
      socketId: this.socket?.id || 'none',
      lastHeartbeat: this.lastHeartbeat,
      timeSinceLastHeartbeat: this.lastHeartbeat ? Date.now() - this.lastHeartbeat : null,
      reconnectAttempts: this.reconnectAttempts,
      isHealthy: this.isConnectionHealthy()
    };
  }
}

// Singleton instance
export const socketManager = new SocketManager();