/**
 * Chess Engine Service - Stockfish Integration for Chess Academy
 * Handles bot games, position analysis, and move generation
 */

interface EngineMove {
  move: string;
  evaluation: number;
  depth: number;
  time: number;
}

interface PositionAnalysis {
  bestMove: string;
  evaluation: number;
  principalVariation: string[];
  depth: number;
  keyMoments?: {
    move: string;
    evaluation: number;
    comment: string;
  }[];
}

interface BotLevel {
  level: number;
  name: string;
  depth: number;
  timeLimit: number; // milliseconds
  elo: number;
  personality: string;
}

class ChessEngine {
  private engine: any;
  private isReady: boolean = false;
  private enginePromise: Promise<any>;

  // 10 Bot difficulty levels as specified in requirements
  private readonly BOT_LEVELS: BotLevel[] = [
    { level: 1, name: "Pawn", depth: 1, timeLimit: 100, elo: 400, personality: "Makes random moves, very beginner-friendly" },
    { level: 2, name: "Knight", depth: 2, timeLimit: 200, elo: 600, personality: "Occasionally makes good moves but inconsistent" },
    { level: 3, name: "Bishop", depth: 3, timeLimit: 300, elo: 800, personality: "Understands basic tactics but makes mistakes" },
    { level: 4, name: "Rook", depth: 4, timeLimit: 500, elo: 1000, personality: "Solid player with good tactical awareness" },
    { level: 5, name: "Queen", depth: 5, timeLimit: 750, elo: 1200, personality: "Strong tactical player, rarely blunders" },
    { level: 6, name: "King", depth: 6, timeLimit: 1000, elo: 1400, personality: "Excellent tactical and positional understanding" },
    { level: 7, name: "Grandmaster", depth: 8, timeLimit: 1500, elo: 1600, personality: "Near-perfect play with deep calculation" },
    { level: 8, name: "World Champion", depth: 10, timeLimit: 2000, elo: 1800, personality: "Exceptional in all phases of the game" },
    { level: 9, name: "Stockfish Junior", depth: 12, timeLimit: 3000, elo: 2000, personality: "Computer-level precision" },
    { level: 10, name: "Stockfish Master", depth: 14, timeLimit: 5000, elo: 2200, personality: "Maximum strength for ultimate challenge" }
  ];

  constructor() {
    this.enginePromise = this.initializeEngine();
  }

  private async initializeEngine(): Promise<any> {
    try {
      console.log('🎯 Initializing Stockfish engine...');
      
      // Try different import methods for better compatibility
      let Stockfish;
      try {
        // Try ES module import first
        const stockfishModule = await import('stockfish.js');
        Stockfish = stockfishModule.default || stockfishModule;
      } catch (esError) {
        console.warn('ES module import failed, trying alternative:', esError);
        // Fallback method if ES modules don't work
        Stockfish = (window as any).Stockfish || null;
        if (!Stockfish) {
          throw new Error('Stockfish not available through any method');
        }
      }
      
      console.log('🎯 Stockfish module loaded, creating instance...');
      this.engine = Stockfish();
      
      if (!this.engine) {
        throw new Error('Failed to create Stockfish instance');
      }
      
      return new Promise((resolve, reject) => {
        let readyTimeout: any;
        
        this.engine.onmessage = (message: string) => {
          console.log('🎯 Stockfish message:', message);
          
          if (message.includes('uciok')) {
            this.engine.postMessage('isready');
          } else if (message.includes('readyok')) {
            this.isReady = true;
            clearTimeout(readyTimeout);
            console.log('✅ Stockfish engine ready!');
            resolve(this.engine);
          }
        };

        this.engine.onerror = (error: any) => {
          console.error('❌ Stockfish error:', error);
          clearTimeout(readyTimeout);
          reject(error);
        };

        // Initialize UCI protocol
        console.log('🎯 Sending UCI init command...');
        this.engine.postMessage('uci');

        // Timeout after 5 seconds (reduced for faster fallback)
        readyTimeout = setTimeout(() => {
          console.error('❌ Stockfish initialization timeout');
          reject(new Error('Stockfish initialization timeout'));
        }, 5000);
      });
    } catch (error) {
      console.error('❌ Failed to initialize Stockfish:', error);
      throw error;
    }
  }

  async waitForReady(): Promise<void> {
    if (this.isReady) return;
    await this.enginePromise;
  }

