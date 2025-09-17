import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { Chess } from 'chess.js';
import cors from 'cors';

// In-memory storage (use Redis/MongoDB in production)
const activeGames = new Map(); // gameId -> gameState
const connectedPlayers = new Map(); // socketId -> playerInfo
const matchmakingQueue = [];
const authenticatedPlayers = new Map(); // socketId -> playerInfo

// Game state structure
class GameState {
  constructor(white, black, timeControl) {
    this.id = `game-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    this.white = white;
    this.black = black;
    this.timeControl = timeControl;
    this.chess = new Chess();
    this.position = this.chess.fen();
    this.moves = [];
    this.turn = 'w';
    this.status = 'active';
    this.moveNumber = 1;
    this.whiteTime = timeControl.initial * 1000; // Convert to milliseconds
    this.blackTime = timeControl.initial * 1000;
    this.lastMoveTime = Date.now();
    this.chatMessages = [];
    this.spectators = [];
  }

  makeMove(move, timeLeft) {
    try {
      const moveObj = this.chess.move(move);
      if (moveObj) {
        this.moves.push(moveObj);
        this.position = this.chess.fen();
        this.turn = this.chess.turn();
        this.moveNumber = this.chess.moveNumber();

        // Update time
        if (moveObj.color === 'w') {
          this.whiteTime = timeLeft;
          this.blackTime += this.timeControl.increment * 1000;
        } else {
          this.blackTime = timeLeft;
          this.whiteTime += this.timeControl.increment * 1000;
        }

        this.lastMoveTime = Date.now();

        // Check for game end
        if (this.chess.isGameOver()) {
          this.status = 'ended';
          if (this.chess.isCheckmate()) {
            this.result = this.chess.turn() === 'w' ? '0-1' : '1-0';
            this.winner = this.chess.turn() === 'w' ? 'black' : 'white';
            this.reason = 'checkmate';
          } else if (this.chess.isDraw()) {
            this.result = '1/2-1/2';
            this.winner = null;
            this.reason = 'draw';
          }
        }

        return {
          success: true,
          move: moveObj,
          position: this.position,
          turn: this.turn,
          moveNumber: this.moveNumber,
          whiteTime: this.whiteTime,
          blackTime: this.blackTime,
          gameResult: this.status === 'ended' ? {
            result: this.result,
            winner: this.winner,
            reason: this.reason
          } : null
        };
      }
      return { success: false, error: 'Invalid move' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  resign(playerColor) {
    this.status = 'ended';
    this.result = playerColor === 'white' ? '0-1' : '1-0';
    this.winner = playerColor === 'white' ? 'black' : 'white';
    this.reason = 'resignation';

    return {
      result: this.result,
      winner: this.winner,
      reason: this.reason
    };
  }

  getGameData(playerSocketId) {
    const isWhite = this.white.socketId === playerSocketId;
    const isBlack = this.black.socketId === playerSocketId;
    const playerColor = isWhite ? 'white' : isBlack ? 'black' : 'spectator';

    return {
      gameId: this.id,
      white: this.white,
      black: this.black,
      position: this.position,
      turn: this.turn,
      moveNumber: this.moveNumber,
      whiteTime: this.whiteTime,
      blackTime: this.blackTime,
      timeControl: this.timeControl,
      playerColor,
      status: this.status,
      moves: this.moves,
      lastMove: this.moves.length > 0 ? this.moves[this.moves.length - 1] : null
    };
  }
}

// Express app setup
const app = express();
const server = createServer(app);

// CORS configuration
app.use(cors({
  origin: ["https://elaborate-twilight-0dd8b0.netlify.app", "https://studyify.in", "http://localhost:5173", "http://localhost:3000"],
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'Chess Academy Backend Running',
    timestamp: new Date().toISOString(),
    activeGames: activeGames.size,
    connectedPlayers: connectedPlayers.size,
    matchmakingQueue: matchmakingQueue.length
  });
});

// Socket.IO setup
const io = new SocketIOServer(server, {
  cors: {
    origin: ["https://elaborate-twilight-0dd8b0.netlify.app", "https://studyify.in", "http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['polling', 'websocket'],
  allowEIO3: true
});

// Helper functions
function findOpponentInQueue(player) {
  for (let i = 0; i < matchmakingQueue.length; i++) {
    const opponent = matchmakingQueue[i];
    if (opponent.socketId !== player.socketId &&
        opponent.timeControl.type === player.timeControl.type &&
        opponent.timeControl.initial === player.timeControl.initial) {
      return { opponent, index: i };
    }
  }
  return null;
}

function createGame(player1, player2, timeControl) {
  // Randomly assign colors
  const isPlayer1White = Math.random() < 0.5;
  const white = isPlayer1White ? player1 : player2;
  const black = isPlayer1White ? player2 : player1;

  const gameState = new GameState(white, black, timeControl);
  activeGames.set(gameState.id, gameState);

  console.log('🎮 Created new game:', gameState.id);
  console.log('⚪ White player:', white.username);
  console.log('⚫ Black player:', black.username);

  return gameState;
}

function notifyGameStart(gameState, io) {
  const whiteSocket = io.sockets.sockets.get(gameState.white.socketId);
  const blackSocket = io.sockets.sockets.get(gameState.black.socketId);

  if (whiteSocket) {
    whiteSocket.emit('game_started', {
      gameId: gameState.id,
      color: 'white',
      opponent: {
        userId: gameState.black.userId,
        username: gameState.black.username,
        rating: gameState.black.rating,
        socketId: gameState.black.socketId,
        status: 'online'
      },
      timeControl: gameState.timeControl,
      position: gameState.position,
      whiteTime: gameState.whiteTime,
      blackTime: gameState.blackTime,
      turn: gameState.turn,
      moveNumber: gameState.moveNumber
    });
  }

  if (blackSocket) {
    blackSocket.emit('game_started', {
      gameId: gameState.id,
      color: 'black',
      opponent: {
        userId: gameState.white.userId,
        username: gameState.white.username,
        rating: gameState.white.rating,
        socketId: gameState.white.socketId,
        status: 'online'
      },
      timeControl: gameState.timeControl,
      position: gameState.position,
      whiteTime: gameState.whiteTime,
      blackTime: gameState.blackTime,
      turn: gameState.turn,
      moveNumber: gameState.moveNumber
    });
  }
}

function broadcastToGame(gameState, event, data, io, excludeSocketId = null) {
  const sockets = [gameState.white.socketId, gameState.black.socketId, ...gameState.spectators];

  sockets.forEach(socketId => {
    if (socketId !== excludeSocketId) {
      const socket = io.sockets.sockets.get(socketId);
      if (socket) {
        socket.emit(event, data);
      }
    }
  });
}

// Socket connection handling
io.on('connection', (socket) => {
  console.log('🔌 New connection:', socket.id);

  // Send connection confirmation
  socket.emit('connected', {
    socketId: socket.id,
    timestamp: Date.now()
  });

  // Authentication
  socket.on('authenticate', (data) => {
    console.log('🔐 Authentication request:', data);

    const playerInfo = {
      socketId: socket.id,
      userId: data.userId,
      username: data.username,
      rating: data.rating,
      status: 'online',
      authenticatedAt: Date.now()
    };

    authenticatedPlayers.set(socket.id, playerInfo);
    connectedPlayers.set(socket.id, playerInfo);

    socket.emit('authenticated', {
      success: true,
      playerInfo
    });

    console.log('✅ Player authenticated:', playerInfo.username);
  });

  // Matchmaking
  socket.on('join_matchmaking', (data) => {
    console.log('🎯 Join matchmaking:', data);

    const player = authenticatedPlayers.get(socket.id);
    if (!player) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }

    // Add to matchmaking queue
    const queueEntry = {
      ...player,
      timeControl: data.timeControl,
      joinedAt: Date.now()
    };

    // Check for existing opponent
    const match = findOpponentInQueue(queueEntry);

    if (match) {
      // Create game
      matchmakingQueue.splice(match.index, 1); // Remove opponent from queue

      const gameState = createGame(queueEntry, match.opponent, data.timeControl);

      // Notify both players
      notifyGameStart(gameState, io);

    } else {
      // Add to queue
      matchmakingQueue.push(queueEntry);
      socket.emit('matchmaking_joined', {
        message: 'Added to matchmaking queue',
        queueSize: matchmakingQueue.length
      });
    }
  });

  socket.on('leave_matchmaking', () => {
    const playerIndex = matchmakingQueue.findIndex(p => p.socketId === socket.id);
    if (playerIndex !== -1) {
      matchmakingQueue.splice(playerIndex, 1);
      console.log('🚪 Player left matchmaking queue');
    }
  });

  // Game actions
  socket.on('join_game', (data) => {
    console.log('🚪 Join game request:', data);

    const { gameId } = data;
    const gameState = activeGames.get(gameId);

    if (!gameState) {
      console.log('❌ Game not found:', gameId);
      socket.emit('error', { message: 'Game not found', gameId });
      return;
    }

    const player = authenticatedPlayers.get(socket.id);
    if (!player) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }

    // Check if player is part of this game
    const isPlayer = gameState.white.socketId === socket.id || gameState.black.socketId === socket.id;

    if (isPlayer) {
      // Player rejoining their game
      console.log('✅ Player rejoining game:', player.username);
      socket.emit('game_joined', gameState.getGameData(socket.id));
    } else {
      // Spectator joining
      console.log('👀 Spectator joining game:', player.username);
      gameState.spectators.push(socket.id);
      socket.emit('game_joined', {
        ...gameState.getGameData(socket.id),
        playerColor: 'spectator'
      });
    }
  });

  // Handle reconnection after navigation (frontend sends this event)
  socket.on('reconnect_to_game', (data) => {
    console.log('🔄 Reconnect to game request:', data);

    const { gameId } = data;
    const gameState = activeGames.get(gameId);

    if (!gameState) {
      console.log('❌ Game not found for reconnection:', gameId);
      socket.emit('error', { message: 'Game not found', gameId });
      return;
    }

    const player = authenticatedPlayers.get(socket.id);
    if (!player) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }

    // Check if player is part of this game
    const isPlayer = gameState.white.socketId === socket.id || gameState.black.socketId === socket.id;

    if (isPlayer) {
      // Player reconnecting to their game after navigation
      console.log('✅ Player reconnected to game after navigation:', player.username);
      socket.emit('game_rejoined', gameState.getGameData(socket.id));
    } else {
      // Spectator reconnecting
      console.log('👀 Spectator reconnected to game:', player.username);
      if (!gameState.spectators.includes(socket.id)) {
        gameState.spectators.push(socket.id);
      }
      socket.emit('game_rejoined', {
        ...gameState.getGameData(socket.id),
        playerColor: 'spectator'
      });
    }
  });

  socket.on('make_move', (data) => {
    console.log('♟️ Move attempt:', data);

    const { gameId, move, timeLeft } = data;
    const gameState = activeGames.get(gameId);

    if (!gameState) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    const player = authenticatedPlayers.get(socket.id);
    if (!player) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }

    // Validate it's the player's turn
    const isWhitePlayer = gameState.white.socketId === socket.id;
    const isBlackPlayer = gameState.black.socketId === socket.id;
    const currentTurn = gameState.chess.turn();

    if ((currentTurn === 'w' && !isWhitePlayer) || (currentTurn === 'b' && !isBlackPlayer)) {
      socket.emit('error', { message: 'Not your turn' });
      return;
    }

    // Make the move
    const result = gameState.makeMove(move, timeLeft);

    if (result.success) {
      console.log('✅ Move successful:', result.move);

      // Broadcast move to all players in the game
      const moveData = {
        gameId: gameState.id,
        position: result.position,
        turn: result.turn,
        moveNumber: result.moveNumber,
        whiteTime: result.whiteTime,
        blackTime: result.blackTime,
        lastMove: result.move,
        gameResult: result.gameResult
      };

      broadcastToGame(gameState, 'move_made', moveData, io);

      // If game ended, handle cleanup
      if (result.gameResult) {
        console.log('🏁 Game ended:', result.gameResult);
        broadcastToGame(gameState, 'game_ended', {
          gameId: gameState.id,
          result: result.gameResult
        }, io);
      }

    } else {
      console.log('❌ Invalid move:', result.error);
      socket.emit('error', { message: result.error });
    }
  });

  socket.on('resign', (data) => {
    console.log('🏳️ Resign request:', data);

    const { gameId } = data;
    const gameState = activeGames.get(gameId);

    if (!gameState) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    const isWhitePlayer = gameState.white.socketId === socket.id;
    const isBlackPlayer = gameState.black.socketId === socket.id;

    if (!isWhitePlayer && !isBlackPlayer) {
      socket.emit('error', { message: 'You are not a player in this game' });
      return;
    }

    const playerColor = isWhitePlayer ? 'white' : 'black';
    const result = gameState.resign(playerColor);

    console.log('✅ Player resigned:', playerColor);

    broadcastToGame(gameState, 'game_ended', {
      gameId: gameState.id,
      result
    }, io);
  });

  socket.on('chat_message', (data) => {
    console.log('💬 Chat message:', data);

    const { gameId, message } = data;
    const gameState = activeGames.get(gameId);

    if (!gameState) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    const player = authenticatedPlayers.get(socket.id);
    if (!player) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }

    // Add timestamp if not provided
    const chatMessage = {
      ...message,
      timestamp: message.timestamp || new Date().toISOString()
    };

    gameState.chatMessages.push(chatMessage);

    // Broadcast to all players in the game
    broadcastToGame(gameState, 'chat_message', {
      gameId: gameState.id,
      message: chatMessage
    }, io);
  });

  // Connection health
  socket.on('ping', (data) => {
    socket.emit('pong', { timestamp: data.timestamp });
  });

  socket.on('heartbeat', (data) => {
    socket.emit('heartbeat', { timestamp: Date.now() });
  });

  socket.on('heartbeat_ack', (data) => {
    // Acknowledged heartbeat - connection is healthy
  });

  // Disconnection handling
  socket.on('disconnect', (reason) => {
    console.log('❌ Player disconnected:', socket.id, reason);

    // Remove from authenticated players
    const player = authenticatedPlayers.get(socket.id);
    authenticatedPlayers.delete(socket.id);
    connectedPlayers.delete(socket.id);

    // Remove from matchmaking queue
    const queueIndex = matchmakingQueue.findIndex(p => p.socketId === socket.id);
    if (queueIndex !== -1) {
      matchmakingQueue.splice(queueIndex, 1);
    }

    // Handle ongoing games (mark as disconnected but keep game active)
    activeGames.forEach((gameState, gameId) => {
      if (gameState.white.socketId === socket.id) {
        gameState.white.status = 'disconnected';
        console.log('⚠️ White player disconnected from game:', gameId);
      } else if (gameState.black.socketId === socket.id) {
        gameState.black.status = 'disconnected';
        console.log('⚠️ Black player disconnected from game:', gameId);
      }

      // Remove from spectators
      const spectatorIndex = gameState.spectators.indexOf(socket.id);
      if (spectatorIndex !== -1) {
        gameState.spectators.splice(spectatorIndex, 1);
      }
    });

    if (player) {
      console.log('👋 Player disconnected:', player.username);
    }
  });
});

// Cleanup inactive games (run every 5 minutes)
setInterval(() => {
  const now = Date.now();
  const inactiveGames = [];

  activeGames.forEach((gameState, gameId) => {
    const timeSinceLastMove = now - gameState.lastMoveTime;
    const isInactive = timeSinceLastMove > 30 * 60 * 1000; // 30 minutes

    if (isInactive && gameState.status === 'ended') {
      inactiveGames.push(gameId);
    }
  });

  inactiveGames.forEach(gameId => {
    activeGames.delete(gameId);
    console.log('🧹 Cleaned up inactive game:', gameId);
  });

  console.log('📊 Server stats:', {
    activeGames: activeGames.size,
    connectedPlayers: connectedPlayers.size,
    matchmakingQueue: matchmakingQueue.length,
    cleanedGames: inactiveGames.length
  });
}, 5 * 60 * 1000);

// Start server
const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log('🚀 Chess Academy Backend Server running on port', PORT);
  console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
  console.log('📍 Server URL: http://localhost:' + PORT);
});

export default server;