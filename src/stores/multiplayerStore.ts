import { create } from 'zustand';
import { socketManager, GameState, PlayerInfo, TimeControl, GameRoom } from '../services/socketManager';

export interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
  type: 'chat' | 'system' | 'draw_offer' | 'resignation';
}

export interface MatchmakingState {
  isSearching: boolean;
  timeControl: TimeControl | null;
  estimatedWaitTime: number;
  queuePosition: number;
  searchStartTime: Date | null;
}

export interface CurrentGame {
  gameState: GameState | null;
  gameRoom: GameRoom | null;
  playerColor: 'white' | 'black' | null;
  isSpectating: boolean;
  chatMessages: ChatMessage[];
  drawOfferedBy: 'white' | 'black' | null;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
}

interface MultiplayerStore {
  // Connection state
  isConnected: boolean;
  isAuthenticated: boolean;
  playerInfo: PlayerInfo | null;
  connectionError: string | null;

  // Matchmaking state  
  matchmaking: MatchmakingState;
  
  // Current game state
  currentGame: CurrentGame;
  
  // Live games list
  liveGames: GameRoom[];
  
  // Actions
  setConnectionStatus: (connected: boolean, error?: string) => void;
  setAuthenticated: (authenticated: boolean, playerInfo?: PlayerInfo) => void;
  startMatchmaking: (timeControl: TimeControl, ratingRange?: number) => void;
  stopMatchmaking: () => void;
  setMatchmakingStatus: (status: Partial<MatchmakingState>) => void;
  startGame: (gameState: GameState, gameRoom: GameRoom, playerColor: 'white' | 'black') => void;
  updateGameState: (gameState: GameState) => void;
  endGame: (result: any) => void;
  addChatMessage: (message: ChatMessage) => void;
  setDrawOffer: (offeredBy: 'white' | 'black' | null) => void;
  joinAsSpectator: (gameRoom: GameRoom) => void;
  leaveSpectator: () => void;
  updateLiveGames: (games: GameRoom[]) => void;
  reset: () => void;
}

const initialMatchmakingState: MatchmakingState = {
  isSearching: false,
  timeControl: null,
  estimatedWaitTime: 0,
  queuePosition: 0,
  searchStartTime: null,
};

const initialCurrentGame: CurrentGame = {
  gameState: null,
  gameRoom: null,
  playerColor: null,
  isSpectating: false,
  chatMessages: [],
  drawOfferedBy: null,
  connectionStatus: 'disconnected',
};

export const useMultiplayerStore = create<MultiplayerStore>((set, get) => ({
  // Initial state
  isConnected: false,
  isAuthenticated: false,
  playerInfo: null,
  connectionError: null,
  matchmaking: initialMatchmakingState,
  currentGame: initialCurrentGame,
  liveGames: [],

  // Actions
  setConnectionStatus: (connected: boolean, error?: string) => {
    set({ 
      isConnected: connected, 
      connectionError: error || null,
      currentGame: {
        ...get().currentGame,
        connectionStatus: connected ? 'connected' : 'disconnected'
      }
    });
  },

  setAuthenticated: (authenticated: boolean, playerInfo?: PlayerInfo) => {
    set({ isAuthenticated: authenticated, playerInfo: playerInfo || null });
  },

  startMatchmaking: (timeControl: TimeControl, ratingRange?: number) => {
    try {
      socketManager.joinMatchmaking({ timeControl, ratingRange });
      set({
        matchmaking: {
          isSearching: true,
          timeControl,
          estimatedWaitTime: 0,
          queuePosition: 0,
          searchStartTime: new Date(),
        }
      });
    } catch (error) {
      console.error('Failed to start matchmaking:', error);
      set({ connectionError: 'Failed to start matchmaking' });
    }
  },

  stopMatchmaking: () => {
    try {
      socketManager.leaveMatchmaking();
      set({ matchmaking: initialMatchmakingState });
    } catch (error) {
      console.error('Failed to stop matchmaking:', error);
    }
  },

  setMatchmakingStatus: (status: Partial<MatchmakingState>) => {
    set({
      matchmaking: {
        ...get().matchmaking,
        ...status,
      }
    });
  },

  startGame: (gameState: GameState, gameRoom: GameRoom, playerColor: 'white' | 'black') => {
    set({
      matchmaking: initialMatchmakingState,
      currentGame: {
        gameState,
        gameRoom,
        playerColor,
        isSpectating: false,
        chatMessages: [{
          id: 'game-start',
          username: 'System',
          message: `Game started! You are playing as ${playerColor}.`,
          timestamp: new Date(),
          type: 'system',
        }],
        drawOfferedBy: null,
        connectionStatus: get().isConnected ? 'connected' : 'disconnected',
      }
    });
  },

  updateGameState: (gameState: GameState) => {
    set({
      currentGame: {
        ...get().currentGame,
        gameState,
      }
    });
  },

  endGame: (result: any) => {
    const { currentGame } = get();
    const endMessage: ChatMessage = {
      id: 'game-end-' + Date.now(),
      username: 'System',
      message: `Game ended: ${result.result} - ${result.reason}. Rating change: ${result.ratingChanges?.[get().playerInfo?.userId || ''] || 0}`,
      timestamp: new Date(),
      type: 'system',
    };

    set({
      currentGame: {
        ...currentGame,
        chatMessages: [...currentGame.chatMessages, endMessage],
      }
    });
  },

  addChatMessage: (message: ChatMessage) => {
    set({
      currentGame: {
        ...get().currentGame,
        chatMessages: [...get().currentGame.chatMessages, message],
      }
    });
  },

  setDrawOffer: (offeredBy: 'white' | 'black' | null) => {
    set({
      currentGame: {
        ...get().currentGame,
        drawOfferedBy: offeredBy,
      }
    });

    if (offeredBy) {
      const message: ChatMessage = {
        id: 'draw-offer-' + Date.now(),
        username: 'System',
        message: `${offeredBy} offered a draw`,
        timestamp: new Date(),
        type: 'draw_offer',
      };
      get().addChatMessage(message);
    }
  },

  joinAsSpectator: (gameRoom: GameRoom) => {
    set({
      currentGame: {
        gameState: null, // Will be updated when we receive game state
        gameRoom,
        playerColor: null,
        isSpectating: true,
        chatMessages: [{
          id: 'spectator-join',
          username: 'System',
          message: `Now spectating: ${gameRoom.white.username} vs ${gameRoom.black.username}`,
          timestamp: new Date(),
          type: 'system',
        }],
        drawOfferedBy: null,
        connectionStatus: get().isConnected ? 'connected' : 'disconnected',
      }
    });
  },

  leaveSpectator: () => {
    set({ currentGame: initialCurrentGame });
  },

  updateLiveGames: (games: GameRoom[]) => {
    set({ liveGames: games });
  },

  reset: () => {
    set({
      isConnected: false,
      isAuthenticated: false,
      playerInfo: null,
      connectionError: null,
      matchmaking: initialMatchmakingState,
      currentGame: initialCurrentGame,
      liveGames: [],
    });
  },
}));

