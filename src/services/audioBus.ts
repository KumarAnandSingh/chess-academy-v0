/**
 * Chess Academy AudioBus Service - MIT Licensed
 * Handles SFX + Voice Cache + Mute Toggle for Voice Play System
 */

export interface AudioConfig {
  voiceEnabled: boolean;
  sfxEnabled: boolean;
  talkativeLevel: 'low' | 'medium' | 'high';
  voiceVolume: number;
  sfxVolume: number;
  masterVolume: number;
}

export interface VoiceRequest {
  key: string;
  text: string;
  category: 'positive' | 'warning' | 'neutral' | 'celebration' | 'educational';
  priority: 'low' | 'medium' | 'high' | 'critical';
  variables?: Record<string, string>;
}

export interface SFXRequest {
  key: 'positive' | 'warning' | 'blunder' | 'move' | 'capture' | 'check' | 'mate' | 'castle';
  volume?: number;
  delay?: number;
}

export class AudioBusService {
  private audioContext: AudioContext | null = null;
  private sfxBuffers: Map<string, AudioBuffer> = new Map();
  private voiceCache: Map<string, HTMLAudioElement> = new Map();
  private phrasebook: any = null;

  private config: AudioConfig = {
    voiceEnabled: true,
    sfxEnabled: true,
    talkativeLevel: 'medium',
    voiceVolume: 0.8,
    sfxVolume: 0.6,
    masterVolume: 1.0
  };

  private lastVoicePlayTime = 0;
  private voiceCooldownMs = 2000;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('Initializing Chess Academy AudioBus...');

      // Initialize Web Audio Context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Load configuration from localStorage
      this.loadConfig();

      // Load phrasebook
      await this.loadPhrasebook();

      // Preload SFX
      await this.preloadSFX();

      // Preload common voice lines
      await this.preloadCommonVoiceLines();

