/**
 * Guided Practice Bot Service
 * Specialized chess engine integration for educational guided practice lessons
 * Provides move explanations, adaptive difficulty, and learning-focused feedback
 */

import { Chess } from 'chess.js';
import { getChessEngine, type EngineMove, type BotLevel } from './chessEngine';

interface GuidedMoveResult {
  move: string;
  explanation: string;
  evaluation: number;
  difficulty: number;
  alternatives?: string[];
  teachingPoint?: string;
  category: 'opening' | 'middlegame' | 'endgame' | 'tactical' | 'positional';
}

interface PracticeSession {
  correctMoves: number;
  mistakes: number;
  averageThinkTime: number;
  strongAreas: string[];
  improvementAreas: string[];
}

class GuidedPracticeBot {
  private engine = getChessEngine();
  private session: PracticeSession = {
    correctMoves: 0,
    mistakes: 0,
    averageThinkTime: 0,
    strongAreas: [],
    improvementAreas: []
  };

  /**
   * Get a computer move with educational explanation
   */
  async getEducationalMove(
    fen: string, 
    botLevel: number = 3,
    lessonTheme: string = 'general'
  ): Promise<GuidedMoveResult> {
    try {
      // Get move from engine
      const engineMove: EngineMove = await this.engine.getBotMove(fen, botLevel);
      
      // Analyze the position for educational context
      const chess = new Chess(fen);
      const gamePhase = this.determineGamePhase(chess);
      const explanation = this.generateMoveExplanation(chess, engineMove.move, lessonTheme, gamePhase);
      
      return {
        move: engineMove.move,
        explanation: explanation.text,
        evaluation: engineMove.evaluation,
        difficulty: botLevel,
        alternatives: this.getAlternativeMoves(chess, engineMove.move),
        teachingPoint: explanation.teachingPoint,
        category: gamePhase
      };
    } catch (error) {
      console.error('Educational move generation failed:', error);
      
      // Fallback to simple move with basic explanation
      const chess = new Chess(fen);
      const moves = chess.moves({ verbose: true });
      if (moves.length === 0) {
        throw new Error('No legal moves available');
      }
      
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      return {
        move: `${randomMove.from}${randomMove.to}${randomMove.promotion || ''}`,
        explanation: `I played ${randomMove.san}. This is a legal move in the current position.`,
        evaluation: 0,
        difficulty: botLevel,
        category: this.determineGamePhase(chess)
      };
    }
  }

  /**
   * Provide adaptive difficulty based on user performance
   */
  getAdaptiveBotLevel(baseBotLevel: number, userPerformance: PracticeSession): number {
    const { correctMoves, mistakes } = userPerformance;
    const successRate = correctMoves / (correctMoves + mistakes);
    
    let adjustedLevel = baseBotLevel;
    
    // Increase difficulty if user is doing very well (>85% success rate)
    if (successRate > 0.85 && correctMoves >= 5) {
      adjustedLevel = Math.min(10, baseBotLevel + 1);
    }
    // Decrease difficulty if user is struggling (<50% success rate)
    else if (successRate < 0.5 && mistakes >= 3) {
      adjustedLevel = Math.max(1, baseBotLevel - 1);
    }
    
    return adjustedLevel;
  }

  /**
   * Determine what phase of the game we're in
   */
  private determineGamePhase(chess: Chess): 'opening' | 'middlegame' | 'endgame' | 'tactical' | 'positional' {
    const moveCount = chess.history().length;
    const board = chess.board().flat().filter(square => square !== null);
    const pieceCount = board.length;
    
    // Opening: First 10-15 moves
    if (moveCount < 20) {
      return 'opening';
    }
    
    // Endgame: Few pieces left
    if (pieceCount <= 12) {
      return 'endgame';
    }
    
    // Check for tactical themes
    const moves = chess.moves({ verbose: true });
    const captures = moves.filter(m => m.captured);
    const checks = moves.filter(m => m.san.includes('+'));
    
    if (captures.length > 2 || checks.length > 0) {
      return 'tactical';
    }
    
    return 'middlegame';
  }

  /**
   * Generate educational explanation for a move
   */
  private generateMoveExplanation(
    chess: Chess, 
    move: string, 
    lessonTheme: string, 
    gamePhase: string
  ): { text: string; teachingPoint?: string } {
    const [from, to] = [move.slice(0, 2), move.slice(2, 4)];
    const tempChess = new Chess(chess.fen());
    
    try {
      const moveObj = tempChess.move({ from, to, promotion: move.slice(4, 5) || 'q' });
      
      if (!moveObj) {
        return { text: "I made a move to continue the game." };
      }

      let explanation = `I played ${moveObj.san}. `;
      let teachingPoint = '';

      // Capture explanations
      if (moveObj.captured) {
        explanation += `This captures your ${this.getPieceName(moveObj.captured)}, gaining material advantage. `;
        teachingPoint = 'Material advantage is crucial - try to win pieces when possible!';
      }
      
      // Check explanations
      if (moveObj.san.includes('+')) {
        explanation += `This puts your king in check, forcing you to respond. `;
        teachingPoint = 'Checks are powerful forcing moves that limit opponent options.';
      }
      
      // Phase-specific explanations
      switch (gamePhase) {
        case 'opening':
          explanation += this.getOpeningExplanation(moveObj, lessonTheme);
          teachingPoint = 'Opening principles: Control center, develop pieces, castle early!';
          break;
        
        case 'middlegame':
          explanation += this.getMiddlegameExplanation(moveObj, chess);
          teachingPoint = 'Look for tactics, improve piece positions, and create threats.';
          break;
          
        case 'endgame':
          explanation += this.getEndgameExplanation(moveObj, chess);
          teachingPoint = 'In endgames, activate your king and push for promotion!';
          break;
          
        case 'tactical':
          explanation += 'This creates tactical threats and complications. ';
          teachingPoint = 'Look for forks, pins, skewers, and discovered attacks!';
          break;
      }

      return { text: explanation.trim(), teachingPoint };
      
    } catch (error) {
      return { text: "I made a strategic move to improve my position." };
    }
  }

