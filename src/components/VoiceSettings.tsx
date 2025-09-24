/**
 * Voice Settings UI Component - "Talkative Coach" Controls
 * MIT Licensed - Chess Academy Voice Play System
 */

import React, { useState, useEffect } from 'react';
import { audioBus, AudioConfig } from '../services/audioBus';

export const VoiceSettings: React.FC = () => {
  const [config, setConfig] = useState<AudioConfig>(audioBus.getConfig());
  const [isTestPlaying, setIsTestPlaying] = useState(false);
  const [audioStats, setAudioStats] = useState<any>({});

  useEffect(() => {
    // Load initial config and stats
    setConfig(audioBus.getConfig());
    setAudioStats(audioBus.getStats());
  }, []);

  const updateConfig = (updates: Partial<AudioConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    audioBus.updateConfig(newConfig);
  };

  const playTestVoice = async () => {
    if (isTestPlaying) return;

    setIsTestPlaying(true);
    try {
      await audioBus.testAudio();
      setTimeout(() => setIsTestPlaying(false), 3000); // Reset after 3 seconds
    } catch (error) {
      console.error('Test audio failed:', error);
      setIsTestPlaying(false);
    }
  };

  const getTalkativeLevelDescription = (level: string): string => {
    switch (level) {
      case 'low':
        return 'Critical moves only (blunders, checkmate, excellent moves)';
      case 'medium':
        return 'Good moves and mistakes (balanced coaching)';
      case 'high':
        return 'All moves with educational tips (maximum coaching)';
      default:
        return '';
    }
  };

  const getTalkativeLevelIcon = (level: string): string => {
    switch (level) {
      case 'low': return '🤫';
      case 'medium': return '🎯';
      case 'high': return '🗣️';
      default: return '🔊';
    }
  };

  return (
    <div className=\"voice-settings bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md mx-auto\">
      {/* Header */}
      <div className=\"mb-6\">
        <h3 className=\"text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2\">
          🎤 Voice Coach Settings
        </h3>
        <p className=\"text-sm text-gray-600 dark:text-gray-400 mt-1\">
          Customize your chess coaching experience
        </p>
      </div>

      {/* Master Voice Toggle */}
      <div className=\"mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700\">
        <label className=\"flex items-center justify-between cursor-pointer\">
          <div className=\"flex items-center space-x-3\">
            <div className=\"text-2xl\">
              {config.voiceEnabled ? '🔊' : '🔇'}
            </div>
            <div>
              <span className=\"font-semibold text-gray-900 dark:text-white\">
                Enable Voice Coach
              </span>
              <p className=\"text-sm text-gray-600 dark:text-gray-400\">
                Turn on/off all voice guidance
              </p>
            </div>
          </div>
          <div className=\"relative\">
            <input
              type=\"checkbox\"
              checked={config.voiceEnabled}
              onChange={(e) => updateConfig({ voiceEnabled: e.target.checked })}
              className=\"sr-only\"
            />
            <div className={`w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${
              config.voiceEnabled
                ? 'bg-blue-600'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                config.voiceEnabled ? 'translate-x-6' : 'translate-x-0.5'
              } translate-y-0.5`}></div>
            </div>
          </div>
        </label>
      </div>

      {/* Talkative Coach Level */}
      <div className=\"mb-6\">
        <label className=\"block text-sm font-semibold text-gray-900 dark:text-white mb-3\">
          🎯 Talkative Coach Level
        </label>
        <div className=\"space-y-3\">
          {(['low', 'medium', 'high'] as const).map((level) => (
            <label key={level} className={`flex items-start space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
              config.talkativeLevel === level
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}>
              <input
                type=\"radio\"
                name=\"talkativeLevel\"
                value={level}
                checked={config.talkativeLevel === level}
                onChange={(e) => updateConfig({ talkativeLevel: e.target.value as 'low' | 'medium' | 'high' })}
                className=\"mt-1\"
              />
              <div className=\"flex-1\">
                <div className=\"flex items-center gap-2\">
                  <span className=\"text-lg\">{getTalkativeLevelIcon(level)}</span>
                  <span className=\"font-medium text-gray-900 dark:text-white capitalize\">
                    {level}
                  </span>
                </div>
                <p className=\"text-sm text-gray-600 dark:text-gray-400 mt-1\">
                  {getTalkativeLevelDescription(level)}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Voice Volume */}
      <div className=\"mb-6\">
        <label className=\"block text-sm font-semibold text-gray-900 dark:text-white mb-2\">
          🎤 Voice Volume: {Math.round(config.voiceVolume * 100)}%
        </label>
        <div className=\"flex items-center space-x-3\">
          <span className=\"text-gray-500\">🔉</span>
          <input
            type=\"range\"
            min=\"0\"
            max=\"1\"
            step=\"0.1\"
            value={config.voiceVolume}
            onChange={(e) => updateConfig({ voiceVolume: parseFloat(e.target.value) })}
            disabled={!config.voiceEnabled}
            className={`flex-1 h-2 rounded-lg appearance-none cursor-pointer ${
              config.voiceEnabled
                ? 'bg-gray-200 dark:bg-gray-700'
                : 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed'
            }`}
            style={{
              background: config.voiceEnabled
                ? `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${config.voiceVolume * 100}%, #E5E7EB ${config.voiceVolume * 100}%, #E5E7EB 100%)`
                : undefined
            }}
          />
          <span className=\"text-gray-500\">🔊</span>
        </div>
      </div>

      {/* Sound Effects Toggle */}
      <div className=\"mb-6\">
        <label className=\"flex items-center justify-between cursor-pointer p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50\">
          <div className=\"flex items-center space-x-3\">
            <span className=\"text-xl\">🎵</span>
            <div>
              <span className=\"font-medium text-gray-900 dark:text-white\">
                Sound Effects
              </span>
              <p className=\"text-sm text-gray-600 dark:text-gray-400\">
                Move sounds, captures, checks
              </p>
            </div>
          </div>
          <input
            type=\"checkbox\"
            checked={config.sfxEnabled}
            onChange={(e) => updateConfig({ sfxEnabled: e.target.checked })}
            className=\"w-4 h-4 text-blue-600 rounded focus:ring-blue-500\"
          />
        </label>
      </div>

      {/* SFX Volume */}
      {config.sfxEnabled && (
        <div className=\"mb-6\">
          <label className=\"block text-sm font-semibold text-gray-900 dark:text-white mb-2\">
            🎵 Sound Effects: {Math.round(config.sfxVolume * 100)}%
          </label>
          <input
            type=\"range\"
            min=\"0\"
            max=\"1\"
            step=\"0.1\"
            value={config.sfxVolume}
            onChange={(e) => updateConfig({ sfxVolume: parseFloat(e.target.value) })}
            className=\"w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer\"
            style={{
              background: `linear-gradient(to right, #10B981 0%, #10B981 ${config.sfxVolume * 100}%, #E5E7EB ${config.sfxVolume * 100}%, #E5E7EB 100%)`
            }}
          />
        </div>
      )}

      {/* Test Audio Button */}
      <div className=\"mb-6\">
        <button
          onClick={playTestVoice}
          disabled={isTestPlaying || !config.voiceEnabled}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
            config.voiceEnabled && !isTestPlaying
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          }`}
        >
          {isTestPlaying ? (
            <>
              <div className=\"animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent\"></div>
              Testing Voice...
            </>
          ) : (
            <>
              <span>🎤</span>
              Test Voice Coach
            </>
          )}
        </button>
      </div>

      {/* Audio System Status */}
      <div className=\"bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg\">
        <h4 className=\"text-sm font-semibold text-gray-900 dark:text-white mb-2\">
          📊 Audio System Status
        </h4>
        <div className=\"space-y-1 text-sm text-gray-600 dark:text-gray-400\">
          <div className=\"flex justify-between\">
            <span>Initialization:</span>
            <span className={audioStats.initialized ? 'text-green-600' : 'text-red-600'}>
              {audioStats.initialized ? '✓ Ready' : '✗ Not Ready'}
            </span>
          </div>
          <div className=\"flex justify-between\">
            <span>Sound Effects:</span>
            <span>{audioStats.sfxLoaded || 0} loaded</span>
          </div>
          <div className=\"flex justify-between\">
            <span>Voice Cache:</span>
            <span>{audioStats.voiceCached || 0} cached</span>
          </div>
          {audioStats.phrasebookVersion && (
            <div className=\"flex justify-between\">
              <span>Phrasebook:</span>
              <span>v{audioStats.phrasebookVersion}</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className=\"mt-4 flex gap-2\">
        <button
          onClick={() => updateConfig({
            talkativeLevel: 'low',
            voiceVolume: 0.5,
            sfxVolume: 0.3
          })}
          className=\"flex-1 px-3 py-2 text-xs bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 rounded-md hover:bg-yellow-200 dark:hover:bg-yellow-900/40 transition-colors\"
        >
          🤫 Quiet Mode
        </button>
        <button
          onClick={() => updateConfig({
            talkativeLevel: 'high',
            voiceVolume: 0.8,
            sfxVolume: 0.6
          })}
          className=\"flex-1 px-3 py-2 text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors\"
        >
          🗣️ Full Coach
        </button>
        <button
          onClick={() => setConfig(audioBus.getConfig())}
          className=\"px-3 py-2 text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors\"
        >
          🔄 Reset
        </button>
      </div>
    </div>
  );
};