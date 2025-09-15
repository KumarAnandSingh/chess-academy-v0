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
  const [isConnected, setIsConnected] = useState(true); // Demo mode - always connected
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Demo mode - always authenticated
  const [playerInfo, setPlayerInfo] = useState<any>({
    userId: 'demo-user',
    username: 'DemoPlayer',
    rating: 1200
  }); // Demo mode - preset player

  useEffect(() => {
    // Demo mode - simulate successful connection
    console.log('🎮 Multiplayer Demo Mode: Simulating connected state');
    setIsConnected(true);
    setIsAuthenticated(true);
    setConnectionError(null);
  }, []);

  const handleTimeControlSelect = (timeControl: TimeControl) => {
    // Demo mode - simulate matchmaking
    console.log('🎮 Demo: Selected time control', timeControl);
    alert(`Demo Mode: You selected ${formatTimeControl(timeControl)} ${timeControl.type} time control.\n\nIn a real multiplayer environment, this would start searching for an opponent!`);
  };

  const handleReconnect = () => {
    // Demo mode - simulate reconnection
    console.log('🔄 Demo: Simulating reconnection...');
    setConnectionError(null);
    setIsConnected(true);
  };

  const statusColor = isConnected ? 'text-green-400' : 'text-red-400';
  const statusIcon = isConnected ? '●' : '●';

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Multiplayer Chess</h1>
        <p className="text-gray-400">Play rated games against opponents worldwide</p>

        {/* Demo Mode Banner */}
        <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <span>🎮</span>
            <span className="font-medium">Demo Mode Active</span>
          </div>
          <p className="text-blue-300 text-sm">
            This is a demonstration of the multiplayer interface. Click any time control to see how matchmaking would work!
          </p>
        </div>
      </div>

      {/* Connection Status */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 ${statusColor}`}>
              <span className="text-sm">{statusIcon}</span>
              <span className="text-sm font-medium">
                {isConnected ? 'Demo Mode Active' : 'Disconnected'}
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
            <div className="flex items-center gap-3">
              <div className="text-red-400 text-sm">{connectionError}</div>
              <button
                onClick={handleReconnect}
                className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded transition-colors"
              >
                Retry
              </button>
            </div>
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