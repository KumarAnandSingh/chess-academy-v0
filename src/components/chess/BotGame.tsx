/**
 * Bot Game Component - Play against AI opponents
 * Integrates with Stockfish engine for different difficulty levels
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { getChessEngine, type BotLevel, type EngineMove } from '../../services/chessEngine';

interface BotGameProps {
  onGameEnd?: (result: 'win' | 'loss' | 'draw', pgn: string) => void;
  initialLevel?: number;
}

const BotGame: React.FC<BotGameProps> = ({ onGameEnd, initialLevel = 5 }) => {
  const [game, setGame] = useState(new Chess());
  const [gamePosition, setGamePosition] = useState(game.fen());
  const [botLevel, setBotLevel] = useState(initialLevel);
  const [isThinking, setIsThinking] = useState(false);
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [lastBotMove, setLastBotMove] = useState<EngineMove | null>(null);
  
  const chessEngine = getChessEngine();
  const botLevels = chessEngine.getBotLevels();
  const currentBot = chessEngine.getBotConfig(botLevel);

  // Make bot move
  const makeBotMove = useCallback(async () => {
    if (game.isGameOver() || isThinking) return;
    
    setIsThinking(true);
    try {
      const engineMove = await chessEngine.getBotMove(game.fen(), botLevel);
      
      const move = game.move(engineMove.move);
      if (move) {
        setGame(new Chess(game.fen()));
        setGamePosition(game.fen());
        setMoveHistory(prev => [...prev, move.san]);
        setLastBotMove(engineMove);
        
        // Check for game end
        if (game.isGameOver()) {
          let result: 'win' | 'loss' | 'draw';
          if (game.isCheckmate()) {
            result = game.turn() === 'w' ? 'loss' : 'win'; // Bot just moved, so if white to move, bot won
          } else {
            result = 'draw';
          }
          setGameResult(game.isCheckmate() ? (game.turn() === 'w' ? 'Bot wins!' : 'You win!') : 'Draw!');
          onGameEnd?.(result, game.pgn());
        }
      }
    } catch (error) {
      console.error('Bot move error:', error);
    } finally {
      setIsThinking(false);
    }
  }, [game, botLevel, isThinking, onGameEnd, chessEngine]);

  // Handle user moves
  const handleMove = useCallback((sourceSquare: string, targetSquare: string) => {
    if (isThinking || game.isGameOver()) return false;

    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // Always promote to queen for simplicity
      });

      if (move) {
        setGame(new Chess(game.fen()));
        setGamePosition(game.fen());
        setMoveHistory(prev => [...prev, move.san]);

        // Check if game is over after user move
        if (game.isGameOver()) {
          let result: 'win' | 'loss' | 'draw';
          if (game.isCheckmate()) {
            result = 'win'; // User just moved and checkmated bot
          } else {
            result = 'draw';
          }
          setGameResult(game.isCheckmate() ? 'You win!' : 'Draw!');
          onGameEnd?.(result, game.pgn());
          return true;
        }

        // Make bot move after short delay
        setTimeout(() => makeBotMove(), 500);
        return true;
      }
    } catch (error) {
      console.error('Move error:', error);
    }
    return false;
  }, [game, isThinking, makeBotMove, onGameEnd]);

  // Reset game
  const resetGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setGamePosition(newGame.fen());
    setGameResult(null);
    setMoveHistory([]);
    setLastBotMove(null);
    setIsThinking(false);
  };

  // Change bot level
  const changeBotLevel = (newLevel: number) => {
    setBotLevel(newLevel);
    resetGame();
  };

  return (
    <div className="flex flex-col items-center p-4 space-y-4">
      {/* Bot Selection */}
      <div className="bg-white rounded-lg shadow-md p-4 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-2">Choose Your Opponent</h3>
        <select
          value={botLevel}
          onChange={(e) => changeBotLevel(parseInt(e.target.value))}
          className="w-full p-2 border rounded-md"
          disabled={isThinking}
        >
          {botLevels.map((bot) => (
            <option key={bot.level} value={bot.level}>
              Level {bot.level}: {bot.name} ({bot.elo} ELO)
            </option>
          ))}
        </select>
        {currentBot && (
          <p className="text-sm text-gray-600 mt-2">{currentBot.personality}</p>
        )}
      </div>

      {/* Game Status */}
      <div className="bg-blue-50 rounded-lg p-4 w-full max-w-md text-center">
        {isThinking && (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-blue-600">Bot is thinking...</span>
          </div>
        )}
        {gameResult && (
          <div className="text-lg font-semibold text-green-600">{gameResult}</div>
        )}
        {!isThinking && !gameResult && (
          <div className="text-gray-700">
            {game.turn() === 'w' ? 'Your turn (White)' : 'Your turn (Black)'}
          </div>
        )}
      </div>

      {/* Chess Board */}
      <div className="w-full max-w-lg">
        <Chessboard
          options={{
            position: gamePosition,
            onPieceDrop: ({ sourceSquare, targetSquare }: any) => handleMove(sourceSquare, targetSquare),
            allowDragging: !(isThinking || !!gameResult),
            boardOrientation: "white",
            boardStyle: {
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            },
          }}
        />
      </div>

      {/* Move History & Bot Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
        {/* Move History */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="font-semibold text-sm mb-2">Move History</h4>
          <div className="text-sm max-h-32 overflow-y-auto">
            {moveHistory.length === 0 ? (
              <span className="text-gray-500">No moves yet</span>
            ) : (
              moveHistory.map((move, index) => (
                <span key={index} className="mr-2">
                  {Math.floor(index / 2) + 1}
                  {index % 2 === 0 ? '. ' : '... '}
                  {move}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Last Bot Analysis */}
        {lastBotMove && (
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="font-semibold text-sm mb-2">Bot Analysis</h4>
            <div className="text-sm space-y-1">
              <div>Move: <strong>{lastBotMove.move}</strong></div>
              <div>Eval: <strong>{lastBotMove.evaluation.toFixed(2)}</strong></div>
              <div>Depth: <strong>{lastBotMove.depth}</strong></div>
              <div>Time: <strong>{lastBotMove.time}ms</strong></div>
            </div>
          </div>
        )}
      </div>

      {/* Game Controls */}
      <div className="flex space-x-2">
        <button
          onClick={resetGame}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          New Game
        </button>
        {gameResult && (
          <button
            onClick={() => {
              // TODO: Integrate with analysis system
              console.log('Analyze game:', game.pgn());
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Analyze Game
          </button>
        )}
      </div>
    </div>
  );
};

export default BotGame;