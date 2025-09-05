import React, { useState } from 'react';
import { aiCoach } from '../../services/aiCoach';

interface CoachSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CoachSettings: React.FC<CoachSettingsProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!apiKey.trim()) {
      setError('Please enter a Claude API key');
      return;
    }

    if (!apiKey.startsWith('sk-ant-')) {
      setError('Claude API keys should start with "sk-ant-"');
      return;
    }

    aiCoach.setApiKey(apiKey.trim());
    setSaved(true);
    setError('');
    
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 2000);
  };

  const handleRemoveKey = () => {
    aiCoach.setApiKey('');
    setApiKey('');
    setSaved(false);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">🤖 Claude Coach Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-3">
              Enter your Claude API key to enable real AI coaching. Without an API key, 
              you'll see demo responses.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
              <p className="text-xs text-blue-800">
                <strong>How to get a Claude API key:</strong><br />
                1. Visit <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="underline">console.anthropic.com</a><br />
                2. Sign up or log in to your account<br />
                3. Navigate to API Keys section<br />
                4. Create a new API key<br />
                5. Copy and paste it here
              </p>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Claude API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setError('');
                setSaved(false);
              }}
              placeholder="sk-ant-..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            
            {error && (
              <p className="text-red-600 text-xs mt-1">{error}</p>
            )}
            
            {saved && (
              <p className="text-green-600 text-xs mt-1">✓ API key saved successfully!</p>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <p className="text-xs text-yellow-800">
              <strong>Privacy Note:</strong> Your API key is stored locally in your browser 
              and never sent to our servers. It's only used to make direct requests to Claude's API.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Save API Key
            </button>
            
            {aiCoach.isApiKeyConfigured() && (
              <button
                onClick={handleRemoveKey}
                className="px-4 py-2 text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
              >
                Remove Key
              </button>
            )}
          </div>

          <div className="text-center">
            <button
              onClick={onClose}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Continue with Demo Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};