import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Chess } from 'chess.js';
import { ChessBoard } from '../chess/ChessBoard';
import { io, Socket } from 'socket.io-client';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { getDisplayName } from '../../utils/nameGenerator';
import { Maximize2, Minimize2, Send, Smile, X, Minus, Move, RotateCcw } from 'lucide-react';

interface ImprovedLiveChessGameProps {
  gameId: string;
}

interface GameData {
  white: {
    username: string;
    rating: number;
  };
  black: {
    username: string;
    rating: number;
  };
  turn: 'w' | 'b';
  whiteTime: number;
  blackTime: number;
  moveNumber: number;
  position: string;
  timeControl: {
    initial: number;
    increment: number;
    type: string;
  };
}

interface ChatMessage {
  username: string;
  message: string;
  timestamp: string;
}

const ImprovedLiveChessGame: React.FC<ImprovedLiveChessGameProps> = ({ gameId }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [chess] = useState(new Chess());
  const [gamePosition, setGamePosition] = useState(chess.fen());
  
  // New UI state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [boardSize, setBoardSize] = useState(600);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Chatbox state
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [chatPosition, setChatPosition] = useState({ x: 0, y: 0 });
  const [chatSize, setChatSize] = useState({ width: 400, height: 500 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Common emojis for chess chat
  const commonEmojis = ['😊', '😂', '🤔', '😎', '👍', '👎', '💪', '🔥', '⚡', '👑', '🎯', '💯'];
  
  // Chess-relevant quick chat suggestions
  const chessQuickMessages = [
    "What are you thinking? 🤔",
    "Taking so long to move your piece! ⏰",
    "Nice move! 👍",
    "Good game! 👑",
    "That was unexpected! 😯",
    "Thinking harder... 🧠",
    "Great strategy! 🎯",
    "Time pressure! ⏱️",
    "Brilliant! ✨",
    "Tough position... 😤",
    "Let's see... 🔍",
    "Checkmate coming! ⚔️"
  ];
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [playerColor, setPlayerColor] = useState<'white' | 'black' | 'spectator'>('spectator');
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [gameStatus, setGameStatus] = useState<'waiting' | 'active' | 'ended'>('waiting');
  const [gameResult, setGameResult] = useState<any>(null);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [optionSquares, setOptionSquares] = useState<{[key: string]: any}>({});

  // Display times for countdown
  const [displayWhiteTime, setDisplayWhiteTime] = useState(0);
  const [displayBlackTime, setDisplayBlackTime] = useState(0);

  // Socket connection and event handling
  useEffect(() => {
    const newSocket = io('http://localhost:3002', {
      transports: ['websocket'],
      autoConnect: true
    });

    newSocket.on('connect', () => {
      console.log('🎮 Connected to server');
      setConnectionStatus('connected');
      
      // Use consistent user credentials from session storage
      let userId = sessionStorage.getItem('chessUserId');
      let username = sessionStorage.getItem('chessUsername');
      if (!userId) {
        userId = 'demo-user-' + Math.random().toString(36).substr(2, 6);
        username = 'Player' + Math.floor(Math.random() * 1000);
        sessionStorage.setItem('chessUserId', userId);
        sessionStorage.setItem('chessUsername', username);
      }
      
      // Authenticate and join game with same credentials from lobby
      newSocket.emit('authenticate', {
        userId,
        username,
        rating: 1200 + Math.floor(Math.random() * 400)
      });
      
      newSocket.emit('join_game', { gameId });
    });

    newSocket.on('disconnect', () => {
      console.log('🎮 Disconnected from server');
      setConnectionStatus('disconnected');
    });

    newSocket.on('game_started', (data) => {
      console.log('🎮 Game started:', data);
      setGameData(data);
      setGameStatus('active');
      setPlayerColor(data.playerColor);
      setGamePosition(data.position);
      chess.load(data.position);
      setDisplayWhiteTime(data.whiteTime);
      setDisplayBlackTime(data.blackTime);
    });

    newSocket.on('move_made', (data) => {
      console.log('🎯 FRONTEND: move_made event received:', data);
      console.log('🎯 FRONTEND: Event timestamp:', new Date().toISOString());
      
      if (data.position) {
        console.log('🔄 Updating chess position to:', data.position);
        chess.load(data.position);
        
        setGamePosition(prevPos => {
          console.log('🔄 setGamePosition: old =', prevPos, 'new =', data.position);
          return data.position;
        });
        
        setGameData(prev => {
          if (!prev) {
            return {
              position: data.position,
              whiteTime: data.whiteTime,
              blackTime: data.blackTime,
              turn: data.turn,
              moveNumber: data.moveNumber,
              white: { username: 'Player1', rating: 1500 },
              black: { username: 'Player2', rating: 1500 },
              timeControl: { type: 'blitz', initial: 300, increment: 3 }
            };
          }
          return {
            ...prev,
            position: data.position,
            whiteTime: data.whiteTime,
            blackTime: data.blackTime,
            turn: data.turn,
            moveNumber: data.moveNumber
          };
        });
        
        if (data.lastMove && data.lastMove.from && data.lastMove.to) {
          setLastMove({ from: data.lastMove.from, to: data.lastMove.to });
        }
        
        if (data.gameResult) {
          setGameStatus('ended');
          setGameResult(data.gameResult);
        }
        
        setSelectedSquare(null);
        setOptionSquares({});
      }
    });

    newSocket.on('game_ended', (data) => {
      console.log('🏁 Game ended:', data);
      setGameStatus('ended');
      setGameResult(data.result);
    });

    newSocket.on('chat_message', (data) => {
      setChatMessages(prev => [...prev, data.message]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [gameId]);

  // Timer countdown
  useEffect(() => {
    if (!gameData || gameStatus !== 'active') return;
    
    const timer = setInterval(() => {
      if (gameData.turn === 'w') {
        setDisplayWhiteTime(prev => Math.max(0, prev - 1000));
      } else {
        setDisplayBlackTime(prev => Math.max(0, prev - 1000));
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameData?.turn, gameStatus]);

  // Force re-render when gamePosition changes
  useEffect(() => {
    console.log('🔄 useEffect: gamePosition changed to:', gamePosition);
  }, [gamePosition]);

  // Handle piece drop
  const handlePieceDrop = useCallback((sourceSquare: string, targetSquare: string) => {
    console.log(`🎯 Handling piece drop: ${sourceSquare} → ${targetSquare}`);
    
    if (playerColor === 'spectator') {
      console.log(`❌ Spectator cannot make moves`);
      return false;
    }

    if (gameStatus !== 'active') {
      console.log(`❌ Game not active: ${gameStatus}`);
      return false;
    }

    if (!gameData || !socket) {
      console.log(`❌ No game data or socket connection`);
      return false;
    }

    const currentTurn = gameData.turn;
    const isPlayerTurn = (currentTurn === 'w' && playerColor === 'white') || 
                         (currentTurn === 'b' && playerColor === 'black');

    if (!isPlayerTurn) {
      console.log(`❌ Not player's turn`);
      return false;
    }

    const moveData = {
      gameId,
      move: {
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      },
      timeLeft: playerColor === 'white' ? gameData.whiteTime : gameData.blackTime
    };
    
    console.log('🎯 FRONTEND: Sending make_move event:', moveData);
    
    socket.emit('make_move', moveData);
    return true;
  }, [socket, gameId, playerColor, gameData, gameStatus]);

  // Handle move from ChessBoard wrapper
  const handleMove = useCallback((move: { from: string; to: string; promotion?: string }) => {
    console.log(`🎯 Frontend: ChessBoard wrapper move attempt:`, move);
    return handlePieceDrop(move.from, move.to);
  }, [handlePieceDrop]);

  const resignGame = () => {
    if (window.confirm('Are you sure you want to resign?')) {
      socket?.emit('resign', { gameId });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 1000 / 60);
    const secs = Math.floor((seconds / 1000) % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // New helper functions
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setBoardSize(isFullscreen ? 600 : Math.min(window.innerWidth - 100, window.innerHeight - 100));
  };

  const sendChatMessage = () => {
    if (newMessage.trim() && socket) {
      const currentUsername = sessionStorage.getItem('chessUsername') || 'Player';
      const message: ChatMessage = {
        username: currentUsername,
        message: newMessage.trim(),
        timestamp: new Date().toISOString()
      };
      socket.emit('chat_message', { gameId, message });
      // Don't add to local state - server will echo back the message
      setNewMessage('');
      setShowEmojiPicker(false);
    }
  };

  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const sendQuickMessage = (message: string) => {
    if (socket) {
      const currentUsername = sessionStorage.getItem('chessUsername') || 'Player';
      const chatMessage: ChatMessage = {
        username: currentUsername,
        message: message,
        timestamp: new Date().toISOString()
      };
      socket.emit('chat_message', { gameId, message: chatMessage });
      setShowEmojiPicker(false);
    }
  };

  // Get display names for players
  const whiteDisplayName = useMemo(() => {
    return gameData?.white ? getDisplayName(gameData.white.username, true) : 'White Player';
  }, [gameData?.white]);

  const blackDisplayName = useMemo(() => {
    return gameData?.black ? getDisplayName(gameData.black.username, true) : 'Black Player';
  }, [gameData?.black]);

  // Chatbox drag and resize handlers
  const handleChatDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - chatPosition.x,
      y: e.clientY - chatPosition.y
    });
  };

  const handleChatDragMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      setChatPosition({
        x: Math.max(0, Math.min(window.innerWidth - chatSize.width, e.clientX - dragStart.x)),
        y: Math.max(0, Math.min(window.innerHeight - 100, e.clientY - dragStart.y))
      });
    }
  }, [isDragging, dragStart, chatSize]);

  const handleChatDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (isResizing) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      setChatSize(prev => ({
        width: Math.max(300, Math.min(600, prev.width + deltaX)),
        height: Math.max(200, Math.min(800, prev.height + deltaY))
      }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, [isResizing, dragStart]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Mouse event listeners for dragging and resizing
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleChatDragMove);
      document.addEventListener('mouseup', handleChatDragEnd);
    }
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleChatDragMove);
      document.removeEventListener('mouseup', handleChatDragEnd);
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [isDragging, isResizing, handleChatDragMove, handleChatDragEnd, handleResizeMove, handleResizeEnd]);

  // ESC key support for exiting fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        toggleFullscreen();
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen, toggleFullscreen]);

  if (connectionStatus === 'connecting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Connecting to game...
          </h2>
        </div>
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Game not found</h2>
          <p className="text-slate-400">The game may have ended or the ID is invalid.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-slate-900' : 'min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'} text-white transition-all duration-300`}>
      <div className={`${isFullscreen ? 'h-full flex items-center justify-center p-4' : 'max-w-7xl mx-auto p-4'}`}>
        <div className={`${isFullscreen ? 'max-w-none' : 'grid grid-cols-1 xl:grid-cols-3 gap-6'}`}>
          
          {/* Main Game Section */}
          <div className={`${isFullscreen ? 'w-full' : 'xl:col-span-2'} flex flex-col`}>
            
            {/* Header with controls */}
            {!isFullscreen && (
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  Live Chess Match
                </h1>
                <div className="flex gap-2">
                  <Button 
                    onClick={toggleFullscreen}
                    variant="outline" 
                    size="sm"
                    className="border-slate-600 hover:bg-slate-700"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Exit Fullscreen Button - Only visible in fullscreen mode */}
            {isFullscreen && (
              <div className="fixed top-4 right-4 z-50">
                <Button 
                  onClick={toggleFullscreen}
                  variant="outline" 
                  size="sm"
                  className="bg-slate-800/90 border-slate-600 hover:bg-slate-700 text-white shadow-lg backdrop-blur-sm"
                  title="Exit fullscreen (ESC)"
                >
                  <Minimize2 className="w-4 h-4 mr-2" />
                  Exit Fullscreen
                </Button>
              </div>
            )}

            {/* Game Board Container */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl overflow-hidden">
              
              {/* Top Player */}
              <div className="flex items-center justify-between p-4 bg-slate-700">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${
                    playerColor === 'white' 
                      ? 'bg-gray-800 border-2 border-white' 
                      : 'bg-white border-2 border-gray-800'
                  }`}></div>
                  <div>
                    <span className="font-bold text-lg text-white">
                      {playerColor === 'white' ? blackDisplayName : whiteDisplayName}
                    </span>
                    <span className="ml-2 text-sm text-slate-400">
                      ({playerColor === 'white' ? gameData.black.rating : gameData.white.rating})
                    </span>
                  </div>
                </div>
                <div className="text-2xl font-mono font-bold text-white bg-slate-600 px-4 py-2 rounded-lg">
                  {formatTime(playerColor === 'white' ? displayBlackTime : displayWhiteTime)}
                </div>
              </div>

              {/* Chess Board */}
              <div className="p-4 bg-gradient-to-br from-slate-800 to-slate-900">
                <div 
                  className="aspect-square mx-auto rounded-lg overflow-hidden shadow-lg"
                  style={{ 
                    width: isFullscreen ? `${boardSize}px` : '100%',
                    maxWidth: isFullscreen ? 'none' : '600px'
                  }}
                >
                  <ChessBoard
                    fen={gamePosition}
                    orientation={playerColor === 'black' ? 'black' : 'white'}
                    onMove={handleMove}
                    disabled={playerColor === 'spectator' || gameStatus === 'ended'}
                    showPieceTooltips={true}
                    highlightMoves={true}
                  />
                </div>
              </div>

              {/* Bottom Player */}
              <div className="flex items-center justify-between p-4 bg-slate-700">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${
                    playerColor === 'white' 
                      ? 'bg-white border-2 border-gray-800' 
                      : 'bg-gray-800 border-2 border-white'
                  }`}></div>
                  <div>
                    <span className="font-bold text-lg text-white">
                      {playerColor === 'white' ? whiteDisplayName : blackDisplayName}
                    </span>
                    <span className="ml-2 text-sm text-slate-400">
                      ({playerColor === 'white' ? gameData.white.rating : gameData.black.rating})
                    </span>
                  </div>
                </div>
                <div className="text-2xl font-mono font-bold text-white bg-slate-600 px-4 py-2 rounded-lg">
                  {formatTime(playerColor === 'white' ? displayWhiteTime : displayBlackTime)}
                </div>
              </div>

              {/* Game Status Bar */}
              <div className="px-4 py-3 bg-slate-600 border-t border-slate-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`text-lg font-bold px-3 py-1 rounded-full ${
                      gameData.turn === 'w' 
                        ? 'bg-white text-black border-2 border-yellow-400 shadow-lg' 
                        : 'bg-gray-800 text-white border-2 border-yellow-400 shadow-lg'
                    }`}>
                      {gameStatus === 'ended' 
                        ? `🏁 Game Over - ${gameResult?.result || 'Draw'}`
                        : gameData.turn === 'w' 
                          ? '⚪ WHITE TO MOVE' 
                          : '⚫ BLACK TO MOVE'
                      }
                    </div>
                    <span className="text-sm text-slate-300">
                      Move #{gameData.moveNumber} • {gameData.timeControl.type} ({Math.floor(gameData.timeControl.initial/60)}+{gameData.timeControl.increment})
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    {isFullscreen && (
                      <Button 
                        onClick={toggleFullscreen}
                        variant="outline" 
                        size="sm"
                        className="border-red-400 hover:bg-red-500 hover:text-white transition-colors flex items-center gap-2"
                      >
                        <Minimize2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Exit Fullscreen</span>
                      </Button>
                    )}
                    {playerColor !== 'spectator' && gameStatus === 'active' && (
                      <Button 
                        onClick={resignGame}
                        variant="destructive" 
                        size="sm"
                        className="border-2 border-red-500 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200"
                      >
                        🏳️ Resign Game
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Panel */}
          {!isFullscreen && playerColor !== 'spectator' && (
            <div className="xl:col-span-1">
              <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl h-full max-h-[700px] flex flex-col">
                
                {/* Chat Header */}
                <div className="p-4 bg-slate-700 rounded-t-xl flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    💬 Game Chat
                  </h3>
                  <Button
                    onClick={() => setIsChatCollapsed(true)}
                    size="sm"
                    variant="ghost"
                    className="p-2 hover:bg-slate-600"
                    title="Minimize chat"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-0">
                  {chatMessages.length === 0 ? (
                    <div className="text-center text-slate-400 mt-8">
                      <div className="text-4xl mb-2">💬</div>
                      <p>No messages yet...</p>
                      <p className="text-sm">Start chatting with your opponent!</p>
                    </div>
                  ) : (
                    chatMessages.map((msg, index) => {
                      // Get current user's username from sessionStorage
                      const currentUsername = sessionStorage.getItem('chessUsername') || '';
                      const isOwnMessage = msg.username === currentUsername;
                      
                      return (
                        <div key={index} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs px-4 py-2 rounded-2xl ${
                            isOwnMessage 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-emerald-600 text-white'
                          }`}>
                            <div className="text-xs opacity-75 mb-1">
                              {getDisplayName(msg.username, true)} • {new Date(msg.timestamp).toLocaleTimeString()}
                            </div>
                            <div className="break-words">{msg.message}</div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-slate-600">
                  {showEmojiPicker && (
                    <div className="mb-3 p-3 bg-slate-700 rounded-lg">
                      <div className="flex gap-2 mb-3">
                        <span className="text-sm text-slate-300 font-medium">Quick Messages:</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2 mb-3">
                        {chessQuickMessages.slice(0, 4).map((message, index) => (
                          <button
                            key={index}
                            onClick={() => sendQuickMessage(message)}
                            className="p-2 bg-slate-600 hover:bg-slate-500 rounded text-sm text-left transition-colors text-white"
                          >
                            {message}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2 mb-2">
                        <span className="text-sm text-slate-300 font-medium">Emojis:</span>
                      </div>
                      <div className="grid grid-cols-6 gap-1">
                        {commonEmojis.map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => addEmoji(emoji)}
                            className="p-2 hover:bg-slate-600 rounded text-xl transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                        placeholder="Type your message..."
                        className="w-full p-3 pr-12 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none transition-colors"
                      />
                      <Button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        size="sm"
                        variant="ghost"
                        className="absolute right-1 top-1 p-2"
                      >
                        <Smile className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button 
                      onClick={sendChatMessage}
                      disabled={!newMessage.trim()}
                      className="bg-blue-600 hover:bg-blue-700 px-4"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Floating Draggable Chat (when in fullscreen or collapsed) */}
        {(isFullscreen || isChatCollapsed) && playerColor !== 'spectator' && (
          <div 
            className="fixed z-50 bg-slate-800 rounded-xl border border-slate-700 shadow-2xl transition-all duration-300"
            style={{ 
              left: `${chatPosition.x}px`, 
              top: `${chatPosition.y}px`,
              width: `${chatSize.width}px`,
              height: isChatCollapsed ? 'auto' : `${chatSize.height}px`
            }}
          >
            {/* Draggable Header */}
            <div 
              className="p-3 bg-slate-700 rounded-t-xl cursor-move flex items-center justify-between"
              onMouseDown={handleChatDragStart}
            >
              <div className="flex items-center gap-2">
                <Move className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-semibold text-white">💬 Chat</h3>
              </div>
              <div className="flex gap-1">
                <Button
                  onClick={() => setIsChatCollapsed(!isChatCollapsed)}
                  size="sm"
                  variant="ghost"
                  className="p-1 h-6 w-6"
                >
                  {isChatCollapsed ? <Maximize2 className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                </Button>
                {!isFullscreen && (
                  <Button
                    onClick={() => setIsChatCollapsed(false)}
                    size="sm"
                    variant="ghost"
                    className="p-1 h-6 w-6"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>

            {!isChatCollapsed && (
              <>
                {/* Messages Area */}
                <div className="p-3 overflow-y-auto space-y-2" style={{ height: `${chatSize.height - 150}px` }}>
                  {chatMessages.length === 0 ? (
                    <div className="text-center text-slate-400 mt-4">
                      <div className="text-2xl mb-1">💬</div>
                      <p className="text-xs">No messages yet...</p>
                    </div>
                  ) : (
                    chatMessages.map((msg, index) => {
                      // Get current user's username from sessionStorage
                      const currentUsername = sessionStorage.getItem('chessUsername') || '';
                      const isOwnMessage = msg.username === currentUsername;
                      
                      return (
                        <div key={index} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs px-3 py-1.5 rounded-lg text-sm ${
                            isOwnMessage 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-emerald-600 text-white'
                          }`}>
                            <div className="text-xs opacity-75 mb-0.5">
                              {getDisplayName(msg.username, true)} • {new Date(msg.timestamp).toLocaleTimeString()}
                            </div>
                            <div className="break-words">{msg.message}</div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Message Input */}
                <div className="p-3 border-t border-slate-600">
                  {showEmojiPicker && (
                    <div className="mb-2 p-2 bg-slate-700 rounded-lg">
                      <div className="flex gap-2 mb-2">
                        <span className="text-xs text-slate-300 font-medium">Quick Messages:</span>
                      </div>
                      <div className="grid grid-cols-1 gap-1 mb-3">
                        {chessQuickMessages.slice(0, 3).map((message, index) => (
                          <button
                            key={index}
                            onClick={() => sendQuickMessage(message)}
                            className="p-1.5 bg-slate-600 hover:bg-slate-500 rounded text-xs text-left transition-colors text-white"
                          >
                            {message}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2 mb-1">
                        <span className="text-xs text-slate-300 font-medium">Emojis:</span>
                      </div>
                      <div className="grid grid-cols-6 gap-1">
                        {commonEmojis.map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => addEmoji(emoji)}
                            className="p-1 hover:bg-slate-600 rounded text-sm transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                        placeholder="Type message..."
                        className="w-full p-2 pr-10 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none transition-colors"
                      />
                      <Button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        size="sm"
                        variant="ghost"
                        className="absolute right-0.5 top-0.5 p-1.5 h-7 w-7"
                      >
                        <Smile className="w-3 h-3" />
                      </Button>
                    </div>
                    <Button 
                      onClick={sendChatMessage}
                      disabled={!newMessage.trim()}
                      className="bg-blue-600 hover:bg-blue-700 px-3 h-8 text-sm"
                    >
                      <Send className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Resize Handle */}
                <div 
                  className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-slate-600 rounded-tl-lg opacity-60 hover:opacity-100 transition-opacity"
                  onMouseDown={handleResizeStart}
                >
                  <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-slate-400"></div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Chat Toggle Button (when not in fullscreen and chat is collapsed) */}
        {!isFullscreen && isChatCollapsed && playerColor !== 'spectator' && (
          <Button
            onClick={() => setIsChatCollapsed(false)}
            className="fixed bottom-4 right-4 z-40 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg"
          >
            💬
          </Button>
        )}
      </div>
    </div>
    </>
  );
};

export default ImprovedLiveChessGame;