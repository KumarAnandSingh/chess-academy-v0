import React from 'react';
import { Badge } from '../ui/badge';
import { Crown, Star, Zap, Brain, Shield, Sword, Target, Trophy } from 'lucide-react';

export interface GameLevel {
  id: number;
  name: string;
  botName: string;
  botPersonality: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
  description: string;
  thinkingMessages: string[];
  skillLevel: number; // 1-20 for engine
  timeLimit?: number; // seconds per move
  icon: React.ReactNode;
  color: string;
}

export const GAME_LEVELS: GameLevel[] = [
  // Beginner Levels (1-8)
  {
    id: 1,
    name: "First Steps",
    botName: "Bobby Beginner",
    botPersonality: "friendly",
    difficulty: "beginner",
    description: "Learn the basics with a very gentle opponent",
    thinkingMessages: ["Hmm, let me think...", "What's a good move?", "Maybe this piece?"],
    skillLevel: 1,
    icon: <Crown className="h-4 w-4" />,
    color: "bg-green-100 text-green-800"
  },
  {
    id: 2,
    name: "Baby Steps",
    botName: "Anna Amateur",
    botPersonality: "encouraging",
    difficulty: "beginner",
    description: "Simple tactics and basic piece development",
    thinkingMessages: ["Looking for simple moves...", "Hmm, development first!", "Let's see..."],
    skillLevel: 2,
    icon: <Star className="h-4 w-4" />,
    color: "bg-green-100 text-green-800"
  },
  {
    id: 3,
    name: "Learning Mode",
    botName: "Carl Casual",
    botPersonality: "patient",
    difficulty: "beginner", 
    description: "Focus on piece safety and simple combinations",
    thinkingMessages: ["Checking piece safety...", "Any tactics here?", "Simple is good..."],
    skillLevel: 3,
    icon: <Shield className="h-4 w-4" />,
    color: "bg-green-100 text-green-800"
  },
  {
    id: 4,
    name: "Rookie Challenge",
    botName: "Rita Rookie",
    botPersonality: "helpful",
    difficulty: "beginner",
    description: "Basic tactics and endgame patterns",
    thinkingMessages: ["Looking for tactics...", "Can I win material?", "Endgame principles..."],
    skillLevel: 4,
    icon: <Target className="h-4 w-4" />,
    color: "bg-green-100 text-green-800"
  },
  {
    id: 5,
    name: "Novice Level",
    botName: "Nick Novice",
    botPersonality: "steady",
    difficulty: "beginner",
    description: "Improved tactical awareness",
    thinkingMessages: ["Analyzing position...", "What about this move?", "Tactical opportunities..."],
    skillLevel: 5,
    icon: <Zap className="h-4 w-4" />,
    color: "bg-green-100 text-green-800"
  },
  {
    id: 6,
    name: "Student Stage",
    botName: "Sally Student",
    botPersonality: "studious",
    difficulty: "beginner",
    description: "Better position understanding",
    thinkingMessages: ["Studying the position...", "Piece coordination...", "Strategic planning..."],
    skillLevel: 6,
    icon: <Brain className="h-4 w-4" />,
    color: "bg-green-100 text-green-800"
  },
  {
    id: 7,
    name: "Rising Player",
    botName: "Ryan Rising",
    botPersonality: "ambitious",
    difficulty: "beginner",
    description: "More complex tactical patterns",
    thinkingMessages: ["Complex tactics ahead...", "Multiple threats!", "Strategic depth..."],
    skillLevel: 7,
    icon: <Sword className="h-4 w-4" />,
    color: "bg-green-100 text-green-800"
  },
  {
    id: 8,
    name: "Promising Talent",
    botName: "Tina Talent",
    botPersonality: "confident",
    difficulty: "beginner",
    description: "Good tactical and positional play",
    thinkingMessages: ["Calculating variations...", "Positional considerations...", "Time to strike!"],
    skillLevel: 8,
    icon: <Trophy className="h-4 w-4" />,
    color: "bg-green-100 text-green-800"
  },

  // Intermediate Levels (9-16)
  {
    id: 9,
    name: "Club Player",
    botName: "Charlie Club",
    botPersonality: "competitive",
    difficulty: "intermediate",
    description: "Solid club-level play with good tactics",
    thinkingMessages: ["Deep calculation...", "Strategic planning...", "Tactical combinations..."],
    skillLevel: 9,
    icon: <Crown className="h-4 w-4" />,
    color: "bg-yellow-100 text-yellow-800"
  },
  {
    id: 10,
    name: "Tournament Ready",
    botName: "Terry Tournament",
    botPersonality: "focused",
    difficulty: "intermediate",
    description: "Tournament-level tactical awareness",
    thinkingMessages: ["Tournament mindset...", "Calculating deeply...", "No blunders allowed..."],
    skillLevel: 10,
    timeLimit: 30,
    icon: <Star className="h-4 w-4" />,
    color: "bg-yellow-100 text-yellow-800"
  },
  {
    id: 11,
    name: "Tactical Fighter",
    botName: "Felix Fighter",
    botPersonality: "aggressive",
    difficulty: "intermediate",
    description: "Sharp tactical battles and combinations",
    thinkingMessages: ["Looking for attacks...", "Tactical storm brewing...", "Time to fight!"],
    skillLevel: 11,
    timeLimit: 25,
    icon: <Sword className="h-4 w-4" />,
    color: "bg-yellow-100 text-yellow-800"
  },
  {
    id: 12,
    name: "Positional Player",
    botName: "Pete Positional",
    botPersonality: "strategic",
    difficulty: "intermediate",
    description: "Strong positional understanding",
    thinkingMessages: ["Positional evaluation...", "Long-term planning...", "Structural advantages..."],
    skillLevel: 12,
    timeLimit: 20,
    icon: <Brain className="h-4 w-4" />,
    color: "bg-yellow-100 text-yellow-800"
  },
  {
    id: 13,
    name: "Balanced Expert",
    botName: "Bella Balanced",
    botPersonality: "versatile",
    difficulty: "intermediate",
    description: "Well-rounded tactical and positional play",
    thinkingMessages: ["Balanced approach...", "All factors considered...", "Optimal choice..."],
    skillLevel: 13,
    timeLimit: 18,
    icon: <Shield className="h-4 w-4" />,
    color: "bg-yellow-100 text-yellow-800"
  },
  {
    id: 14,
    name: "Rising Expert", 
    botName: "Rex Rising",
    botPersonality: "determined",
    difficulty: "intermediate",
    description: "Strong player with few weaknesses",
    thinkingMessages: ["Expert analysis...", "No weaknesses here...", "Precise calculation..."],
    skillLevel: 14,
    timeLimit: 15,
    icon: <Zap className="h-4 w-4" />,
    color: "bg-yellow-100 text-yellow-800"
  },
  {
    id: 15,
    name: "Near Master",
    botName: "Nora Near-Master",
    botPersonality: "serious",
    difficulty: "intermediate",
    description: "Very strong play approaching master level",
    thinkingMessages: ["Master-level thinking...", "Deep understanding...", "Excellent technique..."],
    skillLevel: 15,
    timeLimit: 12,
    icon: <Crown className="h-4 w-4" />,
    color: "bg-yellow-100 text-yellow-800"
  },
  {
    id: 16,
    name: "Candidate Master",
    botName: "Max Candidate",
    botPersonality: "ambitious",
    difficulty: "intermediate",
    description: "Candidate Master strength with excellent tactics",
    thinkingMessages: ["Candidate Master level...", "Complex calculations...", "Mastery emerging..."],
    skillLevel: 16,
    timeLimit: 10,
    icon: <Trophy className="h-4 w-4" />,
    color: "bg-yellow-100 text-yellow-800"
  },

  // Advanced Levels (17-21)
  {
    id: 17,
    name: "Master Level",
    botName: "Magnus Master",
    botPersonality: "masterful",
    difficulty: "advanced",
    description: "True master strength with deep understanding",
    thinkingMessages: ["Master-level analysis...", "Profound understanding...", "Chess artistry..."],
    skillLevel: 17,
    timeLimit: 8,
    icon: <Crown className="h-4 w-4" />,
    color: "bg-red-100 text-red-800"
  },
  {
    id: 18,
    name: "International Master",
    botName: "Igor International",
    botPersonality: "worldly",
    difficulty: "advanced",
    description: "International Master level play",
    thinkingMessages: ["International standard...", "World-class thinking...", "IM-level precision..."],
    skillLevel: 18,
    timeLimit: 6,
    icon: <Star className="h-4 w-4" />,
    color: "bg-red-100 text-red-800"
  },
  {
    id: 19,
    name: "Grandmaster Track",
    botName: "Gary Grandmaster",
    botPersonality: "legendary",
    difficulty: "advanced",
    description: "Approaching Grandmaster strength",
    thinkingMessages: ["GM-level calculation...", "Legendary precision...", "Championship thinking..."],
    skillLevel: 19,
    timeLimit: 5,
    icon: <Brain className="h-4 w-4" />,
    color: "bg-red-100 text-red-800"
  },
  {
    id: 20,
    name: "Super Grandmaster",
    botName: "Sophia Super-GM",
    botPersonality: "elite",
    difficulty: "advanced",
    description: "Super Grandmaster level - elite play",
    thinkingMessages: ["Elite-level thinking...", "Superhuman calculation...", "Chess perfection..."],
    skillLevel: 20,
    timeLimit: 4,
    icon: <Sword className="h-4 w-4" />,
    color: "bg-red-100 text-red-800"
  },

  // Expert/Master Levels (21-25)
  {
    id: 21,
    name: "World Championship",
    botName: "Wesley World Champion",
    botPersonality: "champion",
    difficulty: "expert",
    description: "World Championship level strength",
    thinkingMessages: ["World Champion analysis...", "Championship precision...", "Ultimate chess..."],
    skillLevel: 20,
    timeLimit: 3,
    icon: <Crown className="h-4 w-4" />,
    color: "bg-purple-100 text-purple-800"
  },
  {
    id: 22,
    name: "Computer Challenger",
    botName: "Cypher Computer",
    botPersonality: "computational",
    difficulty: "expert",
    description: "Computer-level calculation and precision",
    thinkingMessages: ["Computing optimal moves...", "Analyzing millions of positions...", "Mechanical precision..."],
    skillLevel: 20,
    timeLimit: 2,
    icon: <Brain className="h-4 w-4" />,
    color: "bg-purple-100 text-purple-800"
  },
  {
    id: 23,
    name: "Chess Engine",
    botName: "Alpha Engine",
    botPersonality: "mechanical",
    difficulty: "expert",
    description: "Chess engine strength - nearly perfect play",
    thinkingMessages: ["Engine analysis...", "Perfect calculation...", "Optimal play engaged..."],
    skillLevel: 20,
    timeLimit: 1,
    icon: <Zap className="h-4 w-4" />,
    color: "bg-purple-100 text-purple-800"
  },
  {
    id: 24,
    name: "Stockfish Mode",
    botName: "Stockfish Supreme",
    botPersonality: "supreme",
    difficulty: "master",
    description: "Top engine level - extremely challenging",
    thinkingMessages: ["Supreme analysis...", "Stockfish precision...", "Chess mastery..."],
    skillLevel: 20,
    timeLimit: 0.5,
    icon: <Trophy className="h-4 w-4" />,
    color: "bg-black text-white"
  },
  {
    id: 25,
    name: "Chess God",
    botName: "Divinity Chess God",
    botPersonality: "divine",
    difficulty: "master",
    description: "The ultimate chess challenge - near perfect play",
    thinkingMessages: ["Divine calculation...", "Perfect chess...", "Ultimate mastery..."],
    skillLevel: 20,
    timeLimit: 0,
    icon: <Crown className="h-4 w-4" />,
    color: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
  }
];

interface GameLevelDisplayProps {
  level: GameLevel;
  isActive?: boolean;
  onClick?: () => void;
}

export const GameLevelDisplay: React.FC<GameLevelDisplayProps> = ({
  level,
  isActive = false,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
        isActive
          ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <Badge className={level.color}>
          {level.icon}
          <span className="ml-1">Level {level.id}</span>
        </Badge>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900">{level.name}</h3>
          <p className="text-sm text-gray-600">{level.botName}</p>
        </div>
      </div>
      
      <p className="text-sm text-gray-700 mb-2">{level.description}</p>
      
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>Difficulty: {level.difficulty}</span>
        {level.timeLimit && (
          <span>• Time: {level.timeLimit}s per move</span>
        )}
      </div>
    </div>
  );
};