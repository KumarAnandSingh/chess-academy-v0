import React, { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import { ChessBoard } from './ChessBoard';
import { stockfishEngine } from '../../services/stockfishEngine';
import { useGamificationStore } from '../../stores/gamificationStore';
import { AICoach } from '../ai/AICoach';
import { useGameCoach } from '../../hooks/useAICoach';
import { ResponsiveContainer, FlexContainer } from '../ui/ResponsiveContainer';
import { AnimatedButton } from '../ui/AnimatedButton';
import { MotivationalNotification } from '../ui/ProgressIndicators';
import { FadeIn, Bounce } from '../ui/AnimationUtils';
import { audioService } from '../../services/audioService';

interface PlayVsComputerProps {
  difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
  playerColor?: 'white' | 'black';
  onGameEnd?: (result: string, winner: 'player' | 'computer' | 'draw') => void;
}

export const PlayVsComputer: React.FC<PlayVsComputerProps> = ({
  difficulty = 'medium',
  playerColor = 'white',
  onGameEnd,
}) => {
  const [game, setGame] = useState(new Chess());
  const [gamePosition, setGamePosition] = useState(game.fen());
  const [isComputerThinking, setIsComputerThinking] = useState(false);
  const [gameStatus, setGameStatus] = useState<string>('');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [engineReady, setEngineReady] = useState(false);
  const [evaluation, setEvaluation] = useState<number>(0);
  const [gameStartTime, setGameStartTime] = useState(Date.now());
  const [xpGained, setXpGained] = useState(0);
  const [gameResult, setGameResult] = useState<'player' | 'computer' | 'draw' | null>(null);
  const [showAICoach, setShowAICoach] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'achievement' | 'streak' | 'level' | 'encouragement';
    isVisible: boolean;
  }>({ message: '', type: 'success', isVisible: false });

  const { completeGame } = useGamificationStore();
  const aiCoach = useGameCoach();

  useEffect(() => {
    console.log('PlayVsComputer: Setting up engine listeners');
    
    // FIXED: Check if engine is already ready
    if (stockfishEngine.ready) {
      console.log('PlayVsComputer: Engine already ready');
      setEngineReady(true);
      stockfishEngine.setDifficulty(difficulty);
    }
    
    // Set up ready event listener
    const onReady = () => {
      console.log('PlayVsComputer: Engine ready event received');
      setEngineReady(true);
      stockfishEngine.setDifficulty(difficulty);
    };

    stockfishEngine.on('ready', onReady);
    
    return () => {
      stockfishEngine.off('ready', onReady);
    };
  }, [difficulty]);

  useEffect(() => {
    // If it's computer's turn and game is not over
    if (engineReady && !game.isGameOver() && 
        ((game.turn() === 'w' && playerColor === 'black') || 
         (game.turn() === 'b' && playerColor === 'white'))) {
      makeComputerMove();
    }
  }, [gamePosition, engineReady, playerColor]);

  const makeComputerMove = useCallback(async () => {
    if (isComputerThinking || game.isGameOver()) return;

    setIsComputerThinking(true);
    try {
      const currentFen = game.fen();
      const bestMove = await stockfishEngine.getBestMove(currentFen);
      
      // Make the move if it's still valid
      const gameCopy = new Chess(currentFen);
      const move = gameCopy.move(bestMove);
      
      if (move) {
        setGame(gameCopy);
        setGamePosition(gameCopy.fen());
        setMoveHistory(prev => [...prev, move.san]);
        
        // Get evaluation after computer move
        try {
          const evalResult = await stockfishEngine.getEvaluation(gameCopy.fen());
          setEvaluation(evalResult.score);
        } catch (evalError) {
          console.log('Evaluation error:', evalError);
        }

        // Check for game over
        if (gameCopy.isGameOver()) {
          handleGameOver(gameCopy);
        }
      }
    } catch (error) {
      console.error('Computer move error:', error);
      // Fallback to random move
      const possibleMoves = game.moves({ verbose: true });
      if (possibleMoves.length > 0) {
        const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        const gameCopy = new Chess(game.fen());
        gameCopy.move(randomMove);
        setGame(gameCopy);
        setGamePosition(gameCopy.fen());
        setMoveHistory(prev => [...prev, randomMove.san]);
      }
    } finally {
      setIsComputerThinking(false);
    }
  }, [game, isComputerThinking, playerColor]);

  const handlePlayerMove = useCallback((move: { from: string; to: string; promotion?: string }) => {
    if (isComputerThinking || game.isGameOver()) return;

    const gameCopy = new Chess(game.fen());
    const moveResult = gameCopy.move(move);

    if (moveResult) {
      setGame(gameCopy);
      setGamePosition(gameCopy.fen());
      setMoveHistory(prev => [...prev, moveResult.san]);

      if (gameCopy.isGameOver()) {
        handleGameOver(gameCopy);
      }
    }
  }, [game, isComputerThinking]);

  const handleGameOver = (gameState: Chess) => {
    let result = '';
    let winner: 'player' | 'computer' | 'draw' = 'draw';

    if (gameState.isCheckmate()) {
      const winnerColor = gameState.turn() === 'w' ? 'Black' : 'White';
      result = `Checkmate! ${winnerColor} wins!`;
      winner = winnerColor.toLowerCase() === playerColor ? 'player' : 'computer';
    } else if (gameState.isDraw()) {
      if (gameState.isStalemate()) {
        result = 'Game drawn by stalemate';
      } else if (gameState.isThreefoldRepetition()) {
        result = 'Game drawn by threefold repetition';
      } else if (gameState.isInsufficientMaterial()) {
        result = 'Game drawn by insufficient material';
      } else {
        result = 'Game drawn';
      }
      winner = 'draw';
    }

    const gameTimeSpent = Date.now() - gameStartTime;
    const playerWon = winner === 'player';
    
    // Calculate XP based on game result
    let xp = playerWon ? 100 : 25; // Base XP from gamification store
    const bonuses = [];
    
    if (difficulty === 'hard') {
      xp += 20;
      bonuses.push('Hard Mode');
    }
    if (difficulty === 'expert') {
      xp += 40;
      bonuses.push('Expert Mode');
    }
    
    setXpGained(xp);
    setGameStatus(result);
    setGameResult(winner);
    
    // Play appropriate game over sound
    if (playerWon) {
      audioService.playGameStateSound('win');
      audioService.playGamificationSound('xp');
      
      // Show victory notification
      setNotification({
        message: `Victory! +${xp} XP${bonuses.length > 0 ? ' (' + bonuses.join(', ') + ' Bonus)' : ''}`,
        type: 'achievement',
        isVisible: true
      });
    } else if (winner === 'computer') {
      audioService.playGameStateSound('lose');
      
      // Show encouragement notification
      setNotification({
        message: `Good effort! +${xp} XP earned`,
        type: 'encouragement',
        isVisible: true
      });
    } else {
      // Draw
      audioService.playUISound('notification');
      
      setNotification({
        message: `Well played! +${xp} XP for the draw`,
        type: 'success',
        isVisible: true
      });
    }
    
    // Award XP through gamification system
    completeGame(playerWon, gameTimeSpent);
    
    // Analyze the game with AI coach
    aiCoach.analyzeGame(gameState.fen(), moveHistory);
    
    onGameEnd?.(result, winner);
  };

  const resetGame = () => {
    audioService.playUISound('click');
    audioService.playGameStateSound('start');
    
    const newGame = new Chess();
    setGame(newGame);
    setGamePosition(newGame.fen());
    setMoveHistory([]);
    setGameStatus('');
    setEvaluation(0);
    setIsComputerThinking(false);
    setGameStartTime(Date.now());
    setXpGained(0);
    setGameResult(null);
    setShowAICoach(false);
    setNotification({ message: '', type: 'success', isVisible: false });
    aiCoach.clearCoaching();
  };

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'hard': return 'text-orange-600 bg-orange-50';
      case 'expert': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getEvaluationBar = () => {
    // Convert centipawn evaluation to percentage
    const normalizedEval = Math.max(-500, Math.min(500, evaluation));
    const percentage = ((normalizedEval + 500) / 1000) * 100;
    
    return (
      <div className="w-full bg-gray-200 rounded-full h-4 relative">
        <div 
          className="bg-white h-4 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
          {evaluation > 0 ? '+' : ''}{(evaluation / 100).toFixed(1)}
        </div>
      </div>
    );
  };

  return (
    <ResponsiveContainer maxWidth="xl" className="play-vs-computer">
      {/* Motivational Notification */}
      <MotivationalNotification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={() => setNotification({ ...notification, isVisible: false })}
      />

      <FlexContainer 
        direction="col"
        gap="lg"
        responsive={{
          lg: { direction: 'row', justify: 'between' }
        }}
        className="min-h-screen"
      >
        {/* Chess Board Section */}
        <div className="flex flex-col items-center lg:w-1/2">
          {/* Header */}
          <FadeIn direction="up">
            <FlexContainer align="center" gap="md" className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Play vs Computer</h2>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${getDifficultyColor()}`}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </span>
            </FlexContainer>
          </FadeIn>

          {/* Chess Board */}
          <FadeIn direction="up" delay={100}>
            <div className="relative">
              <ChessBoard
                fen={gamePosition}
                orientation={playerColor}
                onMove={handlePlayerMove}
                disabled={isComputerThinking || !engineReady || game.isGameOver()}
                highlightMoves={true}
                showCoordinates={true}
              />
              
              {/* Game Over Overlay */}
              {gameResult && (
                <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg flex items-center justify-center">
                  <Bounce trigger={true}>
                    <div className="text-4xl">
                      {gameResult === 'player' ? '🎉' : gameResult === 'computer' ? '💪' : '🤝'}
                    </div>
                  </Bounce>
                </div>
              )}
            </div>
          </FadeIn>

          {/* Game Controls */}
          <FadeIn direction="up" delay={200}>
            <FlexContainer gap="sm" wrap={true} className="mt-6">
              <AnimatedButton
                onClick={resetGame}
                variant="primary"
                size="md"
                icon={<span>🎮</span>}
                disabled={isComputerThinking}
              >
                New Game
              </AnimatedButton>
              
              <AnimatedButton
                onClick={() => setShowAICoach(!showAICoach)}
                variant="secondary"
                size="md"
                icon={<span>🤖</span>}
                pulse={aiCoach.isVisible}
              >
                Coach
              </AnimatedButton>
              
              {gameResult && (
                <AnimatedButton
                  onClick={() => aiCoach.analyzeGame(game.fen(), moveHistory)}
                  variant="success"
                  size="md"
                  icon={<span>📊</span>}
                >
                  Analysis
                </AnimatedButton>
              )}
            </FlexContainer>
          </FadeIn>
        </div>

        {/* Game Info Section */}
        <div className="flex flex-col gap-6 lg:w-1/2">
          {/* AI Coach */}
          {(showAICoach || aiCoach.isVisible) && (
            <FadeIn direction="left">
              <AICoach
                position={game.fen()}
                playerLevel={5}
                isVisible={showAICoach || aiCoach.isVisible}
                onClose={() => {
                  setShowAICoach(false);
                  aiCoach.hideCoach();
                }}
                mode="game"
                context={{
                  lastMove: moveHistory[moveHistory.length - 1]
                }}
              />
            </FadeIn>
          )}

          {/* Game Status */}
          <FadeIn direction="right" delay={100}>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>🎯</span> Game Status
              </h3>
              
              {!engineReady ? (
                <FlexContainer align="center" gap="sm" className="text-yellow-700">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
                  <span className="font-medium">Initializing engine...</span>
                </FlexContainer>
              ) : isComputerThinking ? (
                <FlexContainer align="center" gap="sm" className="text-blue-700">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span className="font-medium">Computer is thinking...</span>
                </FlexContainer>
              ) : gameStatus ? (
                <div className="text-lg font-bold text-green-700 flex items-center gap-2">
                  {gameResult === 'player' && <span>🏆</span>}
                  {gameResult === 'computer' && <span>🤖</span>}
                  {gameResult === 'draw' && <span>🤝</span>}
                  {gameStatus}
                </div>
              ) : (
                <div className="space-y-2">
                  <FlexContainer justify="between">
                    <span className="text-gray-700">Turn:</span>
                    <span className="font-semibold text-gray-900">
                      {game.turn() === 'w' ? 'White' : 'Black'}
                    </span>
                  </FlexContainer>
                  {game.isCheck() && (
                    <div className="text-red-600 font-bold text-center py-2 bg-red-50 rounded-lg border border-red-200">
                      ⚠️ Check!
                    </div>
                  )}
                </div>
              )}
            </div>
          </FadeIn>

          {/* Game Results (shown when game is over) */}
          {gameResult && (
            <div className={`p-4 rounded-lg border-2 ${
              gameResult === 'player' 
                ? 'bg-green-50 border-green-200' 
                : gameResult === 'computer' 
                ? 'bg-red-50 border-red-200'
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <h3 className="font-semibold mb-3">
                {gameResult === 'player' ? '🎉 Victory!' : gameResult === 'computer' ? '💪 Good Try!' : '🤝 Draw!'}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Game duration:</span>
                  <span className="font-medium">
                    {Math.floor((Date.now() - gameStartTime) / 60000)}:{String(Math.floor(((Date.now() - gameStartTime) % 60000) / 1000)).padStart(2, '0')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>XP Earned:</span>
                  <span className="font-bold text-blue-600">+{xpGained} XP</span>
                </div>
                {difficulty === 'hard' && <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">Hard Bonus!</span>}
                {difficulty === 'expert' && <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Expert Bonus!</span>}
              </div>
            </div>
          )}

          {/* Evaluation Bar */}
          {engineReady && (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Position Evaluation</h3>
              {getEvaluationBar()}
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Black Advantage</span>
                <span>Even</span>
                <span>White Advantage</span>
              </div>
            </div>
          )}

          {/* Game Settings */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Game Settings</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Playing as:</span>
                <span className="font-medium capitalize">{playerColor}</span>
              </div>
              <div className="flex justify-between">
                <span>Difficulty:</span>
                <span className="font-medium capitalize">{difficulty}</span>
              </div>
              <div className="flex justify-between">
                <span>Moves played:</span>
                <span className="font-medium">{moveHistory.length}</span>
              </div>
            </div>
          </div>

          {/* Move History */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Move History</h3>
            <div className="max-h-32 overflow-y-auto text-sm font-mono">
              {moveHistory.length === 0 ? (
                <p className="text-gray-500">No moves yet</p>
              ) : (
                <div className="grid grid-cols-2 gap-x-4">
                  {moveHistory.map((move, index) => (
                    <div key={index} className="flex">
                      <span className="w-8 text-gray-500">
                        {Math.floor(index / 2) + 1}.
                      </span>
                      <span className={index % 2 === 0 ? 'text-gray-900' : 'text-gray-600'}>
                        {move}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </FlexContainer>
    </ResponsiveContainer>
  );
};