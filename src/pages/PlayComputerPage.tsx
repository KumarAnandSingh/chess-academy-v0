import React from 'react';
import { EnhancedPlayVsComputer } from '../components/chess/EnhancedPlayVsComputer';

const PlayComputerPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <EnhancedPlayVsComputer />
    </div>
  );
};

export default PlayComputerPage;