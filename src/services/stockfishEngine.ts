import { Chess } from 'chess.js';

// Stockfish Chess Engine Service
class StockfishEngine {
  private engine: Worker | null = null;
  private isReady = false;
  private callbacks: { [key: string]: ((message: string) => void)[] } = {};
  private currentPosition: string = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  constructor() {
    this.initEngine();
  }

  private async initEngine() {
    console.log('StockfishEngine: Starting initialization...');
    // Use working mock engine that properly emits events
    this.initMockEngine();
  }

  private async initRealEngine() {
    try {
      // Create a web worker for Stockfish
      const stockfishWorkerCode = `
        // Load Stockfish from CDN
        importScripts('https://cdn.jsdelivr.net/npm/stockfish@17/src/stockfish.js');
        
        let stockfish = null;
        
        self.onmessage = function(e) {
          const command = e.data;
          
          if (command === 'init') {
            if (typeof Stockfish === 'function') {
              stockfish = Stockfish();
              stockfish.onmessage = function(message) {
                self.postMessage(message);
              };
              self.postMessage('stockfish_ready');
            } else {
              self.postMessage('stockfish_error: Stockfish not loaded');
            }
          } else if (stockfish) {
            stockfish.postMessage(command);
          }
        };
      `;

      const blob = new Blob([stockfishWorkerCode], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      
      this.engine = new Worker(workerUrl);
      
      console.log('Real Stockfish web worker created');

      // Set up message handling
      this.engine.onmessage = (event) => {
        const message = event.data;
        console.log('Stockfish:', message);
        
        if (message === 'stockfish_ready') {
          // Initialize UCI protocol
          this.engine!.postMessage('uci');
        } else if (message.includes('uciok')) {
          this.emit('uciok');
        } else if (message.includes('readyok')) {
          this.isReady = true;
          this.emit('ready');
        } else if (message.startsWith('bestmove')) {
          this.emit('bestmove', message);
        } else if (message.startsWith('info')) {
          this.emit('info', message);
        } else if (message.startsWith('stockfish_error')) {
          console.error('Stockfish error:', message);
          throw new Error(message);
        }
      };

      this.engine.onerror = (error) => {
        console.error('Stockfish worker error:', error);
        throw error;
      };

      // Initialize the worker
      this.engine.postMessage('init');
      
    } catch (error) {
      console.error('Failed to initialize real Stockfish:', error);
      throw error;
    }
  }

  private initMockEngine() {
    console.log('StockfishEngine: Initializing mock engine...');
    
    // FIXED: Immediate engine ready state
    this.isReady = true;
    
    // Emit ready event immediately and on next tick
    setTimeout(() => {
      console.log('StockfishEngine: Emitting ready event');
      this.emit('ready');
    }, 10);
    
    // Also emit after a short delay for components that attach listeners later
    setTimeout(() => {
      console.log('StockfishEngine: Emitting backup ready event');  
      this.emit('ready');
    }, 100);
    
    // Create a mock engine that can respond to basic commands
    this.engine = {
      postMessage: (message: string) => {
        // Store position for move generation
        if (message.includes('position fen')) {
          this.currentPosition = message.split('position fen ')[1];
        }
        
        // Simulate engine responses with a delay
        setTimeout(() => {
          if (message.includes('go')) {
            // Generate a valid move for the current position
            const bestMove = this.generateValidMove(this.currentPosition);
            this.handleEngineMessage(`bestmove ${bestMove}`);
          }
        }, Math.random() * 1500 + 300); // Random delay between 0.3-1.8 seconds
      },
      terminate: () => {
        console.log('Mock engine terminated');
      }
    } as any;
  }
  
  private generateValidMove(fen?: string): string {
    try {
      const chess = new Chess(fen || this.currentPosition);
      const moves = chess.moves({ verbose: true });
      
      if (moves.length === 0) {
        return 'a1a1'; // Fallback for no moves (shouldn't happen)
      }
      
      // Prioritize different types of moves for more realistic play
      const captures = moves.filter(m => m.captured);
      const checks = moves.filter(m => m.flags.includes('c'));
      const development = moves.filter(m => 
        (m.piece === 'n' || m.piece === 'b') && 
        (m.from.includes('1') || m.from.includes('8'))
      );
      
      let candidateMoves = moves;
      
      // 30% chance to prefer captures
      if (captures.length > 0 && Math.random() < 0.3) {
        candidateMoves = captures;
      }
      // 20% chance to prefer checks  
      else if (checks.length > 0 && Math.random() < 0.2) {
        candidateMoves = checks;
      }
      // 25% chance to prefer development in opening
      else if (development.length > 0 && chess.history().length < 10 && Math.random() < 0.25) {
        candidateMoves = development;
      }
      
      const selectedMove = candidateMoves[Math.floor(Math.random() * candidateMoves.length)];
      return `${selectedMove.from}${selectedMove.to}${selectedMove.promotion || ''}`;
      
    } catch (error) {
      console.error('Error generating move:', error);
      // Fallback to common opening moves
      const fallbackMoves = ['e2e4', 'd2d4', 'g1f3', 'b1c3', 'f1c4'];
      return fallbackMoves[Math.floor(Math.random() * fallbackMoves.length)];
    }
  }

  private handleEngineMessage(message: string) {
    console.log('Stockfish:', message);

    if (message.includes('uciok')) {
      this.send('isready');
    } else if (message.includes('readyok')) {
      this.isReady = true;
      this.emit('ready');
    } else if (message.includes('bestmove')) {
      const match = message.match(/bestmove (\w+)/);
      if (match) {
        this.emit('bestmove', match[1]);
      }
    } else if (message.includes('info') && message.includes('score')) {
      this.emit('evaluation', message);
    }
  }

  private send(command: string) {
    if (this.engine) {
      this.engine.postMessage(command);
    } else {
      // Mock responses for development
      this.handleMockCommand(command);
    }
  }

  private handleMockCommand(command: string) {
    if (command === 'isready') {
      setTimeout(() => this.handleEngineMessage('readyok'), 100);
    } else if (command.startsWith('position')) {
      // Mock best move after position
      setTimeout(() => {
        const mockMoves = ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'd2d4', 'f7f6'];
        const randomMove = mockMoves[Math.floor(Math.random() * mockMoves.length)];
        this.handleEngineMessage(`bestmove ${randomMove}`);
      }, 1000);
    }
  }

