/**
 * Phase 0 Demo Page - Showcase core features
 * Demonstrates Stockfish integration, Daily Plan, and Bot games
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DailyPlan from '../components/DailyPlan';
import BotGame from '../components/chess/BotGame';
import CalibrationTest from '../components/calibration/CalibrationTest';

const Phase0Demo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'daily-plan' | 'bot-game' | 'calibration'>('daily-plan');
  const [searchParams] = useSearchParams();
  
  // Check URL params to set initial tab
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['daily-plan', 'bot-game', 'calibration'].includes(tab)) {
      setActiveTab(tab as 'daily-plan' | 'bot-game' | 'calibration');
    }
  }, [searchParams]);

  const tabs = [
    { id: 'daily-plan', label: 'Daily Plan', description: 'Solve 3 • Learn 1 • Play 1' },
    { id: 'bot-game', label: 'Bot Games', description: '10 difficulty levels with Stockfish' },
    { id: 'calibration', label: 'Calibration', description: '12-position strength test' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Chess Academy - Phase 0 Demo</h1>
              <p className="text-sm text-gray-500">Core "Learn-by-Playing" Features</p>
            </div>
            <div className="text-sm text-gray-500">
              Backend: <span className="text-green-600">●</span> Connected
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'daily-plan' | 'bot-game' | 'calibration')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div>{tab.label}</div>
                <div className="text-xs text-gray-400">{tab.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'daily-plan' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Daily Learning Plan</h2>
              <p className="text-gray-600">
                Your personalized daily chess improvement plan. Complete all three activities to maintain your streak and maximize learning.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <DailyPlan />
              </div>
              
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Phase 0 Features ✅</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                      Daily Plan API with "Solve 3 • Learn 1 • Play 1"
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                      Progress tracking with XP and streak system
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                      Hero message with estimated rating gain
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                      Analytics event tracking
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                      Stockfish WASM integration
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                      Database schema for calibration & bot games
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                      12-position calibration system with rating assessment
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Next: Phase 0 Completion</h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li>• Bot game API with 10 difficulty levels</li>
                    <li>• Basic Socratic coaching (Tier 1 & 2)</li>
                    <li>• Performance optimization baseline</li>
                    <li>• Mobile-responsive UI improvements</li>
                    <li>• User authentication integration</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-2">Success Criteria</h3>
                  <ul className="space-y-2 text-sm text-yellow-800">
                    <li>• ≥60% new users complete Daily Plan day-1</li>
                    <li>• D1≥40%, Crash-free ≥99.5%</li>
                    <li>• Users solve ≥5 puzzles in first session</li>
                    <li>• Board render &lt;16ms, puzzle load &lt;800ms</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'calibration' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Chess Strength Calibration</h2>
              <p className="text-gray-600">
                Take our 12-position assessment to determine your current tactical strength and identify areas for improvement.
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              <div className="xl:col-span-3">
                <CalibrationTest />
              </div>
              
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">How It Works</h3>
                  <ol className="space-y-2 text-sm">
                    <li className="flex">
                      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 flex-shrink-0">1</span>
                      <span>Solve 12 tactical positions of increasing difficulty</span>
                    </li>
                    <li className="flex">
                      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 flex-shrink-0">2</span>
                      <span>Each position has a time limit and tests specific motifs</span>
                    </li>
                    <li className="flex">
                      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 flex-shrink-0">3</span>
                      <span>Get your tactics rating (400-2200 ELO scale)</span>
                    </li>
                    <li className="flex">
                      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 flex-shrink-0">4</span>
                      <span>Receive personalized learning recommendations</span>
                    </li>
                  </ol>
                </div>

                <div className="bg-purple-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">Tactical Themes</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-white rounded px-2 py-1 text-center">Fork</div>
                    <div className="bg-white rounded px-2 py-1 text-center">Pin</div>
                    <div className="bg-white rounded px-2 py-1 text-center">Skewer</div>
                    <div className="bg-white rounded px-2 py-1 text-center">Discovery</div>
                    <div className="bg-white rounded px-2 py-1 text-center">Deflection</div>
                    <div className="bg-white rounded px-2 py-1 text-center">Decoy</div>
                    <div className="bg-white rounded px-2 py-1 text-center">Clearance</div>
                    <div className="bg-white rounded px-2 py-1 text-center">Zugzwang</div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">Benefits</h3>
                  <ul className="space-y-2 text-sm text-green-800">
                    <li>• Accurate assessment of your chess strength</li>
                    <li>• Personalized learning path recommendations</li>
                    <li>• Identification of tactical weaknesses</li>
                    <li>• Baseline for tracking improvement</li>
                    <li>• Optimal bot difficulty suggestions</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bot-game' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Play vs Chess Bots</h2>
              <p className="text-gray-600">
                Practice against 10 different difficulty levels powered by Stockfish engine. Each bot has unique personality and playing strength.
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2">
                <BotGame />
              </div>
              
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Bot Levels</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium">Level 1: Pawn</span>
                      <span className="text-gray-500">400 ELO</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium">Level 2: Knight</span>
                      <span className="text-gray-500">600 ELO</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium">Level 3: Bishop</span>
                      <span className="text-gray-500">800 ELO</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium">Level 4: Rook</span>
                      <span className="text-gray-500">1000 ELO</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium">Level 5: Queen</span>
                      <span className="text-gray-500">1200 ELO</span>
                    </div>
                    <div className="text-center pt-2">
                      <span className="text-xs text-gray-400">...and 5 more levels up to 2200 ELO</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">Features</h3>
                  <ul className="space-y-2 text-sm text-green-800">
                    <li>• Real-time Stockfish analysis</li>
                    <li>• Post-game "3 key moments" review</li>
                    <li>• Move time and evaluation display</li>
                    <li>• PGN capture for later analysis</li>
                    <li>• Adaptive difficulty progression</li>
                  </ul>
                </div>

                <div className="bg-purple-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">Coming Next</h3>
                  <ul className="space-y-2 text-sm text-purple-800">
                    <li>• Socratic coaching hints during games</li>
                    <li>• Tactical motif recognition</li>
                    <li>• Personalized bot recommendations</li>
                    <li>• Learning objectives per game</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Phase0Demo;