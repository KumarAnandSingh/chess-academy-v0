/**
 * Voice Coach Integration for 25-Level Chess Gameplay
 * MIT Licensed - Chess Academy Voice Play System
 */

import { Chess } from 'chess.js';
import { audioBus, VoiceRequest, SFXRequest } from './audioBus';

export interface MoveAnalysis {
  quality: 'excellent' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';
  tactical: boolean;
  hanging: string[];
  bestMove?: string;
  evaluation?: number;
  isCheck: boolean;
  isCheckmate: boolean;
  isCapture: boolean;
  isCastle: boolean;
  gamePhase: 'opening' | 'middlegame' | 'endgame';
}

export interface GameLevel {
  level: number;
  name: string;
  difficulty: 'beginner' | 'easy' | 'medium' | 'hard' | 'expert' | 'master';
  coachingStyle: 'encouraging' | 'balanced' | 'analytical' | 'challenging';
  skillLevel: 'novice' | 'club player' | 'expert' | 'master' | 'grandmaster';
}

export class VoiceCoachService {
  private lastFeedbackTime = 0;
  private feedbackCooldown = 2000; // 2 seconds between voice feedback
  private moveCount = 0;
  private currentLevel: GameLevel | null = null;

  async initialize(): Promise<void> {
    console.log('🎤 Initializing Voice Coach for 25-level gameplay...');
    await audioBus.initialize();
  }

  /**
   * Set current game level for contextual coaching
   */
  setGameLevel(level: GameLevel): void {
    this.currentLevel = level;
    this.moveCount = 0;
    console.log(`🎯 Voice coach set to Level ${level.level}: ${level.name}`);
  }

  /**
   * Analyze move and provide appropriate voice coaching
   */
  async analyzeAndCoach(
    game: Chess,
    move: string,
    analysis: MoveAnalysis
  ): Promise<void> {
    this.moveCount++;

    try {
      // Always play move SFX immediately
      await this.playMoveSFX(analysis);

      // Determine if voice coaching should be given
      if (this.shouldGiveVoiceCoaching(analysis)) {
        await this.giveVoiceCoaching(game, move, analysis);
      }

      // Check for special game states
      await this.handleSpecialGameStates(game, analysis);

    } catch (error) {
      console.error('Voice coaching error:', error);
    }
  }

  /**
   * Play appropriate sound effects for the move
   */
  private async playMoveSFX(analysis: MoveAnalysis): Promise<void> {
    let sfxKey: SFXRequest['key'];
    let volume = 0.6;

    if (analysis.isCheckmate) {
      sfxKey = 'mate';
      volume = 0.8;
    } else if (analysis.isCheck) {
      sfxKey = 'check';
      volume = 0.7;
    } else if (analysis.isCastle) {
      sfxKey = 'castle';
      volume = 0.5;
    } else if (analysis.isCapture) {
      sfxKey = 'capture';
      volume = 0.6;
    } else if (analysis.quality === 'blunder') {
      sfxKey = 'blunder';
      volume = 0.8;
    } else if (analysis.quality === 'excellent') {
      sfxKey = 'positive';
      volume = 0.7;
    } else if (analysis.hanging.length > 0) {
      sfxKey = 'warning';
      volume = 0.7;
    } else {
      sfxKey = 'move';
      volume = 0.4;
    }

    await audioBus.playSFX({ key: sfxKey, volume });
  }

  /**
   * Determine if voice coaching should be given based on level and talkative settings
   */
  private shouldGiveVoiceCoaching(analysis: MoveAnalysis): boolean {
    const now = Date.now();

    // Respect cooldown period
    if (now - this.lastFeedbackTime < this.feedbackCooldown) {
      return false;
    }

    // Always coach critical moments
    if (analysis.quality === 'blunder' ||
        analysis.quality === 'excellent' ||
        analysis.isCheckmate ||
        analysis.hanging.length > 0) {
      return true;
    }

    // Level-based coaching frequency
    if (!this.currentLevel) return false;

    const levelBasedFrequency = this.getLevelCoachingFrequency();
    return Math.random() < levelBasedFrequency;
  }