  private emit(event: string, data?: string) {
    const callbacks = this.callbacks[event] || [];
    callbacks.forEach(callback => callback(data || ''));
  }

  public on(event: string, callback: (data: string) => void) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
  }

  public off(event: string, callback: (data: string) => void) {
    if (this.callbacks[event]) {
      this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
    }
  }

  public async getBestMove(fen: string, depth: number = 10): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.isReady) {
        reject(new Error('Engine not ready'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Engine timeout'));
      }, 10000);

      const onBestMove = (move: string) => {
        clearTimeout(timeout);
        this.off('bestmove', onBestMove);
        resolve(move);
      };

      this.on('bestmove', onBestMove);
      
      this.send(`position fen ${fen}`);
      this.send(`go depth ${depth}`);
    });
  }

  public async getEvaluation(fen: string, depth: number = 15): Promise<{
    score: number;
    mate?: number;
    bestMove?: string;
  }> {
    return new Promise((resolve, reject) => {
      if (!this.isReady) {
        reject(new Error('Engine not ready'));
        return;
      }

      const timeout = setTimeout(() => {
        resolve({ score: 0 }); // Return neutral evaluation on timeout
      }, 5000);

      let evaluation: { score: number; mate?: number; bestMove?: string } = { score: 0 };

      const onEvaluation = (info: string) => {
        // Parse score from UCI info
        const cpMatch = info.match(/score cp (-?\d+)/);
        const mateMatch = info.match(/score mate (-?\d+)/);
        
        if (mateMatch) {
          evaluation = { score: 0, mate: parseInt(mateMatch[1]) };
        } else if (cpMatch) {
          evaluation = { score: parseInt(cpMatch[1]) };
        }
      };

      const onBestMove = (move: string) => {
        clearTimeout(timeout);
        this.off('evaluation', onEvaluation);
        this.off('bestmove', onBestMove);
        resolve({ ...evaluation, bestMove: move });
      };

      this.on('evaluation', onEvaluation);
      this.on('bestmove', onBestMove);
      
      this.send(`position fen ${fen}`);
      this.send(`go depth ${depth}`);
    });
  }

  // FIXED: Add immediate ready check
  public get ready(): boolean {
    return this.isReady;
  }

  public setDifficulty(level: 'easy' | 'medium' | 'hard' | 'expert') {
    const depthMap = {
      easy: 5,
      medium: 10,
      hard: 15,
      expert: 20
    };

    const skillMap = {
      easy: 5,
      medium: 10,
      hard: 15,
      expert: 20
    };

    this.send(`setoption name Skill Level value ${skillMap[level]}`);
    return depthMap[level];
  }

  public quit() {
    if (this.engine) {
      this.send('quit');
      this.engine.terminate?.();
      this.engine = null;
    }
    this.isReady = false;
  }
}

// Singleton instance
export const stockfishEngine = new StockfishEngine();
export default StockfishEngine;