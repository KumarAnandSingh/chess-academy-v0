import React, { useState, useEffect } from 'react';
import { socketManager } from '../../services/socketManager';

const MultiplayerLobby: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>('connecting');
  const [socketId, setSocketId] = useState<string>('');

  useEffect(() => {
    // Listen for connection status
    socketManager.on('connection_status', (data: any) => {
      setConnectionStatus(data.connected ? 'connected' : 'disconnected');
      if (data.connected) {
        setSocketId(socketManager.getConnectionId() || '');
      }
    });

    socketManager.on('connection_error', (data: any) => {
      setConnectionStatus('error');
      console.error('Connection error:', data.error);
    });

    // Check initial connection
    if (socketManager.isConnected()) {
      setConnectionStatus('connected');
      setSocketId(socketManager.getConnectionId() || '');
    }

    return () => {
      socketManager.off('connection_status');
      socketManager.off('connection_error');
    };
  }, []);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-600';
      case 'connecting':
        return 'text-yellow-600';
      case 'error':
      case 'disconnected':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return '✅';
      case 'connecting':
        return '🔄';
      case 'error':
      case 'disconnected':
        return '❌';
      default:
        return '⚪';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">🚀 Multiplayer Chess</h2>

      <div className="mb-6">
        <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
          <span className="text-2xl">{getStatusIcon()}</span>
          <span className="font-semibold capitalize">
            {connectionStatus === 'connecting' ? 'Connecting to server...' :
             connectionStatus === 'connected' ? 'Connected to server!' :
             connectionStatus === 'error' ? 'Connection failed' :
             'Disconnected from server'}
          </span>
        </div>

        {connectionStatus === 'connected' && socketId && (
          <div className="mt-2 text-sm text-gray-600">
            Socket ID: {socketId.substring(0, 8)}...
          </div>
        )}

        {connectionStatus === 'connected' && (
          <div className="mt-3 text-sm text-green-700">
            🎯 Backend: https://backend-coral-kappa-57.vercel.app
          </div>
        )}
      </div>

      <div className="space-y-3">
        {connectionStatus === 'connected' ? (
          <>
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              🎮 Find Match
            </button>
            <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
              ⚡ Quick Game
            </button>
            <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
              👥 Join Room
            </button>
          </>
        ) : (
          <button
            onClick={() => socketManager.connect()}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
          >
            🔄 Reconnect
          </button>
        )}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-1">✨ Features Available:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Real-time multiplayer games</li>
          <li>• Live opponent matching</li>
          <li>• Socket.IO connection</li>
          <li>• Production backend ready</li>
        </ul>
      </div>
    </div>
  );
};

export default MultiplayerLobby;