  private getPieceName(piece: string): string {
    const names = {
      'p': 'pawn', 'n': 'knight', 'b': 'bishop', 
      'r': 'rook', 'q': 'queen', 'k': 'king'
    };
    return names[piece.toLowerCase()] || 'piece';
  }

  private getOpeningExplanation(moveObj: any, lessonTheme: string): string {
    if (moveObj.piece === 'p' && ['e4', 'e5', 'd4', 'd5'].includes(moveObj.san)) {
      return 'This controls the center, following key opening principles. ';
    }
    if (['Nf3', 'Nc3', 'Nf6', 'Nc6'].includes(moveObj.san)) {
      return 'This develops a knight toward the center, improving piece activity. ';
    }
    if (moveObj.san.includes('O-O')) {
      return 'Castling keeps the king safe while connecting the rooks. ';
    }
    return 'This follows sound opening principles. ';
  }

  private getMiddlegameExplanation(moveObj: any, chess: Chess): string {
    const pieces = chess.board().flat().filter(p => p !== null);
    const myPieces = pieces.filter(p => p?.color === chess.turn()).length;
    
    if (moveObj.captured) {
      return 'This wins material, which is often decisive in the middlegame. ';
    }
    if (myPieces < 10) {
      return 'This improves piece coordination for the coming endgame. ';
    }
    return 'This creates strategic pressure and improves my position. ';
  }

  private getEndgameExplanation(moveObj: any, chess: Chess): string {
    if (moveObj.piece === 'k') {
      return 'In endgames, the king becomes an active piece. ';
    }
    if (moveObj.piece === 'p') {
      return 'Advancing pawns toward promotion is key in endgames. ';
    }
    return 'This follows endgame principles for optimal play. ';
  }

  private getAlternativeMoves(chess: Chess, playedMove: string): string[] {
    const moves = chess.moves();
    // Return 2-3 other reasonable moves as alternatives
    return moves
      .filter(m => m !== playedMove)
      .slice(0, 3);
  }

  /**
   * Update practice session statistics
   */
  updateSession(correct: boolean, thinkTime: number): void {
    if (correct) {
      this.session.correctMoves++;
    } else {
      this.session.mistakes++;
    }
    
    // Update average think time
    const totalMoves = this.session.correctMoves + this.session.mistakes;
    this.session.averageThinkTime = 
      ((this.session.averageThinkTime * (totalMoves - 1)) + thinkTime) / totalMoves;
  }

  /**
   * Get session performance summary
   */
  getSessionSummary(): PracticeSession & {
    successRate: number;
    recommendedLevel: number;
    feedback: string;
  } {
    const total = this.session.correctMoves + this.session.mistakes;
    const successRate = total > 0 ? this.session.correctMoves / total : 0;
    
    let feedback = '';
    if (successRate > 0.8) {
      feedback = 'Excellent work! You\'re ready for more challenging lessons.';
    } else if (successRate > 0.6) {
      feedback = 'Good progress! Keep practicing these patterns.';
    } else {
      feedback = 'Take your time to think through each move. Practice makes perfect!';
    }
    
    return {
      ...this.session,
      successRate,
      recommendedLevel: this.getAdaptiveBotLevel(5, this.session),
      feedback
    };
  }

  /**
   * Reset session statistics
   */
  resetSession(): void {
    this.session = {
      correctMoves: 0,
      mistakes: 0,
      averageThinkTime: 0,
      strongAreas: [],
      improvementAreas: []
    };
  }

  /**
   * Get available bot levels with educational context
   */
  getEducationalBotLevels(): (BotLevel & { educationalFocus: string })[] {
    return this.engine.getBotLevels().map(level => ({
      ...level,
      educationalFocus: this.getEducationalFocus(level.level)
    }));
  }

  private getEducationalFocus(level: number): string {
    const focuses = {
      1: 'Basic piece movement and simple tactics',
      2: 'Fundamental opening principles',
      3: 'Basic tactical patterns (forks, pins)',
      4: 'Opening development and center control',
      5: 'Intermediate tactics and positional play',
      6: 'Advanced tactics and strategic thinking',
      7: 'Complex positions and planning',
      8: 'Master-level tactical combinations',
      9: 'Deep strategic understanding',
      10: 'Computer-level precision and calculation'
    };
    return focuses[level as keyof typeof focuses] || 'General chess improvement';
  }
}

// Singleton instance
let guidedPracticeBotInstance: GuidedPracticeBot | null = null;

export const getGuidedPracticeBot = (): GuidedPracticeBot => {
  if (!guidedPracticeBotInstance) {
    guidedPracticeBotInstance = new GuidedPracticeBot();
  }
  return guidedPracticeBotInstance;
};

export type { GuidedMoveResult, PracticeSession };
export default GuidedPracticeBot;