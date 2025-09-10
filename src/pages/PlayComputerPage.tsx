import React from 'react';
import { EnhancedPlayVsComputer } from '../components/chess/EnhancedPlayVsComputer';

const PlayComputerPage: React.FC = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      <EnhancedPlayVsComputer />
    </div>
  );
};

export default PlayComputerPage;