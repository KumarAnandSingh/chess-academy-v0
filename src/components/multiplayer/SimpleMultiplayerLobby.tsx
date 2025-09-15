import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { io, Socket } from 'socket.io-client';

// Simple time control interface without complex imports
interface SimpleTimeControl {
  name: string;
  time: string;
  type: 'bullet' | 'blitz' | 'rapid' | 'classical';
  description: string;
}

const timeControls: SimpleTimeControl[] = [
  { name: 'Bullet', time: '1+0', type: 'bullet', description: '1 minute games' },
  { name: 'Bullet', time: '2+1', type: 'bullet', description: '2 min + 1 sec' },
  { name: 'Blitz', time: '3+0', type: 'blitz', description: '3 minute games' },
  { name: 'Blitz', time: '3+2', type: 'blitz', description: '3 min + 2 sec' },
  { name: 'Blitz', time: '5+0', type: 'blitz', description: '5 minute games' },
  { name: 'Blitz', time: '5+3', type: 'blitz', description: '5 min + 3 sec' },
  { name: 'Rapid', time: '10+0', type: 'rapid', description: '10 minute games' },
  { name: 'Rapid', time: '15+10', type: 'rapid', description: '15 min + 10 sec' },
  { name: 'Classical', time: '30+0', type: 'classical', description: '30 minute games' },
];

const SimpleMultiplayerLobby: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTimeControl, setSelectedTimeControl] = useState<SimpleTimeControl | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // WebSocket connection setup
  useEffect(() => {
    const newSocket = io('http://localhost:3002');
    setSocket(newSocket);
    setConnectionStatus('connecting');

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ Connected to multiplayer server');
      setConnectionStatus('connected');
      
      // Generate consistent user ID for this browser session
      let userId = sessionStorage.getItem('chessUserId');
      let username = sessionStorage.getItem('chessUsername');
      if (!userId) {
        userId = 'demo-user-' + Math.random().toString(36).substr(2, 6);
        username = 'Player' + Math.floor(Math.random() * 1000);
        sessionStorage.setItem('chessUserId', userId);
        sessionStorage.setItem('chessUsername', username);
      }
      
      // Authenticate with demo user data
      newSocket.emit('authenticate', {
        userId,
        username,
        rating: 1200 + Math.floor(Math.random() * 400)
      });
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      setConnectionStatus('disconnected');
      setIsAuthenticated(false);
    });

    newSocket.on('authenticated', (data) => {
      console.log('🔐 Authenticated:', data);
      setIsAuthenticated(true);
    });

    newSocket.on('matchmaking_queued', (data) => {
      console.log('🔍 Added to matchmaking queue:', data);
    });

    newSocket.on('game_started', (data) => {
      console.log('🎮 Game started:', data);
      setIsSearching(false);
      navigate(`/game/${data.gameId}`);
    });

    newSocket.on('matchmaking_error', (data) => {
      console.error('❌ Matchmaking error:', data);
      setIsSearching(false);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []); // Fixed: removed navigate from dependency array to prevent disconnection on navigation

  const handleTimeControlSelect = (tc: SimpleTimeControl) => {
    setSelectedTimeControl(tc);
  };

  const handlePlayNow = () => {
    if (!selectedTimeControl || !socket || !isAuthenticated) return;
    
    setIsSearching(true);
    
    // Send real matchmaking request to backend
    socket.emit('join_matchmaking', {
      timeControl: {
        initial: parseInt(selectedTimeControl.time.split('+')[0]) * 60, // Convert minutes to seconds
        increment: parseInt(selectedTimeControl.time.split('+')[1]) || 0,
        type: selectedTimeControl.type
      }
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bullet': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'blitz': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'rapid': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'classical': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (isSearching) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 bg-gray-800 border-gray-700">
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold mb-2">Finding Opponent...</h2>
            <p className="text-gray-400 mb-4">Searching for a player with similar rating</p>
            <p className="text-blue-400 font-mono">{selectedTimeControl?.time} • {selectedTimeControl?.name}</p>
            <Button 
              onClick={() => setIsSearching(false)} 
              variant="outline" 
              className="mt-4"
            >
              Cancel Search
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-blue-400">
            ♟️ Live Multiplayer Chess
          </h1>
          <p className="text-gray-400 text-lg">
            Play real-time games against other players online
          </p>
        </div>

        {/* Connection Status */}
        <div className="mb-8 text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${
            connectionStatus === 'connected' 
              ? 'bg-green-500/20 text-green-400 border-green-500/30'
              : connectionStatus === 'connecting'
              ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
              : 'bg-red-500/20 text-red-400 border-red-500/30'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' 
                ? 'bg-green-500'
                : connectionStatus === 'connecting'
                ? 'bg-yellow-500 animate-pulse'
                : 'bg-red-500'
            }`}></div>
            <span className="text-sm font-medium">
              {connectionStatus === 'connected' && isAuthenticated 
                ? 'Connected & Ready'
                : connectionStatus === 'connected' && !isAuthenticated
                ? 'Connected (Authenticating...)'
                : connectionStatus === 'connecting'
                ? 'Connecting to server...'
                : 'Disconnected'
              }
            </span>
          </div>
        </div>

        {/* Time Control Selection */}
        <Card className="mb-8 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Choose Time Control</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {timeControls.map((tc, index) => (
                <div
                  key={index}
                  onClick={() => handleTimeControlSelect(tc)}
                  className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                    hover:scale-105 hover:shadow-lg
                    ${selectedTimeControl === tc 
                      ? 'border-blue-500 bg-blue-500/20 shadow-blue-500/30 shadow-lg' 
                      : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xl font-bold text-white">
                      {tc.time}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold border ${getTypeColor(tc.type)}`}>
                      {tc.type.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">{tc.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Play Button */}
        <div className="text-center">
          <Button
            onClick={handlePlayNow}
            disabled={!selectedTimeControl || !isAuthenticated || connectionStatus !== 'connected'}
            size="lg"
            className={`
              px-8 py-4 text-lg font-semibold transition-all duration-200
              ${selectedTimeControl && isAuthenticated && connectionStatus === 'connected'
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:scale-105' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {!isAuthenticated || connectionStatus !== 'connected'
              ? 'Connecting...'
              : selectedTimeControl 
              ? `Play ${selectedTimeControl.time} ${selectedTimeControl.name}` 
              : 'Select Time Control'
            }
          </Button>
          
          {selectedTimeControl && isAuthenticated && connectionStatus === 'connected' && (
            <p className="text-gray-400 mt-2 text-sm">
              Click to find an opponent for {selectedTimeControl.description}
            </p>
          )}
        </div>

        {/* Connection Info */}
        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">
                🔗 Live Online Chess
              </h3>
              <p className="text-gray-400 text-sm">
                {connectionStatus === 'connected' 
                  ? 'Connected to game server. Ready to match you with another player for real-time chess!'
                  : 'Connecting to game server for live matchmaking and real-time chess gameplay.'
                }
              </p>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default SimpleMultiplayerLobby;