      this.isInitialized = true;
      console.log('✓ AudioBus initialized successfully');

    } catch (error) {
      console.error('AudioBus initialization failed:', error);
      throw error;
    }
  }

  /**
   * Load phrasebook configuration
   */
  private async loadPhrasebook(): Promise<void> {
    try {
      const response = await fetch('/phrasebook.json');
      this.phrasebook = await response.json();
      console.log(`✓ Loaded phrasebook v${this.phrasebook.version}`);
    } catch (error) {
      console.error('Failed to load phrasebook:', error);
      throw new Error('Phrasebook required for voice coaching');
    }
  }

  /**
   * Preload all SFX files using Web Audio API
   */
  private async preloadSFX(): Promise<void> {
    const sfxFiles = [
      'positive.ogg',    // Good move, success
      'warning.ogg',     // Warning, caution
      'blunder.ogg',     // Blunder, mistake
      'move.ogg',        // Regular move
      'capture.ogg',     // Piece capture
      'check.ogg',       // Check announcement
      'mate.ogg',        // Checkmate
      'castle.ogg'       // Castling move
    ];

    for (const file of sfxFiles) {
      try {
        const response = await fetch(`/sfx/${file}`);
        const arrayBuffer = await response.arrayBuffer();

        if (this.audioContext) {
          const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
          const key = file.replace('.ogg', '');
          this.sfxBuffers.set(key, audioBuffer);
          console.log(`✓ Loaded SFX: ${key}`);
        }
      } catch (error) {
        console.warn(`Failed to load SFX: ${file}`, error);
      }
    }
  }

  /**
   * Preload common voice lines for faster playback
   */
  private async preloadCommonVoiceLines(): Promise<void> {
    const commonKeys = [
      'GOOD_MOVE_1',
      'EXCELLENT_1',
      'CHECK',
      'CHECKMATE',
      'HANGING_WARNING',
      'ENCOURAGEMENT_1'
    ];

    for (const key of commonKeys) {
      try {
        const audio = new Audio(`/audio/coach/${key}_en_US_lessac.mp3`);
        audio.preload = 'auto';
        audio.volume = 0; // Preload silently

        await new Promise((resolve, reject) => {
          audio.addEventListener('canplaythrough', resolve, { once: true });
          audio.addEventListener('error', reject, { once: true });
        });

        this.voiceCache.set(key, audio);
        console.log(`✓ Preloaded voice: ${key}`);

      } catch (error) {
        console.warn(`Failed to preload voice: ${key}`, error);
      }
    }
  }

  /**
   * Play sound effect with Web Audio API (low latency)
   */
  async playSFX(request: SFXRequest): Promise<void> {
    if (!this.config.sfxEnabled || !this.audioContext) return;

    const buffer = this.sfxBuffers.get(request.key);
    if (!buffer) {
      console.warn(`SFX not found: ${request.key}`);
      return;
    }

    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = buffer;

      // Calculate final volume
      const volume = (request.volume ?? 1.0) * this.config.sfxVolume * this.config.masterVolume;
      gainNode.gain.value = Math.max(0, Math.min(1, volume));

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Apply delay if specified
      const when = this.audioContext.currentTime + (request.delay ?? 0);
      source.start(when);

    } catch (error) {
      console.warn(`SFX playback failed: ${request.key}`, error);
    }
  }

  /**
   * Play voice coaching with fallback to Web Speech API
   */
  async playVoice(request: VoiceRequest): Promise<void> {
    if (!this.config.voiceEnabled) return;

    // Check cooldown period
    const now = Date.now();
    if (now - this.lastVoicePlayTime < this.voiceCooldownMs) {
      console.log('Voice cooldown active, skipping');
      return;
    }

    // Check talkative level
    if (!this.shouldPlayVoice(request)) {
      console.log(`Voice filtered by talkative level: ${this.config.talkativeLevel}`);
      return;
    }

    // Process text template with variables
    const processedText = this.processTextTemplate(request.text, request.variables || {});

    // Try pre-rendered TTS first
    const success = await this.playPrerenderedVoice(request.key, processedText);

    if (!success && 'speechSynthesis' in window) {
      // Fallback to browser TTS
      this.playBrowserTTS(processedText);
    }

    this.lastVoicePlayTime = now;
  }

  /**
   * Determine if voice should play based on talkative level
   */
  private shouldPlayVoice(request: VoiceRequest): boolean {
    const level = this.config.talkativeLevel;
    const triggers = this.phrasebook?.talkative_levels?.[level]?.triggers;

    if (!triggers) return false;

    if (triggers === 'all') return true;

    if (Array.isArray(triggers)) {
      return triggers.includes(request.key) ||
             request.priority === 'critical' ||
             (request.priority === 'high' && level !== 'low');
    }

    return false;
  }

  /**
   * Play pre-rendered TTS audio file
   */
  private async playPrerenderedVoice(key: string, text: string): Promise<boolean> {
    try {
      let audio = this.voiceCache.get(key);

      if (!audio) {
        // Try to load from server
        const response = await fetch(`/audio/coach/${key}_en_US_lessac.mp3`);
        if (!response.ok) return false;

        audio = new Audio(`/audio/coach/${key}_en_US_lessac.mp3`);
        this.voiceCache.set(key, audio);
      }

      // Reset audio to beginning and set volume
      audio.currentTime = 0;
      audio.volume = this.config.voiceVolume * this.config.masterVolume;

      await audio.play();
      console.log(`🎤 Played voice: ${key}`);
      return true;

    } catch (error) {
      console.warn(`Pre-rendered voice failed: ${key}`, error);
      return false;
    }
  }

  /**
   * Fallback to browser Web Speech API
   */
  private playBrowserTTS(text: string): void {
    try {
      // Cancel any ongoing speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = this.config.voiceVolume * this.config.masterVolume;

      // Try to find a good English voice
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(v =>
        v.lang.startsWith('en') &&
        (v.name.includes('Natural') || v.name.includes('Premium') || v.name.includes('Enhanced'))
      );

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      speechSynthesis.speak(utterance);
      console.log(`🗣️ Browser TTS: "${text}"`);

    } catch (error) {
      console.warn('Browser TTS failed:', error);
    }
  }

  /**
   * Process text template with variables
   */
  private processTextTemplate(template: string, variables: Record<string, string>): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return variables[key] || match;
    });
  }

  /**
   * Get random phrase from phrasebook
   */
  getRandomPhrase(key: string, variables: Record<string, string> = {}): string {
    const phrase = this.phrasebook?.phrases?.[key];
    if (!phrase) return `[${key}]`;

    const templates = phrase.templates;
    if (!Array.isArray(templates) || templates.length === 0) return `[${key}]`;

    const template = templates[Math.floor(Math.random() * templates.length)];
    return this.processTextTemplate(template, variables);
  }

  /**
   * Combined play method for convenience
   */
  async playChessAudio(
    sfx?: SFXRequest,
    voice?: VoiceRequest,
    delay: number = 0
  ): Promise<void> {
    // Play SFX immediately (low latency)
    if (sfx) {
      await this.playSFX(sfx);
    }

    // Play voice after delay
    if (voice && delay > 0) {
      setTimeout(() => this.playVoice(voice), delay);
    } else if (voice) {
      await this.playVoice(voice);
    }
  }

  /**
   * Update audio configuration
   */
  updateConfig(newConfig: Partial<AudioConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
    console.log('AudioBus config updated:', this.config);
  }

  /**
   * Get current configuration
   */
  getConfig(): AudioConfig {
    return { ...this.config };
  }

  /**
   * Mute/unmute all audio
   */
  setMasterMute(muted: boolean): void {
    this.updateConfig({
      masterVolume: muted ? 0 : 1,
      voiceEnabled: !muted,
      sfxEnabled: !muted
    });
  }

  /**
   * Save configuration to localStorage
   */
  private saveConfig(): void {
    try {
      localStorage.setItem('chess-academy-audio-config', JSON.stringify(this.config));
    } catch (error) {
      console.warn('Failed to save audio config:', error);
    }
  }

  /**
   * Load configuration from localStorage
   */
  private loadConfig(): void {
    try {
      const saved = localStorage.getItem('chess-academy-audio-config');
      if (saved) {
        const config = JSON.parse(saved);
        this.config = { ...this.config, ...config };
        console.log('✓ Audio config loaded from storage');
      }
    } catch (error) {
      console.warn('Failed to load audio config:', error);
    }
  }

  /**
   * Test audio system
   */
  async testAudio(): Promise<void> {
    console.log('🔊 Testing Chess Academy AudioBus...');

    // Test SFX
    await this.playSFX({ key: 'positive' });

    // Test voice after 1 second
    setTimeout(async () => {
      await this.playVoice({
        key: 'GOOD_MOVE_1',
        text: 'Audio system is working perfectly!',
        category: 'positive',
        priority: 'medium'
      });
    }, 1000);
  }

  /**
   * Get audio system statistics
   */
  getStats(): Record<string, any> {
    return {
      initialized: this.isInitialized,
      sfxLoaded: this.sfxBuffers.size,
      voiceCached: this.voiceCache.size,
      phrasebookVersion: this.phrasebook?.version,
      audioContextState: this.audioContext?.state,
      config: this.config
    };
  }
}

// Export singleton instance
export const audioBus = new AudioBusService();
export default AudioBusService;