  /**
   * Get coaching frequency based on current level
   */
  private getLevelCoachingFrequency(): number {
    if (!this.currentLevel) return 0.3;

    const level = this.currentLevel.level;

    if (level <= 5) return 0.8; // Beginner levels - lots of coaching
    if (level <= 10) return 0.6; // Learning phase - moderate coaching
    if (level <= 15) return 0.4; // Intermediate - selective coaching
    if (level <= 20) return 0.3; // Advanced - minimal coaching
    return 0.2; // Master levels - rare coaching
  }

  /**
   * Provide contextual voice coaching based on the move and level
   */
  private async giveVoiceCoaching(
    game: Chess,
    move: string,
    analysis: MoveAnalysis
  ): Promise<void> {
    const voiceRequest = this.generateVoiceRequest(analysis);

    if (voiceRequest) {
      await audioBus.playVoice(voiceRequest);
      this.lastFeedbackTime = Date.now();
    }
  }

  /**
   * Generate appropriate voice request based on move analysis
   */
  private generateVoiceRequest(analysis: MoveAnalysis): VoiceRequest | null {
    const level = this.currentLevel?.level || 1;

    // Handle critical situations first
    if (analysis.quality === 'blunder') {
      return {
        key: 'BLUNDER_WARNING',
        text: audioBus.getRandomPhrase('BLUNDER_WARNING', {
          candidate: analysis.bestMove || 'a different move'
        }),
        category: 'warning',
        priority: 'critical'
      };
    }

    if (analysis.hanging.length > 0 && level <= 15) {
      const piece = analysis.hanging[0];
      return {
        key: 'HANGING_PIECE',
        text: audioBus.getRandomPhrase('HANGING_PIECE', {
          piece: this.formatPieceName(piece),
          square: 'that square'
        }),
        category: 'warning',
        priority: 'critical'
      };
    }

    if (analysis.quality === 'excellent') {
      return {
        key: level >= 20 ? 'EXCELLENT_MOVE' : 'GOOD_MOVE',
        text: audioBus.getRandomPhrase(
          level >= 20 ? 'EXCELLENT_MOVE' : 'GOOD_MOVE'
        ),
        category: 'positive',
        priority: 'high'
      };
    }

    // Level-specific coaching
    if (level <= 8 && this.moveCount <= 10) {
      // Opening coaching for beginners
      return {
        key: 'OPENING_PRINCIPLE',
        text: audioBus.getRandomPhrase('OPENING_PRINCIPLE'),
        category: 'educational',
        priority: 'medium'
      };
    }

    if (level >= 12 && analysis.gamePhase === 'middlegame' && analysis.tactical) {
      // Tactical coaching for intermediate players
      return {
        key: 'TACTICAL_PATTERN',
        text: audioBus.getRandomPhrase('TACTICAL_PATTERN'),
        category: 'educational',
        priority: 'medium'
      };
    }

    if (level >= 15 && analysis.gamePhase === 'endgame') {
      // Endgame coaching for advanced players
      return {
        key: 'ENDGAME_ADVICE',
        text: audioBus.getRandomPhrase('ENDGAME_ADVICE'),
        category: 'educational',
        priority: 'medium'
      };
    }

    if (analysis.bestMove && analysis.quality === 'inaccuracy' && level >= 10) {
      return {
        key: 'MISSED_TACTIC',
        text: audioBus.getRandomPhrase('MISSED_TACTIC', {
          bestMove: analysis.bestMove
        }),
        category: 'neutral',
        priority: 'medium'
      };
    }

    // Encouragement for beginners
    if (level <= 10 && Math.random() < 0.3) {
      return {
        key: 'ENCOURAGEMENT',
        text: audioBus.getRandomPhrase('ENCOURAGEMENT'),
        category: 'positive',
        priority: 'low'
      };
    }

    return null;
  }

