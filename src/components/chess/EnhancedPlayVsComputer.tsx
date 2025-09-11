import React, { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import { ChessBoard } from './ChessBoard';
import { stockfishEngine } from '../../services/stockfishEngine';
import { useGamificationStore } from '../../stores/gamificationStore';
import { GameLevel, GameLevelDisplay, GAME_LEVELS } from './GameLevel';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Crown, Settings, RotateCcw, Flag, Trophy, Brain, Play, X, Users, Award, TrendingUp, CheckCircle, XCircle, Minus } from 'lucide-react';
import { ThinkingAnimation, Confetti, CelebrationNudge } from '../ui/GamificationEffects';
import { audioService } from '../../services/audioService';

interface EnhancedPlayVsComputerProps {
  initialLevel?: number;
}

// Pro player move data for comparison
const PRO_MOVES_DATA: Record<number, number> = {
  1: 25, 2: 28, 3: 30, 4: 32, 5: 35, 6: 38, 7: 40, 8: 42,
  9: 45, 10: 48, 11: 50, 12: 52, 13: 55, 14: 58, 15: 60,
  16: 62, 17: 65, 18: 68, 19: 70, 20: 72, 21: 75, 22: 78,
  23: 80, 24: 82, 25: 85
};

interface PlayerStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  totalMoves: number;
  bestLevel: number;
  points: number;
}

interface GameSummary {
  result: 'win' | 'lose' | 'draw';
  playerMoves: number;
  proMoves: number;
  timeTaken: number;
  level: number;
  performance: 'excellent' | 'good' | 'average' | 'needs_improvement';
  tips: string[];
  pointsEarned: number;
}

