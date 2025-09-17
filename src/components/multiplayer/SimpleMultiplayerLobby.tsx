import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { io, Socket } from 'socket.io-client';
import { socketManager } from '../../services/socketManager';

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
  const [connectionDiagnostics, setConnectionDiagnostics] = useState<any>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  // WebSocket connection setup using enhanced socketManager
  useEffect(() => {
    setConnectionStatus('connecting');

    // Store callback references for proper cleanup
    const connectionStatusCallback = (data: { connected: boolean; reason?: string }) => {
      setConnectionStatus(data.connected ? 'connected' : 'disconnected');
      console.log('🔗 Connection status changed:', data);

      // Update diagnostics
      setConnectionDiagnostics(socketManager.getConnectionDiagnostics());
    };

    const authenticatedCallback = (data: { success: boolean; playerInfo?: any }) => {
      console.log('🔐 [LOBBY] Authentication callback triggered with data:', data);
      if (data.success) {
        console.log('🔐 [LOBBY] Authentication successful, setting isAuthenticated to true');
        setIsAuthenticated(true);
      } else {
        console.log('🔐 [LOBBY] Authentication failed, data.success is false');
      }
    };

    const gameStartedCallback = (data: any) => {
      console.log('🎮 Game started:', data);
      setIsSearching(false);

      // CRITICAL: Preserve socket connection during navigation
      console.log('🔒 Preserving socket connection for game navigation');
      const preservationSuccess = socketManager.preserveConnection();
      console.log('🔍 Socket preservation result:', preservationSuccess);
      console.log('🔍 Connection diagnostics before navigation:', socketManager.getConnectionDiagnostics());

      // CRITICAL FIX: Set flag to indicate this is a navigation from lobby
      sessionStorage.setItem('fromLobbyNavigation', 'true');
      console.log('🏷️ Set fromLobbyNavigation flag for proper join_game event');

      // Navigate immediately - the GamePage will handle join_game properly
      console.log('🗺 Navigating to game:', data.gameId);
      navigate(`/game/${data.gameId}`);
    };

    const matchmakingJoinedCallback = (data: any) => {
      console.log('🔍 Added to matchmaking queue:', data);
    };

    // Listen to connection events
    socketManager.on('connection_status', connectionStatusCallback);
    socketManager.on('authenticated', authenticatedCallback);
    socketManager.on('game_started', gameStartedCallback);
    socketManager.on('matchmaking_joined', matchmakingJoinedCallback);

    // Auto-authenticate if connected
    if (socketManager.isConnected()) {
      setConnectionStatus('connected');
      authenticateUser();
    }

    // Update diagnostics periodically
    const diagnosticsInterval = setInterval(() => {
      setConnectionDiagnostics(socketManager.getConnectionDiagnostics());
    }, 5000);

    return () => {
      clearInterval(diagnosticsInterval);

      // CRITICAL FIX: Remove only specific callbacks, not ALL listeners
      // This prevents breaking the socket connection for the game component
      socketManager.removeCallback('connection_status', connectionStatusCallback);
      socketManager.removeCallback('authenticated', authenticatedCallback);
      socketManager.removeCallback('game_started', gameStartedCallback);
      socketManager.removeCallback('matchmaking_joined', matchmakingJoinedCallback);

      console.log('🧹 Lobby cleanup: Removed specific callbacks, preserved socket connection');
    };
  }, [navigate]);

  const authenticateUser = () => {
    // Generate consistent user ID for this browser session
    let userId = sessionStorage.getItem('chessUserId');
    let username = sessionStorage.getItem('chessUsername');
    if (!userId) {
      userId = 'demo-user-' + Math.random().toString(36).substr(2, 6);
      username = 'Player' + Math.floor(Math.random() * 1000);
      sessionStorage.setItem('chessUserId', userId);
      sessionStorage.setItem('chessUsername', username);
    }

    try {
      socketManager.authenticate({
        userId,
        username,
        rating: 1200 + Math.floor(Math.random() * 400)
      });
    } catch (error) {
      console.log('⚠️ Authentication skipped, not connected yet');
    }
  };

  const handleTimeControlSelect = (tc: SimpleTimeControl) => {
    setSelectedTimeControl(tc);
  };

  const handlePlayNow = () => {
    if (!selectedTimeControl || !isAuthenticated || !socketManager.isConnected()) return;

    setIsSearching(true);

    try {
      // Send real matchmaking request using enhanced socketManager
      socketManager.joinMatchmaking({
        timeControl: {
          initial: parseInt(selectedTimeControl.time.split('+')[0]) * 60, // Convert minutes to seconds
          increment: parseInt(selectedTimeControl.time.split('+')[1]) || 0,
          type: selectedTimeControl.type
        }
      });
    } catch (error) {
      console.error('Failed to join matchmaking:', error);
      setIsSearching(false);
    }
  };

  const handleForceReconnect = () => {
    console.log('🔄 User requested force reconnection');
    socketManager.forceReconnect();
    setConnectionStatus('connecting');
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

          {/* Connection Actions */}
          <div className="mt-4 flex justify-center gap-2">
            {connectionStatus === 'disconnected' && (
              <Button
                onClick={handleForceReconnect}
                variant="outline"
                size="sm"
                className="text-blue-400 border-blue-500/30 hover:bg-blue-500/20"
              >
                🔄 Reconnect
              </Button>
            )}
            <Button
              onClick={() => setShowDiagnostics(!showDiagnostics)}
              variant="outline"
              size="sm"
              className="text-gray-400 border-gray-500/30 hover:bg-gray-500/20"
            >
              {showDiagnostics ? '🔍 Hide' : '🔍 Show'} Diagnostics
            </Button>
          </div>

          {/* Connection Diagnostics */}
          {showDiagnostics && connectionDiagnostics && (
            <div className="mt-4 max-w-2xl mx-auto">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-blue-400 mb-2">Connection Diagnostics</h4>
                  <div className="text-xs text-gray-300 space-y-1">
                    <div>Status: <span className={connectionDiagnostics.connected ? 'text-green-400' : 'text-red-400'}>{connectionDiagnostics.connected ? 'Connected' : 'Disconnected'}</span></div>
                    <div>Transport: <span className="text-blue-400">{connectionDiagnostics.transport}</span></div>
                    <div>Socket ID: <span className="text-yellow-400">{connectionDiagnostics.socketId}</span></div>
                    <div>Health: <span className={connectionDiagnostics.isHealthy ? 'text-green-400' : 'text-red-400'}>{connectionDiagnostics.isHealthy ? 'Healthy' : 'Unhealthy'}</span></div>
                    {connectionDiagnostics.timeSinceLastHeartbeat && (
                      <div>Last Heartbeat: <span className="text-purple-400">{Math.round(connectionDiagnostics.timeSinceLastHeartbeat / 1000)}s ago</span></div>
                    )}
                    <div>Reconnect Attempts: <span className="text-orange-400">{connectionDiagnostics.reconnectAttempts}</span></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
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