// Socket event listeners
socketManager.on('connection_status', (data: { connected: boolean; reason?: string }) => {
  useMultiplayerStore.getState().setConnectionStatus(data.connected, data.reason);
});

socketManager.on('authenticated', (data: { success: boolean; playerInfo?: PlayerInfo }) => {
  if (data.success && data.playerInfo) {
    useMultiplayerStore.getState().setAuthenticated(true, data.playerInfo);
  }
});

socketManager.on('matchmaking_joined', (data: { estimatedWaitTime: number; queuePosition: number }) => {
  useMultiplayerStore.getState().setMatchmakingStatus({
    estimatedWaitTime: data.estimatedWaitTime,
    queuePosition: data.queuePosition,
  });
});

socketManager.on('game_found', (data: { gameId: string; opponent: PlayerInfo; color: 'white' | 'black'; timeControl: TimeControl }) => {
  const message: ChatMessage = {
    id: 'game-found',
    username: 'System',
    message: `Game found! Playing as ${data.color} against ${data.opponent.username} (${data.opponent.rating})`,
    timestamp: new Date(),
    type: 'system',
  };
  useMultiplayerStore.getState().addChatMessage(message);
});

socketManager.on('game_started', (data: { gameState: GameState; gameRoom: GameRoom; playerColor: 'white' | 'black' }) => {
  useMultiplayerStore.getState().startGame(data.gameState, data.gameRoom, data.playerColor);
});

socketManager.on('move_made', (data: { gameState: GameState; move: any; timeLeft: number }) => {
  useMultiplayerStore.getState().updateGameState(data.gameState);
});

socketManager.on('game_ended', (data: any) => {
  useMultiplayerStore.getState().endGame(data);
});

socketManager.on('chat_message', (data: { username: string; message: string; timestamp: string }) => {
  const message: ChatMessage = {
    id: 'chat-' + Date.now(),
    username: data.username,
    message: data.message,
    timestamp: new Date(data.timestamp),
    type: 'chat',
  };
  useMultiplayerStore.getState().addChatMessage(message);
});

socketManager.on('draw_offered', (data: { offeredBy: 'white' | 'black' }) => {
  useMultiplayerStore.getState().setDrawOffer(data.offeredBy);
});

socketManager.on('draw_declined', () => {
  useMultiplayerStore.getState().setDrawOffer(null);
});

socketManager.on('connection_error', (data: { error: string }) => {
  useMultiplayerStore.getState().setConnectionStatus(false, data.error);
});

socketManager.on('reconnected', () => {
  const { playerInfo } = useMultiplayerStore.getState();
  if (playerInfo) {
    // Re-authenticate after reconnection
    socketManager.authenticate(playerInfo);
  }
});