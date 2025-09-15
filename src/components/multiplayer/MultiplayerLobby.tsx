import React, { useState, useEffect } from 'react';
import { useMultiplayerStore } from '../../stores/multiplayerStore';
import { socketManager, TimeControl } from '../../services/socketManager';
import { useNavigate } from 'react-router-dom';

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

const ConnectionStatus: React.FC = () => {
  const { isConnected, connectionError, isAuthenticated, playerInfo } = useMultiplayerStore();
  
  const statusColor = isConnected ? 'text-green-400' : 'text-red-400';
  const statusIcon = isConnected ? '●' : '●';
  
  return (
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
  );
};

const MatchmakingQueue: React.FC = () => {
  const { matchmaking, stopMatchmaking } = useMultiplayerStore();
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!matchmaking.isSearching || !matchmaking.searchStartTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - matchmaking.searchStartTime!.getTime()) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [matchmaking.isSearching, matchmaking.searchStartTime]);

  if (!matchmaking.isSearching) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-blue-500/30 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Searching for opponent...</h3>
        <button
          onClick={stopMatchmaking}
          className="bg-gray-600 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded transition-colors"
        >
          Cancel
        </button>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Time Control:</span>
          <span className={`font-medium ${getTimeControlColor(matchmaking.timeControl!.type)}`}>
            {formatTimeControl(matchmaking.timeControl!)}
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Elapsed Time:</span>
          <span className="text-white font-mono">{formatTime(elapsedTime)}</span>
        </div>
        
        {matchmaking.estimatedWaitTime > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Estimated Wait:</span>
            <span className="text-orange-400">{matchmaking.estimatedWaitTime}s</span>
          </div>
        )}
        
        {matchmaking.queuePosition > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Queue Position:</span>
            <span className="text-blue-400">#{matchmaking.queuePosition}</span>
          </div>
        )}
      </div>
      
      <div className="mt-4 h-1 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full animate-pulse"
          style={{ width: '60%' }}
        />
      </div>
    </div>
  );
};

const TimeControlGrid: React.FC = () => {
  const { startMatchmaking, isConnected, isAuthenticated } = useMultiplayerStore();
  
  const handleTimeControlSelect = (timeControl: TimeControl) => {
    if (!isConnected || !isAuthenticated) {
      // TODO: Show authentication prompt
      console.log('Please authenticate first');
      return;
    }
    startMatchmaking(timeControl);
  };

  return (
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
  );
};

const LiveGamesList: React.FC = () => {
  const { liveGames } = useMultiplayerStore();
  const navigate = useNavigate();
  
  const handleSpectateGame = (gameId: string) => {
    navigate(`/spectate/${gameId}`);
  };

  if (liveGames.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Live Games</h3>
        <div className="text-center text-gray-400 py-8">
          <div className="text-4xl mb-2">♟️</div>
          <p>No live games at the moment</p>
          <p className="text-sm mt-1">Games will appear here when players are online</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-4">Live Games ({liveGames.length})</h3>
      
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {liveGames.map((game) => (
          <div
            key={game.id}
            className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{game.white.username}</span>
                  <span className="text-xs px-1.5 py-0.5 bg-gray-600 rounded text-gray-300">
                    {game.white.rating}
                  </span>
                  <span className="text-gray-400">vs</span>
                  <span className="text-white font-medium">{game.black.username}</span>
                  <span className="text-xs px-1.5 py-0.5 bg-gray-600 rounded text-gray-300">
                    {game.black.rating}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-1 rounded ${getTimeControlColor(game.timeControl.type)}`}>
                    {formatTimeControl(game.timeControl)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {game.spectators.length} watching
                  </span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => handleSpectateGame(game.id)}
              className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-3 py-1.5 rounded transition-colors"
            >
              Watch
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const MultiplayerLobby: React.FC = () => {
  const { isAuthenticated, playerInfo } = useMultiplayerStore();

  useEffect(() => {
    // Auto-authenticate for demo purposes
    // In production, this would come from your auth system
    if (!isAuthenticated && !playerInfo) {
      const demoUser = {
        userId: 'demo-user-' + Date.now(),
        username: 'TestPlayer',
        rating: 1200
      };
      socketManager.authenticate(demoUser);
    }
  }, [isAuthenticated, playerInfo]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Multiplayer Chess</h1>
        <p className="text-gray-400">Play rated games against opponents worldwide</p>
      </div>

      <ConnectionStatus />
      <MatchmakingQueue />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TimeControlGrid />
        </div>
        <div>
          <LiveGamesList />
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