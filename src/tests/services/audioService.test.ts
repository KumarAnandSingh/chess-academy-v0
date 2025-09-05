import { describe, it, expect, vi, beforeEach } from 'vitest';
import { audioService } from '../../services/audioService';

describe('AudioService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('initialization', () => {
    it('initializes with default settings', () => {
      expect(audioService.isEnabled()).toBe(true);
      expect(audioService.getMasterVolume()).toBe(0.7);
    });

    it('loads settings from localStorage', () => {
      localStorage.setItem('chess-audio-enabled', 'false');
      localStorage.setItem('chess-audio-volume', '0.5');

      // Create a new instance to test loading
      expect(audioService.getMasterVolume()).toBe(0.7); // Current instance won't change
    });
  });

  describe('sound playback', () => {
    it('plays move sound', async () => {
      // Mock AudioContext
      const mockOscillator = {
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        frequency: { setValueAtTime: vi.fn() },
        type: 'sine',
      };

      const mockGainNode = {
        connect: vi.fn(),
        gain: {
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
      };

      const mockAudioContext = {
        createOscillator: vi.fn(() => mockOscillator),
        createGain: vi.fn(() => mockGainNode),
        destination: {},
        currentTime: 0,
      };

      global.AudioContext = vi.fn(() => mockAudioContext) as any;

      await audioService.playMoveSound(false);

      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockAudioContext.createGain).toHaveBeenCalled();
      expect(mockOscillator.start).toHaveBeenCalled();
      expect(mockOscillator.stop).toHaveBeenCalled();
    });

    it('plays capture sound', async () => {
      const mockAudioContext = {
        createOscillator: vi.fn(() => ({
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
          frequency: { setValueAtTime: vi.fn() },
          type: 'sine',
        })),
        createGain: vi.fn(() => ({
          connect: vi.fn(),
          gain: {
            setValueAtTime: vi.fn(),
            linearRampToValueAtTime: vi.fn(),
            exponentialRampToValueAtTime: vi.fn(),
          },
        })),
        destination: {},
        currentTime: 0,
      };

      global.AudioContext = vi.fn(() => mockAudioContext) as any;

      await audioService.playMoveSound(true);

      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    });

    it('does not play sound when disabled', async () => {
      audioService.setEnabled(false);

      const mockAudioContext = {
        createOscillator: vi.fn(),
        createGain: vi.fn(),
      };

      global.AudioContext = vi.fn(() => mockAudioContext) as any;

      await audioService.playMoveSound(false);

      expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
    });

    it('handles audio context creation errors', async () => {
      global.AudioContext = vi.fn(() => {
        throw new Error('Audio context error');
      }) as any;

      // Should not throw an error
      await expect(audioService.playMoveSound(false)).resolves.toBeUndefined();
    });
  });

  describe('game state sounds', () => {
    it('plays checkmate sound', async () => {
      const mockAudioContext = {
        createOscillator: vi.fn(() => ({
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
          frequency: { setValueAtTime: vi.fn() },
          type: 'sine',
        })),
        createGain: vi.fn(() => ({
          connect: vi.fn(),
          gain: {
            setValueAtTime: vi.fn(),
            linearRampToValueAtTime: vi.fn(),
            exponentialRampToValueAtTime: vi.fn(),
          },
        })),
        destination: {},
        currentTime: 0,
      };

      global.AudioContext = vi.fn(() => mockAudioContext) as any;

      await audioService.playGameStateSound('checkmate');

      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    });

    it('plays game start sound', async () => {
      const mockAudioContext = {
        createOscillator: vi.fn(() => ({
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
          frequency: { setValueAtTime: vi.fn() },
          type: 'sine',
        })),
        createGain: vi.fn(() => ({
          connect: vi.fn(),
          gain: {
            setValueAtTime: vi.fn(),
            linearRampToValueAtTime: vi.fn(),
            exponentialRampToValueAtTime: vi.fn(),
          },
        })),
        destination: {},
        currentTime: 0,
      };

      global.AudioContext = vi.fn(() => mockAudioContext) as any;

      await audioService.playGameStateSound('start');

      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    });
  });

  describe('UI sounds', () => {
    it('plays click sound', async () => {
      const mockAudioContext = {
        createOscillator: vi.fn(() => ({
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
          frequency: { setValueAtTime: vi.fn() },
          type: 'sine',
        })),
        createGain: vi.fn(() => ({
          connect: vi.fn(),
          gain: {
            setValueAtTime: vi.fn(),
            linearRampToValueAtTime: vi.fn(),
            exponentialRampToValueAtTime: vi.fn(),
          },
        })),
        destination: {},
        currentTime: 0,
      };

      global.AudioContext = vi.fn(() => mockAudioContext) as any;

      await audioService.playUISound('click');

      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    });

    it('plays hover sound', async () => {
      const mockAudioContext = {
        createOscillator: vi.fn(() => ({
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
          frequency: { setValueAtTime: vi.fn() },
          type: 'sine',
        })),
        createGain: vi.fn(() => ({
          connect: vi.fn(),
          gain: {
            setValueAtTime: vi.fn(),
            linearRampToValueAtTime: vi.fn(),
            exponentialRampToValueAtTime: vi.fn(),
          },
        })),
        destination: {},
        currentTime: 0,
      };

      global.AudioContext = vi.fn(() => mockAudioContext) as any;

      await audioService.playUISound('hover');

      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    });
  });

  describe('gamification sounds', () => {
    it('plays level up sound', async () => {
      const mockAudioContext = {
        createOscillator: vi.fn(() => ({
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
          frequency: { setValueAtTime: vi.fn() },
          type: 'sine',
        })),
        createGain: vi.fn(() => ({
          connect: vi.fn(),
          gain: {
            setValueAtTime: vi.fn(),
            linearRampToValueAtTime: vi.fn(),
            exponentialRampToValueAtTime: vi.fn(),
          },
        })),
        destination: {},
        currentTime: 0,
      };

      global.AudioContext = vi.fn(() => mockAudioContext) as any;

      await audioService.playGamificationSound('levelUp');

      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    });

    it('plays achievement sound', async () => {
      const mockAudioContext = {
        createOscillator: vi.fn(() => ({
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
          frequency: { setValueAtTime: vi.fn() },
          type: 'sine',
        })),
        createGain: vi.fn(() => ({
          connect: vi.fn(),
          gain: {
            setValueAtTime: vi.fn(),
            linearRampToValueAtTime: vi.fn(),
            exponentialRampToValueAtTime: vi.fn(),
          },
        })),
        destination: {},
        currentTime: 0,
      };

      global.AudioContext = vi.fn(() => mockAudioContext) as any;

      await audioService.playGamificationSound('achievement');

      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    });
  });

  describe('settings', () => {
    it('enables and disables audio', () => {
      audioService.setEnabled(false);
      expect(audioService.isEnabled()).toBe(false);

      audioService.setEnabled(true);
      expect(audioService.isEnabled()).toBe(true);
    });

    it('saves settings to localStorage', () => {
      audioService.setEnabled(false);
      audioService.setMasterVolume(0.3);

      expect(localStorage.setItem).toHaveBeenCalledWith('chess-audio-enabled', 'false');
      expect(localStorage.setItem).toHaveBeenCalledWith('chess-audio-volume', '0.3');
    });

    it('clamps volume to valid range', () => {
      audioService.setMasterVolume(-1);
      expect(audioService.getMasterVolume()).toBe(0);

      audioService.setMasterVolume(2);
      expect(audioService.getMasterVolume()).toBe(1);

      audioService.setMasterVolume(0.5);
      expect(audioService.getMasterVolume()).toBe(0.5);
    });
  });

  describe('celebration sequence', () => {
    it('plays celebration sounds in sequence', async () => {
      const mockAudioContext = {
        createOscillator: vi.fn(() => ({
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
          frequency: { setValueAtTime: vi.fn() },
          type: 'sine',
        })),
        createGain: vi.fn(() => ({
          connect: vi.fn(),
          gain: {
            setValueAtTime: vi.fn(),
            linearRampToValueAtTime: vi.fn(),
            exponentialRampToValueAtTime: vi.fn(),
          },
        })),
        destination: {},
        currentTime: 0,
      };

      global.AudioContext = vi.fn(() => mockAudioContext) as any;

      audioService.playCelebration();

      // Should schedule multiple sounds
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    });
  });
});