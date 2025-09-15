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
  private maxReconnectAttempts = 5;
  
  constructor() {
    this.connect();
  }

  connect() {
    if (this.socket?.connected) {
      return;
    }

    console.log('🔌 Connecting to multiplayer server...');

    // Production-first backend URL configuration with fallbacks
    const backendUrl = import.meta.env.VITE_BACKEND_URL ||
                      (import.meta.env.MODE === 'production'
                        ? 'https://web-production-4fb4.up.railway.app'
                        : 'http://localhost:3002');

    console.log('🔗 Connecting to:', backendUrl);
    console.log('🌍 Environment mode:', import.meta.env.MODE);

    this.socket = io(backendUrl, {
      // Serverless-optimized transport configuration
      transports: ['polling'], // Start with polling only for Vercel compatibility
      forceNew: false,

      // Timeouts optimized for serverless cold starts
      timeout: 45000, // Extended timeout for cold starts
      connectTimeout: 45000,

      // Reconnection strategy for serverless
      reconnection: true,
      reconnectionDelay: 1000, // Start with shorter delay
      reconnectionDelayMax: 10000, // Max 10 second delay
      reconnectionAttempts: 10, // More attempts for unstable serverless
      randomizationFactor: 0.5, // Add jitter to reconnection attempts

      // Serverless-friendly options
      upgrade: false, // Disable upgrade to websockets initially
      rememberUpgrade: false, // Don't remember transport upgrades
      autoConnect: true,
      withCredentials: false,

      // Additional headers for CORS
      extraHeaders: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With'
      },

      // Query parameters for debugging
      query: {
        client: 'chess-academy',
        version: '1.0.0',
        transport: 'polling-first'
      }
    });

    // Enhanced connection events for serverless
    this.socket.on('connect', () => {
      console.log('✅ Connected to multiplayer server, Socket ID:', this.socket?.id);
      console.log('🚀 Transport:', this.socket?.io.engine.transport.name);
      this.reconnectAttempts = 0;
      this.emit('connection_status', { connected: true });

      // Send test ping immediately on connection
      setTimeout(() => {
        if (this.socket?.connected) {
          console.log('🏓 Testing ping...');
          this.socket.emit('ping', { timestamp: Date.now() });
        }
      }, 1000);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from server:', reason);
      this.emit('connection_status', { connected: false, reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message || error);
      this.reconnectAttempts++;

      // Exponential backoff for serverless
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
      console.log(`⏳ Will retry in ${delay}ms (attempt ${this.reconnectAttempts})`);

      this.emit('connection_error', { error: error.message || error.toString() });
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconnected after', attemptNumber, 'attempts');
      console.log('🚀 Transport after reconnect:', this.socket?.io.engine.transport.name);
      this.emit('reconnected', { attemptNumber });
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}/${this.maxReconnectAttempts}`);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Failed to reconnect after', this.maxReconnectAttempts, 'attempts');
      this.emit('reconnect_failed', {});
    });

    // Handle serverless heartbeat
    this.socket.on('heartbeat', (data) => {
      console.log('💓 Heartbeat received:', data.timestamp);
      // Respond to keep connection alive
      this.socket?.emit('heartbeat_ack', { timestamp: Date.now() });
    });

    // Handle pong responses
    this.socket.on('pong', (data) => {
      console.log('🏓 Pong received:', data);
    });

    // Monitor transport changes
    this.socket.io.on('upgrade', () => {
      console.log('⬆️ Transport upgraded to:', this.socket?.io.engine.transport.name);
    });

    this.socket.io.on('upgradeError', (error) => {
      console.warn('⚠️ Transport upgrade failed:', error.message);
    });

    // Game events
    this.socket.on('authenticated', (data) => {
      console.log('🔐 Authenticated:', data);
      this.emit('authenticated', data);
    });

    this.socket.on('matchmaking_joined', (data) => {
      console.log('🎯 Joined matchmaking queue:', data);
      this.emit('matchmaking_joined', data);
    });

    this.socket.on('game_found', (data) => {
      console.log('🎮 Game found:', data);
      this.emit('game_found', data);
    });

    this.socket.on('game_started', (data) => {
      console.log('▶️ Game started:', data);
      this.emit('game_started', data);
    });

    this.socket.on('move_made', (data) => {
      console.log('♟️ Move made:', data);
      this.emit('move_made', data);
    });

    this.socket.on('game_ended', (data) => {
      console.log('🏁 Game ended:', data);
      this.emit('game_ended', data);
    });

    this.socket.on('chat_message', (data) => {
      this.emit('chat_message', data);
    });

    this.socket.on('spectator_joined', (data) => {
      this.emit('spectator_joined', data);
    });

    this.socket.on('spectator_left', (data) => {
      this.emit('spectator_left', data);
    });

    this.socket.on('draw_offered', (data) => {
      this.emit('draw_offered', data);
    });

    this.socket.on('draw_declined', (data) => {
      this.emit('draw_declined', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Authentication
  authenticate(userData: { userId: string; username: string; rating: number }) {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }
    this.socket.emit('authenticate', userData);
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

  // Event system
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback?: Function) {
    if (!callback) {
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

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getConnectionId(): string | undefined {
    return this.socket?.id;
  }
}

// Singleton instance
export const socketManager = new SocketManager();