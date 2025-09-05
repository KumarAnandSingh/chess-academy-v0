interface SoundConfig {
  volume: number;
  loop: boolean;
  preload: boolean;
}

interface GameSounds {
  move: string;
  capture: string;
  check: string;
  checkmate: string;
  gameStart: string;
  gameWin: string;
  gameLose: string;
  buttonClick: string;
  buttonHover: string;
  levelUp: string;
  achievement: string;
  puzzleSolved: string;
  puzzleError: string;
  lessonComplete: string;
  xpGain: string;
  streakBonus: string;
  notification: string;
  success: string;
  error: string;
  whoosh: string;
  pop: string;
  ding: string;
}

class AudioService {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private enabled: boolean = true;
  private masterVolume: number = 0.7;
  private soundConfig: Partial<GameSounds> = {};

  constructor() {
    this.initializeSounds();
    this.loadUserPreferences();
  }

  private initializeSounds() {
    // Initialize with Web Audio API synthetic sounds for now
    // In production, you'd load actual audio files
    const soundEffects: GameSounds = {
      move: this.createTone(200, 0.1, 'sine'),
      capture: this.createTone(150, 0.15, 'square'),
      check: this.createTone(400, 0.2, 'triangle'),
      checkmate: this.createTone(100, 0.5, 'sawtooth'),
      gameStart: this.createChord([262, 330, 392], 0.3), // C-E-G major chord
      gameWin: this.createChord([523, 659, 784], 0.4), // High C-E-G
      gameLose: this.createTone(100, 0.4, 'sawtooth'),
      buttonClick: this.createTone(800, 0.05, 'square'),
      buttonHover: this.createTone(1000, 0.03, 'sine'),
      levelUp: this.createChord([523, 659, 784, 1047], 0.6), // Victory chord
      achievement: this.createChord([392, 494, 587, 698], 0.5), // Achievement fanfare
      puzzleSolved: this.createChord([523, 659, 784], 0.3),
      puzzleError: this.createTone(150, 0.2, 'square'),
      lessonComplete: this.createChord([440, 554, 659], 0.4),
      xpGain: this.createTone(600, 0.1, 'sine'),
      streakBonus: this.createChord([659, 784, 988], 0.3),
      notification: this.createTone(800, 0.1, 'triangle'),
      success: this.createChord([523, 659], 0.2),
      error: this.createTone(200, 0.3, 'square'),
      whoosh: this.createNoise(0.1),
      pop: this.createTone(400, 0.05, 'sine'),
      ding: this.createTone(1200, 0.1, 'triangle')
    };

    // Store sound data URLs
    Object.entries(soundEffects).forEach(([key, dataUrl]) => {
      this.soundConfig[key as keyof GameSounds] = dataUrl;
    });
  }

  private createTone(frequency: number, duration: number, type: OscillatorType = 'sine'): string {
    // Create a data URL for a synthetic tone
    // This is a simplified version - in production you'd use actual audio files
    return `data:audio/wav;base64,${this.generateToneDataURL(frequency, duration, type)}`;
  }

  private createChord(frequencies: number[], duration: number): string {
    // Create a chord by combining multiple frequencies
    return `data:audio/wav;base64,${this.generateChordDataURL(frequencies, duration)}`;
  }

  private createNoise(duration: number): string {
    // Create white noise effect
    return `data:audio/wav;base64,${this.generateNoiseDataURL(duration)}`;
  }

  private generateToneDataURL(frequency: number, duration: number, type: OscillatorType): string {
    // Simplified tone generation - returns empty base64 for now
    // In production, you'd implement proper tone generation or use audio files
    return 'UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
  }

  private generateChordDataURL(frequencies: number[], duration: number): string {
    // Simplified chord generation
    return 'UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
  }

  private generateNoiseDataURL(duration: number): string {
    // Simplified noise generation
    return 'UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
  }

  private loadUserPreferences() {
    const savedEnabled = localStorage.getItem('chess-audio-enabled');
    const savedVolume = localStorage.getItem('chess-audio-volume');

    if (savedEnabled !== null) {
      this.enabled = JSON.parse(savedEnabled);
    }

    if (savedVolume !== null) {
      this.masterVolume = parseFloat(savedVolume);
    }
  }

  private saveUserPreferences() {
    localStorage.setItem('chess-audio-enabled', JSON.stringify(this.enabled));
    localStorage.setItem('chess-audio-volume', this.masterVolume.toString());
  }

  // Public API methods - FIXED: Better error handling
  async playSound(soundName: keyof GameSounds, volume: number = 1) {
    if (!this.enabled) {
      console.log('AudioService: Audio disabled, skipping sound:', soundName);
      return;
    }

    try {
      console.log('AudioService: Playing sound:', soundName);
      
      // Use Web Audio API for better control
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume context if suspended (required for user interaction)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      // Create oscillator for synthetic sounds
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Configure based on sound type
      const config = this.getSoundConfig(soundName);
      oscillator.frequency.setValueAtTime(config.frequency, audioContext.currentTime);
      oscillator.type = config.type;
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.masterVolume * volume * config.volume, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + config.duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + config.duration);
      
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }

