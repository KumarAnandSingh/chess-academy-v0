import React, { useState, useEffect } from 'react';
import { socketManager } from '../../services/socketManager';
import SimpleMultiplayerLobby from './SimpleMultiplayerLobby';

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
  return <SimpleMultiplayerLobby />;
};

export default MultiplayerLobby;