  /**
   * Get bot move for specified difficulty level
   */
  async getBotMove(fen: string, level: number = 5): Promise<EngineMove> {
    await this.waitForReady();
    
    if (level < 1 || level > 10) {
      throw new Error('Bot level must be between 1 and 10');
    }

    const botConfig = this.BOT_LEVELS[level - 1];
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      let bestMove = '';
      let evaluation = 0;

      const messageHandler = (message: string) => {
        if (message.includes('bestmove')) {
          const moveMatch = message.match(/bestmove (\w+)/);
          if (moveMatch) {
            bestMove = moveMatch[1];
            const endTime = Date.now();
            
            // Clean up listener
            this.engine.onmessage = null;
            
            resolve({
              move: bestMove,
              evaluation,
              depth: botConfig.depth,
              time: endTime - startTime
            });
          }
        } else if (message.includes('cp')) {
          // Extract centipawn evaluation
          const cpMatch = message.match(/cp (-?\d+)/);
          if (cpMatch) {
            evaluation = parseInt(cpMatch[1]) / 100; // Convert centipawns to pawns
          }
        } else if (message.includes('mate')) {
          // Extract mate score
          const mateMatch = message.match(/mate (-?\d+)/);
          if (mateMatch) {
            const mateIn = parseInt(mateMatch[1]);
            evaluation = mateIn > 0 ? 10 : -10; // Simplified mate scoring
          }
        }
      };

      this.engine.onmessage = messageHandler;

      // Set position and search
      this.engine.postMessage(`position fen ${fen}`);
      this.engine.postMessage(`go depth ${botConfig.depth} movetime ${botConfig.timeLimit}`);

      // Timeout handling
      setTimeout(() => {
        if (!bestMove) {
          this.engine.onmessage = null;
          reject(new Error(`Bot move timeout after ${botConfig.timeLimit}ms`));
        }
      }, botConfig.timeLimit + 1000);
    });
  }

  /**
   * Analyze position for coaching hints and key moments
   */
  async analyzePosition(fen: string, depth: number = 12): Promise<PositionAnalysis> {
    await this.waitForReady();
    
    return new Promise((resolve, reject) => {
      let bestMove = '';
      let evaluation = 0;
      let principalVariation: string[] = [];

      const messageHandler = (message: string) => {
        if (message.includes('bestmove')) {
          const moveMatch = message.match(/bestmove (\w+)/);
          if (moveMatch) {
            bestMove = moveMatch[1];
            
            this.engine.onmessage = null;
            
            resolve({
              bestMove,
              evaluation,
              principalVariation,
              depth
            });
          }
        } else if (message.includes('pv')) {
          // Extract principal variation
          const pvMatch = message.match(/pv (.+)/);
          if (pvMatch) {
            principalVariation = pvMatch[1].split(' ');
          }
        } else if (message.includes('cp')) {
          const cpMatch = message.match(/cp (-?\d+)/);
          if (cpMatch) {
            evaluation = parseInt(cpMatch[1]) / 100;
          }
        } else if (message.includes('mate')) {
          const mateMatch = message.match(/mate (-?\d+)/);
          if (mateMatch) {
            const mateIn = parseInt(mateMatch[1]);
            evaluation = mateIn > 0 ? 10 : -10;
          }
        }
      };

      this.engine.onmessage = messageHandler;
      this.engine.postMessage(`position fen ${fen}`);
      this.engine.postMessage(`go depth ${depth} movetime 3000`);

      setTimeout(() => {
        if (!bestMove) {
          this.engine.onmessage = null;
          reject(new Error('Position analysis timeout'));
        }
      }, 5000);
    });
  }

  /**
   * Generate post-game analysis with key moments
   */
  async generateGameAnalysis(pgn: string): Promise<PositionAnalysis[]> {
    await this.waitForReady();
    
    // This is a simplified implementation
    // In a full implementation, we'd analyze each position in the game
    // and identify the 3 most critical moments based on evaluation swings
    
    try {
      // For now, return a placeholder analysis
      // TODO: Implement full PGN parsing and position-by-position analysis
      return [
        {
          bestMove: "e4",
          evaluation: 0.3,
          principalVariation: ["e4", "e5", "Nf3"],
          depth: 12,
          keyMoments: [
            { move: "e4", evaluation: 0.3, comment: "Good opening move, controls center" },
            { move: "d4", evaluation: -0.5, comment: "Inaccuracy - allows counterplay" },
            { move: "Nf3", evaluation: 0.8, comment: "Excellent! Develops with tempo" }
          ]
        }
      ];
    } catch (error) {
      console.error('Game analysis error:', error);
      return [];
    }
  }

  /**
   * Get available bot levels
   */
  getBotLevels(): BotLevel[] {
    return [...this.BOT_LEVELS];
  }

  /**
   * Get bot configuration by level
   */
  getBotConfig(level: number): BotLevel | null {
    if (level < 1 || level > 10) return null;
    return this.BOT_LEVELS[level - 1];
  }

  /**
   * Clean up engine resources
   */
  dispose(): void {
    if (this.engine) {
      try {
        this.engine.postMessage('quit');
        this.engine = null;
      } catch (error) {
        console.error('Error disposing engine:', error);
      }
    }
    this.isReady = false;
  }
}

// Singleton instance
let chessEngineInstance: ChessEngine | null = null;

export const getChessEngine = (): ChessEngine => {
  if (!chessEngineInstance) {
    chessEngineInstance = new ChessEngine();
  }
  return chessEngineInstance;
};

export type { EngineMove, PositionAnalysis, BotLevel };
export default ChessEngine;