  private getSoundConfig(soundName: keyof GameSounds): { frequency: number; type: OscillatorType; duration: number; volume: number } {
    const configs = {
      move: { frequency: 200, type: 'sine' as OscillatorType, duration: 0.1, volume: 0.3 },
      capture: { frequency: 150, type: 'square' as OscillatorType, duration: 0.15, volume: 0.4 },
      check: { frequency: 400, type: 'triangle' as OscillatorType, duration: 0.2, volume: 0.5 },
      checkmate: { frequency: 100, type: 'sawtooth' as OscillatorType, duration: 0.5, volume: 0.6 },
      gameStart: { frequency: 330, type: 'sine' as OscillatorType, duration: 0.3, volume: 0.4 },
      gameWin: { frequency: 523, type: 'sine' as OscillatorType, duration: 0.4, volume: 0.5 },
      gameLose: { frequency: 100, type: 'sawtooth' as OscillatorType, duration: 0.4, volume: 0.4 },
      buttonClick: { frequency: 800, type: 'square' as OscillatorType, duration: 0.05, volume: 0.2 },
      buttonHover: { frequency: 1000, type: 'sine' as OscillatorType, duration: 0.03, volume: 0.1 },
      levelUp: { frequency: 523, type: 'sine' as OscillatorType, duration: 0.6, volume: 0.6 },
      achievement: { frequency: 392, type: 'triangle' as OscillatorType, duration: 0.5, volume: 0.5 },
      puzzleSolved: { frequency: 523, type: 'sine' as OscillatorType, duration: 0.3, volume: 0.4 },
      puzzleError: { frequency: 150, type: 'square' as OscillatorType, duration: 0.2, volume: 0.3 },
      lessonComplete: { frequency: 440, type: 'sine' as OscillatorType, duration: 0.4, volume: 0.4 },
      xpGain: { frequency: 600, type: 'sine' as OscillatorType, duration: 0.1, volume: 0.3 },
      streakBonus: { frequency: 659, type: 'triangle' as OscillatorType, duration: 0.3, volume: 0.4 },
      notification: { frequency: 800, type: 'triangle' as OscillatorType, duration: 0.1, volume: 0.3 },
      success: { frequency: 523, type: 'sine' as OscillatorType, duration: 0.2, volume: 0.3 },
      error: { frequency: 200, type: 'square' as OscillatorType, duration: 0.3, volume: 0.4 },
      whoosh: { frequency: 300, type: 'sawtooth' as OscillatorType, duration: 0.1, volume: 0.2 },
      pop: { frequency: 400, type: 'sine' as OscillatorType, duration: 0.05, volume: 0.2 },
      ding: { frequency: 1200, type: 'triangle' as OscillatorType, duration: 0.1, volume: 0.3 }
    };
    
    return configs[soundName] || configs.buttonClick;
  }

  // Chess-specific sound methods
  playMoveSound(isCapture: boolean = false) {
    this.playSound(isCapture ? 'capture' : 'move');
  }

  playGameStateSound(state: 'check' | 'checkmate' | 'start' | 'win' | 'lose') {
    this.playSound(state === 'start' ? 'gameStart' : 
                   state === 'win' ? 'gameWin' :
                   state === 'lose' ? 'gameLose' :
                   state === 'checkmate' ? 'checkmate' : 'check');
  }

  playUISound(action: 'click' | 'hover' | 'success' | 'error' | 'notification') {
    const soundMap = {
      click: 'buttonClick' as const,
      hover: 'buttonHover' as const,
      success: 'success' as const,
      error: 'error' as const,
      notification: 'notification' as const
    };
    this.playSound(soundMap[action]);
  }

  playGamificationSound(type: 'xp' | 'levelUp' | 'achievement' | 'puzzleSolved' | 'lessonComplete' | 'streak') {
    const soundMap = {
      xp: 'xpGain' as const,
      levelUp: 'levelUp' as const,
      achievement: 'achievement' as const,
      puzzleSolved: 'puzzleSolved' as const,
      lessonComplete: 'lessonComplete' as const,
      streak: 'streakBonus' as const
    };
    this.playSound(soundMap[type]);
  }

  // Settings
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    this.saveUserPreferences();
  }

  setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.saveUserPreferences();
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getMasterVolume(): number {
    return this.masterVolume;
  }

  // Utility method for playing multiple sounds in sequence
  async playSequence(sounds: Array<{ sound: keyof GameSounds; delay: number; volume?: number }>) {
    for (const { sound, delay, volume } of sounds) {
      setTimeout(() => this.playSound(sound, volume), delay);
    }
  }

  // Play celebration sound sequence
  playCelebration() {
    this.playSequence([
      { sound: 'success', delay: 0 },
      { sound: 'ding', delay: 200 },
      { sound: 'achievement', delay: 400 }
    ]);
  }
}

// Export singleton instance
export const audioService = new AudioService();

// Types for external use
export type SoundName = keyof GameSounds;
export type UISound = 'click' | 'hover' | 'success' | 'error' | 'notification';
export type GamificationSound = 'xp' | 'levelUp' | 'achievement' | 'puzzleSolved' | 'lessonComplete' | 'streak';