export const EnhancedPlayVsComputer: React.FC<EnhancedPlayVsComputerProps> = ({
  initialLevel = 1
}) => {
  // Game state
  const [game, setGame] = useState(new Chess());
  const [gamePosition, setGamePosition] = useState(game.fen());
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white');
  const [selectedLevel, setSelectedLevel] = useState(initialLevel);
  const [gameStarted, setGameStarted] = useState(false);
  
  // UI state
  const [showLevelSelect, setShowLevelSelect] = useState(true);
  const [showColorSelect, setShowColorSelect] = useState(false);
  const [isComputerThinking, setIsComputerThinking] = useState(false);
  const [thinkingMessage, setThinkingMessage] = useState('');
  const [gameResult, setGameResult] = useState<'win' | 'lose' | 'draw' | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showGameSummary, setShowGameSummary] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  
  // Game tracking
  const [moveCount, setMoveCount] = useState(0);
  const [playerMoves, setPlayerMoves] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(Date.now());
  const [currentLevel, setCurrentLevel] = useState<GameLevel>(GAME_LEVELS[0]);
  const [gameSummary, setGameSummary] = useState<GameSummary | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  // Player statistics (in real app, this would be in a store or database)
  const [playerStats, setPlayerStats] = useState<PlayerStats>(() => {
    const saved = localStorage.getItem('chessPlayerStats');
    return saved ? JSON.parse(saved) : {
      gamesPlayed: 0, wins: 0, losses: 0, draws: 0,
      totalMoves: 0, bestLevel: 1, points: 0
    };
  });
  
  // Leaderboard data (mock data for bots + player)
  const [leaderboard, setLeaderboard] = useState(() => {
    const botScores = GAME_LEVELS.slice(0, 10).map(level => ({
      name: level.botName,
      points: Math.floor(Math.random() * 500) + level.id * 50,
      level: level.id,
      gamesPlayed: Math.floor(Math.random() * 100) + 50
    }));
    return [...botScores, {
      name: 'You',
      points: playerStats.points,
      level: playerStats.bestLevel,
      gamesPlayed: playerStats.gamesPlayed
    }].sort((a, b) => b.points - a.points);
  });

  const { completeGame } = useGamificationStore();

  // Update current level when selection changes
  useEffect(() => {
    if (selectedLevel >= 1 && selectedLevel <= GAME_LEVELS.length) {
      setCurrentLevel(GAME_LEVELS[selectedLevel - 1]);
    }
  }, [selectedLevel]);

  // Initialize currentLevel on component mount
  useEffect(() => {
    if (selectedLevel >= 1 && selectedLevel <= GAME_LEVELS.length) {
      setCurrentLevel(GAME_LEVELS[selectedLevel - 1]);
    }
  }, []);

  // Timer to update game time display
  useEffect(() => {
    let interval: number;
    if (gameStarted && gameResult === null) {
      interval = window.setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStarted, gameResult]);

  // Handle color selection
  const handleColorSelect = (color: 'white' | 'black') => {
    console.log('Starting new game with color:', color);
    
    setPlayerColor(color);
    setShowColorSelect(false);
    setShowLevelSelect(false);
    startNewGame(color);
  };

  // Start new game
  const startNewGame = (color: 'white' | 'black') => {
    console.log('Starting new game:', color, 'vs', currentLevel.botName);
    
    const newGame = new Chess();
    setGame(newGame);
    setGamePosition(newGame.fen());
    setPlayerColor(color);
    setGameStarted(true);
    setGameResult(null);
    setMoveCount(0);
    setPlayerMoves(0);
    setGameStartTime(Date.now());
    
    // Configure engine for selected level
    stockfishEngine.setDifficulty(
      currentLevel.difficulty === 'beginner' ? 'easy' :
      currentLevel.difficulty === 'intermediate' ? 'medium' :
      currentLevel.difficulty === 'advanced' ? 'hard' : 'expert'
    );
    
    // Play game start sound
    audioService.playGameStateSound('start');
    
    // If player is black, make computer move first
    if (color === 'black') {
      console.log('Player is black, computer will move first');
      setTimeout(() => makeComputerMove(newGame), 500);
    }
  };

  // Computer move logic
  const makeComputerMove = async (gameState: Chess) => {
    setIsComputerThinking(true);
    
    // Random thinking message based on bot personality
    const messages = currentLevel.thinkingMessages;
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setThinkingMessage(`${currentLevel.botName}: ${randomMessage}`);
    
    try {
      // Add realistic thinking time based on level
      const thinkingTime = currentLevel.timeLimit 
        ? currentLevel.timeLimit * 1000 
        : Math.random() * 2000 + 1000;
      
      await new Promise(resolve => setTimeout(resolve, Math.max(thinkingTime, 500)));
      
      const bestMove = await stockfishEngine.getBestMove(gameState.fen(), currentLevel.skillLevel);
      
      console.log('Computer received move from engine:', bestMove);
      
      if (bestMove && bestMove !== 'a1a1') {
        try {
          const move = gameState.move(bestMove);
          if (move) {
            console.log('Computer move successful:', move.san);
            setGame(new Chess(gameState.fen()));
            setGamePosition(gameState.fen());
            setMoveCount(prev => prev + 1);
            
            // Play move sound
            audioService.playMoveSound(!!move.captured);
            
            // Check for game end
            checkGameEnd(gameState);
          } else {
            console.error('Computer move failed - invalid move:', bestMove);
          }
        } catch (error) {
          console.error('Computer move error:', error, 'Move:', bestMove);
        }
      } else {
        console.warn('No valid computer move generated');
      }
    } catch (error) {
      console.error('Computer move error:', error);
    } finally {
      setIsComputerThinking(false);
      setThinkingMessage('');
    }
  };

  // Handle player moves
  const handlePlayerMove = (move: { from: string; to: string; promotion?: string }) => {
    console.log('Player move attempt:', move, 'from position:', gamePosition);
    
    const newGame = new Chess(gamePosition);
    const moveResult = newGame.move(move);
    
    if (moveResult) {
      console.log('Player move successful:', moveResult.san, 'new position:', newGame.fen());
      setGame(newGame);
      setGamePosition(newGame.fen());
      setMoveCount(prev => prev + 1);
      setPlayerMoves(prev => prev + 1);
      
      // Check for game end
      if (checkGameEnd(newGame)) {
        return;
      }
      
      // Make computer move after a short delay
      setTimeout(() => {
        console.log('Triggering computer move...');
        makeComputerMove(newGame);
      }, 300);
    } else {
      console.error('Player move failed - invalid move:', move);
    }
  };

  // Check game end conditions
  const checkGameEnd = (gameState: Chess): boolean => {
    if (gameState.isGameOver()) {
      const gameTime = Date.now() - gameStartTime;
      let result: 'win' | 'lose' | 'draw';
      
      if (gameState.isCheckmate()) {
        const winner = gameState.turn() === 'w' ? 'black' : 'white';
        const playerWon = winner === playerColor;
        
        if (playerWon) {
          result = 'win';
          setGameResult('win');
          setShowCelebration(true);
          setShowConfetti(true);
          audioService.playGameStateSound('win');
        } else {
          result = 'lose';
          setGameResult('lose');
          audioService.playGameStateSound('lose');
        }
      } else {
        result = 'draw';
        setGameResult('draw');
        audioService.playUISound('notification');
      }
      
      // Generate game summary
      generateGameSummary(result, playerMoves, gameTime);
      
      return true;
    }
    
    return false;
  };
  
  // Generate game summary with performance analysis
  const generateGameSummary = (result: 'win' | 'lose' | 'draw', moves: number, time: number) => {
    const proMoves = PRO_MOVES_DATA[selectedLevel] || 50;
    const efficiency = moves / proMoves;
    
    let performance: 'excellent' | 'good' | 'average' | 'needs_improvement';
    let pointsEarned = 0;
    let tips: string[] = [];
    
    if (result === 'win') {
      pointsEarned = selectedLevel * 10;
      if (efficiency <= 1.2) {
        performance = 'excellent';
        pointsEarned += 20;
        tips = ['Outstanding efficiency!', 'You played like a pro!', 'Try the next level!'];
      } else if (efficiency <= 1.5) {
        performance = 'good';
        pointsEarned += 10;
        tips = ['Good game!', 'Work on tactical patterns', 'Consider endgame studies'];
      } else {
        performance = 'average';
        tips = ['Victory achieved!', 'Focus on piece activity', 'Study opening principles'];
      }
    } else if (result === 'draw') {
      pointsEarned = selectedLevel * 3;
      performance = 'average';
      tips = ['Draw achieved!', 'Look for winning chances', 'Practice tactics daily'];
    } else {
      pointsEarned = selectedLevel;
      performance = 'needs_improvement';
      tips = ['Keep practicing!', 'Review basic tactics', 'Study endgame fundamentals'];
    }
    
    const summary: GameSummary = {
      result, playerMoves: moves, proMoves, timeTaken: time,
      level: selectedLevel, performance, tips, pointsEarned
    };
    
    setGameSummary(summary);
    updatePlayerStats(result, moves, pointsEarned);
    setTimeout(() => setShowGameSummary(true), 1000);
  };
  
  // Update player statistics
  const updatePlayerStats = (result: 'win' | 'lose' | 'draw', moves: number, points: number) => {
    const newStats = { ...playerStats };
    newStats.gamesPlayed += 1;
    newStats.totalMoves += moves;
    newStats.points += points;
    
    if (result === 'win') {
      newStats.wins += 1;
      if (selectedLevel > newStats.bestLevel) {
        newStats.bestLevel = selectedLevel;
      }
    } else if (result === 'lose') {
      newStats.losses += 1;
    } else {
      newStats.draws += 1;
    }
    
    setPlayerStats(newStats);
    localStorage.setItem('chessPlayerStats', JSON.stringify(newStats));
    
    // Update leaderboard
    setLeaderboard(prev => {
      const updated = prev.map(entry => 
        entry.name === 'You' 
          ? { ...entry, points: newStats.points, level: newStats.bestLevel, gamesPlayed: newStats.gamesPlayed }
          : entry
      );
      return updated.sort((a, b) => b.points - a.points);
    });
  };

  // Reset game
  const resetGame = () => {
    setGameStarted(false);
    setShowLevelSelect(true);
    setShowColorSelect(false);
    setGameResult(null);
    setShowCelebration(false);
    setShowConfetti(false);
    setShowGameSummary(false);
    setPlayerMoves(0);
    setGameSummary(null);
  };
  
  // Quit game
  const quitGame = () => {
    if (window.confirm('Are you sure you want to quit this game?')) {
      resetGame();
    }
  };
  
  // Forfeit game
  const forfeitGame = () => {
    if (window.confirm('Are you sure you want to forfeit this game?')) {
      setGameResult('lose');
      generateGameSummary('lose', playerMoves, Date.now() - gameStartTime);
      audioService.playGameStateSound('lose');
    }
  };

  // Debug current render state (only when state changes significantly)
  if (gameStarted && !showLevelSelect && !showColorSelect) {
    console.log('Game screen rendered - Game state:', { 
      gameStarted, 
      gamePosition: gamePosition.substring(0, 20) + '...', 
      playerColor,
      isComputerThinking,
      disabled: isComputerThinking || gameResult !== null
    });
  }

  // Leaderboard screen
  if (showLeaderboard) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-6 w-6" />
                Leaderboard
              </div>
              <Button onClick={() => setShowLeaderboard(false)} variant="outline">
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div 
                  key={entry.name}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    entry.name === 'You' 
                      ? 'bg-blue-50 border-2 border-blue-200' 
                      : 'bg-surface-elevated border border-border-default'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-400 text-yellow-900' :
                        index === 1 ? 'bg-slate-400 text-white' :
                        index === 2 ? 'bg-orange-400 text-orange-900' :
                        'bg-surface'
                      }`}
                      style={
                        index > 2 
                          ? { color: 'var(--color-text-secondary)' } 
                          : {}
                      }
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{entry.name}</p>
                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Level {entry.level} • {entry.gamesPlayed} games</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{entry.points}</p>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>points</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">Your Statistics</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>Games: {playerStats.gamesPlayed}</div>
                <div>Wins: {playerStats.wins}</div>
                <div>Best Level: {playerStats.bestLevel}</div>
                <div>Win Rate: {playerStats.gamesPlayed > 0 ? Math.round((playerStats.wins / playerStats.gamesPlayed) * 100) : 0}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Game summary screen
  if (showGameSummary && gameSummary) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className={
          gameSummary.result === 'win' ? 'border-green-500 bg-green-50' :
          gameSummary.result === 'lose' ? 'border-red-500 bg-red-50' :
          'border-yellow-500 bg-yellow-50'
        }>
          <CardHeader>
            <CardTitle className="text-center">
              {gameSummary.result === 'win' ? '🏆 Victory!' : 
               gameSummary.result === 'lose' ? '😔 Defeat' : '🤝 Draw'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">+{gameSummary.pointsEarned} points</div>
              <Badge className={`text-lg px-4 py-2 ${
                gameSummary.performance === 'excellent' ? 'bg-green-100 text-green-800' :
                gameSummary.performance === 'good' ? 'bg-blue-100 text-blue-800' :
                gameSummary.performance === 'average' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {gameSummary.performance.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" /> Performance Comparison
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Your moves:</span>
                    <span className="font-bold">{gameSummary.playerMoves}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pro moves:</span>
                    <span className="font-bold">{gameSummary.proMoves}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Efficiency:</span>
                    <span className={`font-bold ${
                      gameSummary.playerMoves <= gameSummary.proMoves * 1.2 ? 'text-green-600' :
                      gameSummary.playerMoves <= gameSummary.proMoves * 1.5 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {Math.round((gameSummary.proMoves / gameSummary.playerMoves) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time taken:</span>
                    <span className="font-bold">
                      {Math.floor(gameSummary.timeTaken / 60000)}:
                      {String(Math.floor((gameSummary.timeTaken % 60000) / 1000)).padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" /> Tips & Improvement
                </h3>
                <ul className="space-y-1 text-sm">
                  {gameSummary.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
            
            <div className="flex justify-center gap-4">
              <Button onClick={resetGame} size="lg">
                <RotateCcw className="h-4 w-4 mr-2" />
                Play Again
              </Button>
              {gameSummary.result === 'win' && selectedLevel < 25 && (
                <Button 
                  onClick={() => {
                    setSelectedLevel(prev => prev + 1);
                    setShowGameSummary(false);
                    setShowColorSelect(true);
                  }}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Award className="h-4 w-4 mr-2" />
                  Next Level
                </Button>
              )}
              <Button onClick={() => setShowLeaderboard(true)} variant="outline" size="lg">
                <Trophy className="h-4 w-4 mr-2" />
                Leaderboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Level selection screen
  if (showLevelSelect) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-6 w-6" />
              Choose Your Challenge Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {GAME_LEVELS.slice(0, 25).map((level) => (
                <GameLevelDisplay
                  key={level.id}
                  level={level}
                  isActive={selectedLevel === level.id}
                  onClick={() => {
                    setSelectedLevel(level.id);
                    setCurrentLevel(level);
                  }}
                />
              ))}
            </div>
            
            <div className="mt-6 flex justify-center gap-4">
              <Button
                onClick={() => {
                  setShowColorSelect(true);
                  setShowLevelSelect(false);
                }}
                disabled={!selectedLevel || !currentLevel}
                size="lg"
                className={`flex items-center gap-2 bg-green-600 hover:bg-green-700 ${
                  (!selectedLevel || !currentLevel) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Play className="h-5 w-5" />
                PLAY vs {currentLevel?.botName || 'Computer'}
              </Button>
              <Button
                onClick={() => setShowLeaderboard(true)}
                variant="outline"
                size="lg"
                className="flex items-center gap-2"
              >
                <Trophy className="h-4 w-4" />
                Leaderboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Color selection screen
  if (showColorSelect) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Choose Your Color</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">
                Playing against: {currentLevel?.botName || 'Computer'}
              </h3>
              <p style={{ color: 'var(--color-text-secondary)' }}>{currentLevel?.description || 'Select a difficulty level to play'}</p>
            </div>
            
            <div className="flex justify-center gap-8">
              <Button
                onClick={() => handleColorSelect('white')}
                size="lg"
                variant="outline"
                className="flex flex-col items-center gap-2 h-24 w-32"
              >
                <div className="text-4xl">♔</div>
                <span>White</span>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>You move first</span>
              </Button>
              
              <Button
                onClick={() => handleColorSelect('black')}
                size="lg"
                variant="outline"
                className="flex flex-col items-center gap-2 h-24 w-32"
              >
                <div className="text-4xl">♚</div>
                <span>Black</span>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Computer starts</span>
              </Button>
            </div>
            
            <div className="mt-6 text-center">
              <Button
                onClick={() => {
                  setShowColorSelect(false);
                  setShowLevelSelect(true);
                }}
                variant="ghost"
              >
                Back to Level Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main game screen
  return (
    <div className="container mx-auto px-4 py-4 md:py-8 max-w-7xl">
      {/* Game Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge 
            className="px-3 py-1 min-h-[20px] text-white font-semibold text-sm"
            style={{
              backgroundColor: currentLevel.id <= 8 ? '#22C55E' : 
                             currentLevel.id <= 16 ? '#EAB308' : 
                             currentLevel.id <= 20 ? '#F97316' : 
                             currentLevel.id <= 23 ? '#DC2626' : '#7C2D12',
              color: '#FFFFFF',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            {currentLevel.icon}
            <span className="ml-1">Level {currentLevel.id}</span>
          </Badge>
          <div>
            <h2 className="text-xl font-bold">{currentLevel.name}</h2>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>vs {currentLevel.botName}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => window.confirm("Are you sure you want to quit this game?") && quitGame()} 
            variant="destructive" 
            size="sm" 
            className="min-h-[44px] bg-red-600 hover:bg-red-700 text-white border-red-600"
          >
            <X className="h-4 w-4 mr-1" />
            Quit
          </Button>
          <Button 
            onClick={() => window.confirm("Are you sure you want to forfeit this game?") && forfeitGame()} 
            variant="outline" 
            size="sm" 
            className="min-h-[44px] text-red-600 hover:text-red-700 border-red-600 hover:bg-red-50"
          >
            <Flag className="h-4 w-4 mr-1" />
            Forfeit
          </Button>
          <Button 
            onClick={resetGame} 
            variant="primary" 
            size="sm" 
            className="min-h-[44px]"
            style={{ 
              backgroundColor: 'var(--color-cta-primary)', 
              color: '#ffffff',
              border: 'none'
            }}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            New Game
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Chess Board */}
        <div className="xl:col-span-3 flex justify-center">
          <div 
            className="relative w-full max-w-[600px]" 
            style={{ 
              maxHeight: 'calc(100vh - 200px)',
              minHeight: '400px'
            }}
          >
            <ChessBoard
              fen={gamePosition}
              orientation={playerColor}
              onMove={handlePlayerMove}
              disabled={isComputerThinking || gameResult !== null}
              showPieceTooltips={true}
              enableGamification={true}
              showHelp={false}
            />
            {/* Debug info - remove in production */}
            {import.meta.env.DEV && (
              <div className="mt-2 text-xs bg-surface p-2 rounded" style={{ color: 'var(--color-text-muted)' }}>
                <div>FEN: {gamePosition.substring(0, 30)}...</div>
                <div>Turn: {game.turn() === 'w' ? 'White' : 'Black'}</div>
                <div>Disabled: {(isComputerThinking || gameResult !== null).toString()}</div>
                <div>Computer thinking: {isComputerThinking.toString()}</div>
              </div>
            )}
          </div>
        </div>

        {/* Game Info Panel */}
        <div className="space-y-4">
          {/* Game Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Game Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Your Moves:</span>
                  <span className="font-bold">{playerMoves}</span>
                </div>
                <div className="flex justify-between">
                  <span>Target Moves:</span>
                  <span className="font-bold text-green-600">{PRO_MOVES_DATA[selectedLevel] || 50}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span className="font-bold">
                    {Math.floor((currentTime - gameStartTime) / 60000)}:
                    {String(Math.floor(((currentTime - gameStartTime) % 60000) / 1000)).padStart(2, '0')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Turn:</span>
                  <span className="font-bold">
                    {game.turn() === playerColor[0] ? 'Your move' : currentLevel.botName + "'s move"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bot Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-4 w-4" />
                {currentLevel.botName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>{currentLevel.description}</p>
              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Difficulty: {currentLevel.difficulty}
                {currentLevel.timeLimit && ` • ${currentLevel.timeLimit}s per move`}
              </div>
            </CardContent>
          </Card>

          {/* Game Result */}
          {gameResult && (
            <Card className={
              gameResult === 'win' ? 'border-green-500 bg-green-50' :
              gameResult === 'lose' ? 'border-red-500 bg-red-50' :
              'border-yellow-500 bg-yellow-50'
            }>
              <CardContent className="pt-6 text-center">
                <div className="flex justify-center mb-2">
                  {gameResult === 'win' ? (
                    <Trophy className="h-8 w-8 text-yellow-500" aria-label="Victory" />
                  ) : gameResult === 'lose' ? (
                    <XCircle className="h-8 w-8 text-red-500" aria-label="Defeat" />
                  ) : (
                    <Minus className="h-8 w-8 text-gray-500" aria-label="Draw" />
                  )}
                </div>
                <h3 className="text-lg font-bold mb-2">
                  {gameResult === 'win' ? 'Victory!' : gameResult === 'lose' ? 'Defeat' : 'Draw'}
                </h3>
                <div className="flex gap-2 justify-center">
                  <Button onClick={resetGame} size="sm">
                    New Game
                  </Button>
                  <Button onClick={() => setSelectedLevel(Math.min(25, selectedLevel + 1))} size="sm">
                    Next Level
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Thinking Animation */}
      <ThinkingAnimation
        show={isComputerThinking}
        message={thinkingMessage}
      />

      {/* Celebration Effects */}
      <Confetti 
        show={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />
      
      <CelebrationNudge
        show={showCelebration}
        message={`Victory against ${currentLevel.botName}!`}
        type="win"
        onComplete={() => setShowCelebration(false)}
      />
    </div>
  );
};