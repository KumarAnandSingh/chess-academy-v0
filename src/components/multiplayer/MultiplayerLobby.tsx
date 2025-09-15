import React, { useState, useEffect } from 'react';
import { socketManager } from '../../services/socketManager';

interface TimeControl {
  initial: number;
  increment: number;
  type: 'bullet' | 'blitz' | 'rapid' | 'classical';
}

const timeControls: TimeControl[] = [
  { initial: 60, increment: 1, type: 'bullet' },
  { initial: 180, increment: 0, type: 'blitz' },
  { initial: 180, increment: 2, type: 'blitz' },
  { initial: 300, increment: 0, type: 'blitz' },
  { initial: 300, increment: 3, type: 'blitz' },
  { initial: 600, increment: 0, type: 'rapid' },
  { initial: 900, increment: 10, type: 'rapid' },
  { initial: 1800, increment: 0, type: 'classical' },
  { initial: 1800, increment: 30, type: 'classical' },
];

const formatTimeControl = (tc: TimeControl): string => {
  const minutes = Math.floor(tc.initial / 60);
  return tc.increment > 0 ? `${minutes}+${tc.increment}` : `${minutes}`;
};

const getTimeControlColor = (type: TimeControl['type']): string => {
  switch (type) {
    case 'bullet': return 'text-red-400 border-red-400/30 bg-red-400/5';
    case 'blitz': return 'text-orange-400 border-orange-400/30 bg-orange-400/5';
    case 'rapid': return 'text-green-400 border-green-400/30 bg-green-400/5';
    case 'classical': return 'text-blue-400 border-blue-400/30 bg-blue-400/5';
    default: return 'text-gray-400 border-gray-400/30 bg-gray-400/5';
  }
};

const MultiplayerLobby: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [playerInfo, setPlayerInfo] = useState<any>(null);

  useEffect(() => {
    // Set up event listeners
    const handleConnectionStatus = (data: { connected: boolean; reason?: string }) => {
      setIsConnected(data.connected);
      if (!data.connected && data.reason) {
        setConnectionError(data.reason);
      } else {
        setConnectionError(null);
      }
    };

    const handleConnectionError = (data: { error: string }) => {
      setConnectionError(data.error);
      setIsConnected(false);
    };

    const handleAuthenticated = (data: { success: boolean; playerInfo?: any }) => {
      if (data.success && data.playerInfo) {
        setIsAuthenticated(true);
        setPlayerInfo(data.playerInfo);
      }
    };

    // Add event listeners
    socketManager.on('connection_status', handleConnectionStatus);
    socketManager.on('connection_error', handleConnectionError);
    socketManager.on('authenticated', handleAuthenticated);

    // Check initial connection
    setIsConnected(socketManager.isConnected());

    // Auto-authenticate for demo
    if (!isAuthenticated && !playerInfo) {
      const demoUser = {
        userId: 'demo-user-' + Date.now(),
        username: 'TestPlayer',
        rating: 1200
      };
      try {
        if (socketManager.isConnected()) {
          socketManager.authenticate(demoUser);
        }
      } catch (error) {
        console.log('Authentication will retry when connected');
      }
    }

    // Cleanup
    return () => {
      socketManager.off('connection_status', handleConnectionStatus);
      socketManager.off('connection_error', handleConnectionError);
      socketManager.off('authenticated', handleAuthenticated);
    };
  }, [isAuthenticated, playerInfo]);

  const handleTimeControlSelect = (timeControl: TimeControl) => {
    if (!isConnected || !isAuthenticated) {
      console.log('Please wait for connection and authentication');
      return;
    }
    try {
      socketManager.joinMatchmaking({ timeControl });
      console.log('Joined matchmaking for', timeControl);
    } catch (error) {
      console.error('Failed to join matchmaking:', error);
    }
  };

  const statusColor = isConnected ? 'text-green-400' : 'text-red-400';
  const statusIcon = isConnected ? '●' : '●';

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Multiplayer Chess</h1>
        <p className="text-gray-400">Play rated games against opponents worldwide</p>
      </div>

      {/* Connection Status */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 ${statusColor}`}>
              <span className="text-sm">{statusIcon}</span>
              <span className="text-sm font-medium">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            {isAuthenticated && playerInfo && (
              <div className="flex items-center gap-2 text-gray-300">
                <span className="text-sm">Playing as:</span>
                <span className="text-sm font-semibold text-white">{playerInfo.username}</span>
                <span className="text-xs px-2 py-1 bg-blue-600 rounded text-white">
                  {playerInfo.rating}
                </span>
              </div>
            )}
          </div>
          {connectionError && (
            <div className="text-red-400 text-sm">{connectionError}</div>
          )}
        </div>
      </div>

      {/* Time Control Grid */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Choose Time Control</h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {timeControls.map((tc, index) => (
            <button
              key={index}
              onClick={() => handleTimeControlSelect(tc)}
              disabled={!isConnected || !isAuthenticated}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200
                hover:scale-105 hover:border-blue-400 active:scale-95
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                ${getTimeControlColor(tc.type)}
                group
              `}
            >
              <div className="text-center">
                <div className="text-2xl font-bold mb-1 group-hover:text-white transition-colors">
                  {formatTimeControl(tc)}
                </div>
                <div className="text-xs uppercase font-medium opacity-80 group-hover:opacity-100">
                  {tc.type}
                </div>
                {tc.increment > 0 && (
                  <div className="text-xs opacity-60 mt-1">
                    +{tc.increment}s per move
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm mb-2">
            Rating range: ±200 points by default
          </p>
          <p className="text-gray-500 text-xs">
            Games are rated and affect your ELO rating
          </p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
          <p className="text-gray-400 text-sm">
            Tip: Choose faster time controls for quick games, or classical for deeper thinking
          </p>
        </div>
      </div>
    </div>
  );
};

export default MultiplayerLobby;