  /**
   * Handle special game states (check, checkmate, etc.)
   */
  private async handleSpecialGameStates(
    game: Chess,
    analysis: MoveAnalysis
  ): Promise<void> {
    if (analysis.isCheckmate) {
      // Celebrate checkmate
      setTimeout(async () => {
        await audioBus.playVoice({
          key: 'CHECKMATE_FOUND',
          text: audioBus.getRandomPhrase('CHECKMATE_FOUND'),
          category: 'celebration',
          priority: 'critical'
        });
      }, 1000);
    } else if (analysis.isCheck) {
      // Announce check
      setTimeout(async () => {
        await audioBus.playVoice({
          key: 'CHECK_ANNOUNCEMENT',
          text: 'Check!',
          category: 'neutral',
          priority: 'high'
        });
      }, 500);
    }
  }

  /**
   * Provide level progression feedback
   */
  async onLevelComplete(completed: GameLevel, next?: GameLevel): Promise<void> {
    const completionPhrase = this.generateLevelCompletionPhrase(completed);

    await audioBus.playChessAudio(
      { key: 'positive', volume: 0.8 },
      {
        key: 'LEVEL_PROGRESSION',
        text: completionPhrase,
        category: 'positive',
        priority: 'high'
      },
      1500 // Delay voice after SFX
    );

    if (next) {
      setTimeout(async () => {
        const nextLevelPhrase = this.generateNextLevelPhrase(next);
        await audioBus.playVoice({
          key: 'OPPONENT_LEVEL',
          text: nextLevelPhrase,
          category: 'neutral',
          priority: 'medium'
        });
      }, 3000);
    }
  }

  /**
   * Generate level completion phrase
   */
  private generateLevelCompletionPhrase(level: GameLevel): string {
    const phrases = [
      `Excellent! You defeated ${level.name}!`,
      `Level ${level.level} complete! Well played!`,
      `Great job! You're getting stronger!`,
      `Victory! Your chess is improving!`
    ];

    return phrases[Math.floor(Math.random() * phrases.length)];
  }

  /**
   * Generate next level introduction phrase
   */
  private generateNextLevelPhrase(level: GameLevel): string {
    return `Next up: Level ${level.level} - ${level.name}. This ${level.difficulty} opponent will challenge your ${this.getSkillFocus(level)} skills.`;
  }

  /**
   * Get skill focus for level description
   */
  private getSkillFocus(level: GameLevel): string {
    if (level.level <= 5) return 'basic chess';
    if (level.level <= 10) return 'tactical';
    if (level.level <= 15) return 'positional';
    if (level.level <= 20) return 'strategic';
    return 'master-level';
  }

  /**
   * Format piece name for voice
   */
  private formatPieceName(piece: string): string {
    const pieceNames: Record<string, string> = {
      'p': 'pawn',
      'r': 'rook',
      'n': 'knight',
      'b': 'bishop',
      'q': 'queen',
      'k': 'king'
    };

    return pieceNames[piece.toLowerCase()] || piece;
  }

  /**
   * Provide time pressure coaching
   */
  async onTimePressure(timeRemaining: number): Promise<void> {
    if (timeRemaining < 60000 && timeRemaining > 30000) { // 1 minute warning
      await audioBus.playVoice({
        key: 'TIME_PRESSURE',
        text: 'Time is running low. Think quickly but accurately.',
        category: 'warning',
        priority: 'medium'
      });
    } else if (timeRemaining < 30000) { // 30 second warning
      await audioBus.playChessAudio(
        { key: 'warning', volume: 0.5 },
        {
          key: 'TIME_PRESSURE',
          text: 'Thirty seconds left! Trust your instincts.',
          category: 'warning',
          priority: 'high'
        }
      );
    }
  }

  /**
   * Get voice coach statistics
   */
  getStats(): Record<string, any> {
    return {
      currentLevel: this.currentLevel?.level || 0,
      moveCount: this.moveCount,
      lastFeedbackTime: this.lastFeedbackTime,
      cooldownActive: Date.now() - this.lastFeedbackTime < this.feedbackCooldown,
      audioSystemStats: audioBus.getStats()
    };
  }

  /**
   * Reset voice coach for new game
   */
  reset(): void {
    this.moveCount = 0;
    this.lastFeedbackTime = 0;
    console.log('🔄 Voice coach reset for new game');
  }
}

// Export singleton instance
export const voiceCoach = new VoiceCoachService();
export default VoiceCoachService;