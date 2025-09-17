import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ImprovedLiveChessGame from '../components/multiplayer/ImprovedLiveChessGame';
import { Button } from '../components/ui/button';
import { ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';
import { socketManager } from '../services/socketManager';

const GamePage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Enhanced connection monitoring for game page transitions
  useEffect(() => {
    console.log('🎮 GamePage mounted for gameId:', gameId);
    console.log('🔍 Initial connection state:', socketManager.getConnectionDiagnostics());

    // Enhanced connection check with health verification
    if (socketManager.isConnected() && socketManager.isConnectionHealthy()) {
      console.log('✅ Socket connected and healthy, proceeding to game');
      setIsLoading(false);
    } else if (socketManager.isConnected() && !socketManager.isConnectionHealthy()) {
      console.log('⚠️ Socket connected but unhealthy, forcing reconnection');
      handleConnectionRetry();
    } else {
      console.log('⚠️ Socket not connected on GamePage load, attempting connection...');
      handleConnectionRetry();
    }

    // Enhanced connection status monitoring
    const connectionCallback = (data: { connected: boolean; reason?: string }) => {
      console.log('🔗 GamePage connection status:', data);
      console.log('🔍 Connection diagnostics:', socketManager.getConnectionDiagnostics());

      if (data.connected && socketManager.isConnectionHealthy()) {
        console.log('✅ Connection restored and healthy');
        setConnectionError(null);
        setIsLoading(false);
        setRetryCount(0);
      } else if (data.connected && !socketManager.isConnectionHealthy()) {
        console.log('⚠️ Connection exists but unhealthy, forcing health check');
        setTimeout(() => {
          if (!socketManager.isConnectionHealthy()) {
            handleConnectionRetry();
          }
        }, 2000);
      } else {
        console.log('❌ Connection lost or failed');
        setConnectionError(data.reason || 'Connection lost');

        // Auto-retry connection after brief delay
        if (retryCount < 3) {
          setTimeout(() => {
            handleConnectionRetry();
          }, 2000 * (retryCount + 1)); // Exponential backoff
        }
      }
    };

    socketManager.on('connection_status', connectionCallback);

    return () => {
      socketManager.removeCallback('connection_status', connectionCallback);
      console.log('🧹 GamePage cleanup completed');
    };
  }, [gameId, retryCount]);

  const handleConnectionRetry = () => {
    console.log('🔄 GamePage: Attempting connection retry', retryCount + 1);
    setRetryCount(prev => prev + 1);
    setIsLoading(true);
    setConnectionError(null);

    // Always force reconnect to ensure clean state
    console.log('🔍 Current connection state before retry:', socketManager.getConnectionDiagnostics());
    socketManager.forceReconnect();

    // Monitor for successful reconnection
    const reconnectMonitor = setInterval(() => {
      if (socketManager.isConnected() && socketManager.isConnectionHealthy()) {
        console.log('✅ Reconnection successful, clearing monitor');
        clearInterval(reconnectMonitor);
      }
    }, 1000);

    // Clean up monitor after 30 seconds
    setTimeout(() => {
      clearInterval(reconnectMonitor);
    }, 30000);
  };

  const handleBackToLobby = () => {
    console.log('🔙 Navigating back to multiplayer lobby');
    navigate('/multiplayer');
  };

  if (!gameId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Invalid Game</h2>
          <p className="text-slate-400 mb-4">No game ID provided.</p>
          <Button
            onClick={handleBackToLobby}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Multiplayer
          </Button>
        </div>
      </div>
    );
  }

  // Show loading state while establishing connection
  if (isLoading && !connectionError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Loading Game...
          </h2>
          <p className="text-slate-400 mb-4">
            Establishing connection to game server
          </p>
          <p className="text-sm text-slate-500">
            Game ID: {gameId}
          </p>
        </div>
      </div>
    );
  }

  // Show connection error with retry option
  if (connectionError && retryCount >= 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Connection Failed</h2>
          <p className="text-slate-400 mb-4">
            Unable to connect to the game server after multiple attempts.
          </p>
          <p className="text-sm text-red-400 mb-6">
            Error: {connectionError}
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={handleConnectionRetry}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button
              onClick={handleBackToLobby}
              variant="outline"
              className="border-slate-600 hover:bg-slate-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Lobby
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Back Button - Positioned outside the game component */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          onClick={handleBackToLobby}
          variant="outline"
          size="sm"
          className="bg-slate-800/90 border-slate-600 hover:bg-slate-700 text-white shadow-lg backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Lobby
        </Button>
      </div>

      {/* Connection Status Indicator */}
      {connectionError && retryCount < 3 && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Reconnecting... (Attempt {retryCount}/3)
          </div>
        </div>
      )}

      {/* Game Component */}
      <ImprovedLiveChessGame gameId={gameId} />
    </div>
  );
};

export default GamePage;