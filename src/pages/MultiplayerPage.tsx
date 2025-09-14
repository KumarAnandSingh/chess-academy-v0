import React from 'react';
import MultiplayerLobby from '../components/multiplayer/MultiplayerLobby';

const MultiplayerPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          ♟️ Live Multiplayer Chess
        </h1>
        <p className="text-lg text-gray-600">
          Play real-time chess games with players around the world
        </p>
      </div>

      <MultiplayerLobby />

      <div className="mt-8 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="font-bold text-blue-800 mb-2">Quick Match</h3>
            <p className="text-blue-600 text-sm">
              Get matched instantly with players of similar skill level
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
            <div className="text-3xl mb-2">🏆</div>
            <h3 className="font-bold text-green-800 mb-2">Ranked Games</h3>
            <p className="text-green-600 text-sm">
              Compete in ranked matches to climb the leaderboard
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
            <div className="text-3xl mb-2">👥</div>
            <h3 className="font-bold text-purple-800 mb-2">Private Rooms</h3>
            <p className="text-purple-600 text-sm">
              Create custom rooms to play with friends
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiplayerPage;