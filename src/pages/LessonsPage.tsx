import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { LessonPlayer } from '../components/lessons/LessonPlayer';
import { BookOpen, Play, TrendingUp } from 'lucide-react';
// Import removed - using local guided practice data

interface Lesson {
  id: string;
  title: string;
  description: string;
  difficulty: 'Basics' | 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  duration: number;
  modules: string[];
  completed: boolean;
  progress: number;
  ratingRange: string;
  prerequisites?: string[];
  objectives: string[];
}

interface LessonCategory {
  id: string;
  title: string;
  description: string;
  difficulty: 'Basics' | 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  ratingRange: string;
  totalLessons: number;
  estimatedHours: number;
  lessons: Lesson[];
}

// Comprehensive A-Z Chess Curriculum
const chessCurriculum: LessonCategory[] = [
  {
    id: 'chess-basics',
    title: '📚 Chess Basics',
    description: 'Complete introduction to chess - from board setup to piece movements',
    difficulty: 'Basics',
    ratingRange: '0-400',
    totalLessons: 8,
    estimatedHours: 4,
    lessons: [
      {
        id: 'chess-101',
        title: '1. Welcome to Chess',
        description: 'Chess history, board setup, and piece identification',
        difficulty: 'Basics',
        duration: 20,
        ratingRange: '0-200',
        modules: ['What is Chess?', 'The Chessboard', 'Meet the Pieces', 'Setting Up'],
        completed: false,
        progress: 0,
        objectives: ['Identify all chess pieces', 'Set up the board correctly', 'Understand chess notation']
      },
      {
        id: 'pawn-moves',
        title: '2. How Pawns Move',
        description: 'Pawn movement, capture, and special rules (en passant, promotion)',
        difficulty: 'Basics',
        duration: 25,
        ratingRange: '0-200',
        modules: ['Basic Pawn Movement', 'Pawn Captures', 'En Passant', 'Pawn Promotion'],
        completed: false,
        progress: 0,
        objectives: ['Master pawn movement', 'Understand pawn captures', 'Learn special pawn rules']
      },
      {
        id: 'rook-moves',
        title: '3. How Rooks Move',
        description: 'Rook movement patterns and tactical opportunities',
        difficulty: 'Basics',
        duration: 20,
        ratingRange: '100-300',
        modules: ['Rook Movement', 'Rook Captures', 'Rook vs Pawns', 'Basic Rook Tactics'],
        completed: false,
        progress: 0,
        objectives: ['Master rook movement', 'Recognize rook tactical patterns', 'Use rooks effectively']
      },
      {
        id: 'bishop-moves',
        title: '4. How Bishops Move',
        description: 'Bishop movement, good vs bad bishops, and diagonal control',
        difficulty: 'Basics',
        duration: 20,
        ratingRange: '100-300',
        modules: ['Bishop Movement', 'Light vs Dark Squares', 'Good vs Bad Bishops', 'Bishop Pairs'],
        completed: false,
        progress: 0,
        objectives: ['Master bishop movement', 'Understand diagonal control', 'Evaluate bishop strength']
      },
      {
        id: 'knight-moves',
        title: '5. How Knights Move',
        description: 'Knight movement patterns and the unique L-shaped move',
        difficulty: 'Basics',
        duration: 25,
        ratingRange: '100-300',
        modules: ['Knight Movement', 'L-shaped Moves', 'Knight Forks', 'Knight Outposts'],
        completed: false,
        progress: 0,
        objectives: ['Master knight movement', 'Understand knight tactics', 'Find knight outposts']
      },
      {
        id: 'queen-moves',
        title: '6. How the Queen Moves',
        description: 'Queen movement combining rook and bishop powers',
        difficulty: 'Basics',
        duration: 20,
        ratingRange: '200-400',
        modules: ['Queen Movement', 'Queen Power', 'Early Queen Development', 'Queen Safety'],
        completed: false,
        progress: 0,
        objectives: ['Master queen movement', 'Understand queen power', 'Keep queen safe']
      },
      {
        id: 'king-moves',
        title: '7. How the King Moves',
        description: 'King movement, safety, and the special castling move',
        difficulty: 'Basics',
        duration: 25,
        ratingRange: '200-400',
        modules: ['King Movement', 'King Safety', 'Castling Rules', 'King Activity'],
        completed: false,
        progress: 0,
        objectives: ['Master king movement', 'Learn castling rules', 'Understand king safety']
      },
      {
        id: 'check-checkmate',
        title: '8. Check, Checkmate & Stalemate',
        description: 'Understanding check, checkmate, and stalemate conditions',
        difficulty: 'Basics',
        duration: 30,
        ratingRange: '200-400',
        modules: ['What is Check?', 'Escaping Check', 'Checkmate vs Stalemate', 'Basic Checkmates'],
        completed: false,
        progress: 0,
        objectives: ['Recognize check situations', 'Deliver checkmate', 'Avoid stalemate']
      }
    ]
  },
  {
    id: 'beginner-fundamentals',
    title: '🎯 Beginner Fundamentals',
    description: 'Essential chess knowledge for new players',
    difficulty: 'Beginner',
    ratingRange: '400-800',
    totalLessons: 10,
    estimatedHours: 8,
    lessons: [
      {
        id: 'opening-principles',
        title: '9. Opening Principles',
        description: 'Control center, develop pieces, and castle early',
        difficulty: 'Beginner',
        duration: 35,
        ratingRange: '400-600',
        modules: ['Control the Center', 'Develop Pieces', 'King Safety', 'Common Mistakes'],
        completed: false,
        progress: 0,
        objectives: ['Apply opening principles', 'Avoid common traps', 'Achieve good development']
      },
      {
        id: 'basic-tactics',
        title: '10. Basic Tactics: Forks',
        description: 'Attack two pieces simultaneously with forks',
        difficulty: 'Beginner',
        duration: 40,
        ratingRange: '400-600',
        modules: ['What is a Fork?', 'Knight Forks', 'Pawn Forks', 'Queen Forks'],
        completed: false,
        progress: 0,
        objectives: ['Recognize fork opportunities', 'Execute tactical forks', 'Defend against forks']
      },
      {
        id: 'basic-pins',
        title: '11. Basic Tactics: Pins',
        description: 'Pin pieces to more valuable targets behind them',
        difficulty: 'Beginner',
        duration: 40,
        ratingRange: '500-700',
        modules: ['Absolute Pins', 'Relative Pins', 'Pin Breaking', 'Pin Combinations'],
        completed: false,
        progress: 0,
        objectives: ['Create tactical pins', 'Break opponent pins', 'Use pins in combinations']
      },
      {
        id: 'basic-skewers',
        title: '12. Basic Tactics: Skewers',
        description: 'Force valuable pieces to move and win material behind',
        difficulty: 'Beginner',
        duration: 35,
        ratingRange: '500-700',
        modules: ['What is a Skewer?', 'Rook Skewers', 'Bishop Skewers', 'Queen Skewers'],
        completed: false,
        progress: 0,
        objectives: ['Execute skewer tactics', 'Recognize skewer patterns', 'Combine with other tactics']
      },
      {
        id: 'piece-values',
        title: '13. Piece Values & Exchanges',
        description: 'Understanding relative piece values and when to trade',
        difficulty: 'Beginner',
        duration: 30,
        ratingRange: '400-600',
        modules: ['Point Values', 'Equal Trades', 'Favorable Exchanges', 'When NOT to Trade'],
        completed: false,
        progress: 0,
        objectives: ['Calculate piece values', 'Make favorable trades', 'Avoid bad exchanges']
      },
      {
        id: 'basic-endgame',
        title: '14. Basic Checkmate Patterns',
        description: 'Essential checkmate techniques with major pieces',
        difficulty: 'Beginner',
        duration: 45,
        ratingRange: '500-700',
        modules: ['Queen + King vs King', 'Rook + King vs King', 'Back Rank Mate', 'Smothered Mate'],
        completed: false,
        progress: 0,
        objectives: ['Deliver basic checkmates', 'Avoid stalemate tricks', 'Practice mate patterns']
      },
      {
        id: 'pawn-structure',
        title: '15. Basic Pawn Structure',
        description: 'Understanding pawn chains, islands, and weaknesses',
        difficulty: 'Beginner',
        duration: 35,
        ratingRange: '600-800',
        modules: ['Pawn Chains', 'Isolated Pawns', 'Doubled Pawns', 'Passed Pawns'],
        completed: false,
        progress: 0,
        objectives: ['Evaluate pawn structure', 'Create passed pawns', 'Exploit pawn weaknesses']
      },
      {
        id: 'time-management',
        title: '16. Time Management',
        description: 'How to manage your clock in chess games',
        difficulty: 'Beginner',
        duration: 25,
        ratingRange: '400-600',
        modules: ['Chess Clocks', 'Time Allocation', 'Time Pressure', 'Practical Tips'],
        completed: false,
        progress: 0,
        objectives: ['Use chess clock effectively', 'Handle time pressure', 'Allocate time wisely']
      },
      {
        id: 'common-openings',
        title: '17. Common Chess Openings',
        description: 'Introduction to popular opening systems',
        difficulty: 'Beginner',
        duration: 50,
        ratingRange: '600-800',
        modules: ['Italian Game', 'Spanish Opening', 'Queen\'s Gambit', 'King\'s Indian Defense'],
        completed: false,
        progress: 0,
        objectives: ['Play common openings', 'Understand opening ideas', 'Avoid opening traps']
      },
      {
        id: 'game-analysis',
        title: '18. Analyzing Your Games',
        description: 'How to review and learn from your chess games',
        difficulty: 'Beginner',
        duration: 30,
        ratingRange: '500-700',
        modules: ['Post-Game Analysis', 'Finding Mistakes', 'Learning from Losses', 'Using Chess Engines'],
        completed: false,
        progress: 0,
        objectives: ['Analyze games effectively', 'Identify mistakes', 'Learn from analysis']
      }
    ]
  },
  {
    id: 'intermediate-strategy',
    title: '🔥 Intermediate Strategy',
    description: 'Deepen your understanding of chess strategy and tactics',
    difficulty: 'Intermediate',
    ratingRange: '800-1400',
    totalLessons: 12,
    estimatedHours: 15,
    lessons: [
      {
        id: 'advanced-tactics',
        title: '19. Advanced Tactical Patterns',
        description: 'Discovered attacks, deflection, and decoy tactics',
        difficulty: 'Intermediate',
        duration: 50,
        ratingRange: '800-1200',
        modules: ['Discovered Attacks', 'Deflection', 'Decoy', 'Clearance', 'Interference'],
        completed: false,
        progress: 0,
        prerequisites: ['basic-tactics', 'basic-pins'],
        objectives: ['Master advanced tactics', 'Combine multiple themes', 'Calculate complex sequences']
      },
      {
        id: 'positional-play',
        title: '20. Introduction to Positional Play',
        description: 'Understanding piece coordination and strategic plans',
        difficulty: 'Intermediate',
        duration: 45,
        ratingRange: '900-1300',
        modules: ['Piece Coordination', 'Strategic Planning', 'Weak Squares', 'Space Advantage'],
        completed: false,
        progress: 0,
        objectives: ['Develop strategic thinking', 'Create long-term plans', 'Evaluate positions']
      },
      {
        id: 'middlegame-strategy',
        title: '21. Middlegame Planning',
        description: 'Strategic concepts for the middlegame phase',
        difficulty: 'Intermediate',
        duration: 55,
        ratingRange: '1000-1400',
        modules: ['Pawn Breaks', 'Piece Exchanges', 'King Safety', 'Initiative'],
        completed: false,
        progress: 0,
        objectives: ['Plan in middlegame', 'Execute pawn breaks', 'Maintain initiative']
      },
      {
        id: 'endgame-fundamentals',
        title: '22. Essential Endgames',
        description: 'Key endgame positions every player must know',
        difficulty: 'Intermediate',
        duration: 60,
        ratingRange: '800-1200',
        modules: ['Opposition', 'Key Squares', 'Rook Endgames', 'Queen Endgames'],
        completed: false,
        progress: 0,
        objectives: ['Master basic endgames', 'Use opposition correctly', 'Convert advantages']
      },
      {
        id: 'attack-defense',
        title: '23. Attack and Defense',
        description: 'Launching attacks while maintaining defensive solidity',
        difficulty: 'Intermediate',
        duration: 50,
        ratingRange: '1000-1400',
        modules: ['King Attacks', 'Defensive Resources', 'Counterplay', 'Sacrifices'],
        completed: false,
        progress: 0,
        objectives: ['Launch effective attacks', 'Defend accurately', 'Find counterplay']
      },
      {
        id: 'piece-activity',
        title: '24. Piece Activity and Coordination',
        description: 'Maximizing the effectiveness of your pieces',
        difficulty: 'Intermediate',
        duration: 40,
        ratingRange: '900-1300',
        modules: ['Active vs Passive Pieces', 'Piece Harmony', 'Outposts', 'Bad Bishops'],
        completed: false,
        progress: 0,
        objectives: ['Activate all pieces', 'Coordinate piece play', 'Improve bad pieces']
      },
      {
        id: 'pawn-endgames',
        title: '25. Advanced Pawn Endgames',
        description: 'Complex pawn endgame techniques and principles',
        difficulty: 'Intermediate',
        duration: 55,
        ratingRange: '1100-1400',
        modules: ['King and Pawn vs King', 'Multiple Pawns', 'Pawn Races', 'Zugzwang'],
        completed: false,
        progress: 0,
        objectives: ['Master pawn endgames', 'Calculate pawn races', 'Use zugzwang']
      },
      {
        id: 'opening-strategy',
        title: '26. Opening Strategy Deep Dive',
        description: 'Strategic understanding of opening principles',
        difficulty: 'Intermediate',
        duration: 45,
        ratingRange: '900-1300',
        modules: ['Opening Plans', 'Pawn Structures', 'Piece Development', 'Central Control'],
        completed: false,
        progress: 0,
        objectives: ['Understand opening plans', 'Choose right openings', 'Transition to middlegame']
      },
      {
        id: 'tactical-combinations',
        title: '27. Complex Tactical Combinations',
        description: 'Multi-move tactical sequences and combinations',
        difficulty: 'Intermediate',
        duration: 60,
        ratingRange: '1000-1400',
        modules: ['Combination Types', 'Calculation Techniques', 'Tactical Vision', 'Pattern Recognition'],
        completed: false,
        progress: 0,
        objectives: ['Calculate deep combinations', 'Recognize tactical patterns', 'Improve tactical vision']
      },
      {
        id: 'strategic-exchanges',
        title: '28. Strategic Piece Exchanges',
        description: 'When and how to exchange pieces for strategic advantage',
        difficulty: 'Intermediate',
        duration: 40,
        ratingRange: '1100-1400',
        modules: ['Trading Pieces', 'Simplification', 'Keeping Tension', 'Exchange Sacrifices'],
        completed: false,
        progress: 0,
        objectives: ['Make strategic exchanges', 'Simplify positions', 'Maintain tension']
      },
      {
        id: 'weak-squares',
        title: '29. Exploiting Weaknesses',
        description: 'Identifying and exploiting positional weaknesses',
        difficulty: 'Intermediate',
        duration: 45,
        ratingRange: '1000-1400',
        modules: ['Weak Squares', 'Backward Pawns', 'Isolated Pawns', 'Color Weaknesses'],
        completed: false,
        progress: 0,
        objectives: ['Identify weaknesses', 'Exploit weak squares', 'Create long-term advantages']
      },
      {
        id: 'practical-endgames',
        title: '30. Practical Endgame Play',
        description: 'Real-world endgame situations and practical tips',
        difficulty: 'Intermediate',
        duration: 50,
        ratingRange: '1100-1400',
        modules: ['Practical Technique', 'Time Management', 'Endgame Psychology', 'Common Mistakes'],
        completed: false,
        progress: 0,
        objectives: ['Play endgames practically', 'Avoid common errors', 'Convert winning positions']
      }
    ]
  },
  {
    id: 'advanced-mastery',
    title: '🚀 Advanced Mastery',
    description: 'Advanced concepts for ambitious players',
    difficulty: 'Advanced',
    ratingRange: '1400-1800',
    totalLessons: 10,
    estimatedHours: 20,
    lessons: [
      {
        id: 'dynamic-play',
        title: '31. Dynamic vs Positional Play',
        description: 'Understanding when to play dynamically vs positionally',
        difficulty: 'Advanced',
        duration: 60,
        ratingRange: '1400-1700',
        modules: ['Dynamic Factors', 'Initiative', 'Compensation', 'Risk Assessment'],
        completed: false,
        progress: 0,
        prerequisites: ['positional-play', 'attack-defense'],
        objectives: ['Balance dynamic/positional play', 'Assess compensation', 'Take calculated risks']
      },
      {
        id: 'strategic-planning',
        title: '32. Advanced Strategic Planning',
        description: 'Long-term planning and strategic thinking',
        difficulty: 'Advanced',
        duration: 70,
        ratingRange: '1500-1800',
        modules: ['Strategic Assessment', 'Long-term Plans', 'Plan Flexibility', 'Strategic Sacrifices'],
        completed: false,
        progress: 0,
        objectives: ['Create strategic plans', 'Adapt plans flexibly', 'Make strategic sacrifices']
      },
      {
        id: 'complex-endgames',
        title: '33. Complex Endgame Studies',
        description: 'Advanced endgame positions and study techniques',
        difficulty: 'Advanced',
        duration: 80,
        ratingRange: '1400-1800',
        modules: ['Rook vs Minor Piece', 'Complex Pawn Endings', 'Queen Endgames', 'Study Positions'],
        completed: false,
        progress: 0,
        objectives: ['Master complex endgames', 'Study endgame positions', 'Apply endgame knowledge']
      },
      {
        id: 'opening-mastery',
        title: '34. Opening Theory and Preparation',
        description: 'Deep opening preparation and theoretical knowledge',
        difficulty: 'Advanced',
        duration: 90,
        ratingRange: '1500-1800',
        modules: ['Opening Repertoires', 'Theoretical Lines', 'Novelties', 'Opening Databases'],
        completed: false,
        progress: 0,
        objectives: ['Build opening repertoire', 'Study theory deeply', 'Prepare opening novelties']
      },
      {
        id: 'calculation-mastery',
        title: '35. Advanced Calculation',
        description: 'Deep calculation techniques and visualization',
        difficulty: 'Advanced',
        duration: 75,
        ratingRange: '1400-1800',
        modules: ['Calculation Methods', 'Visualization', 'Candidate Moves', 'Calculation Accuracy'],
        completed: false,
        progress: 0,
        objectives: ['Calculate deeply and accurately', 'Improve visualization', 'Find all candidate moves']
      },
      {
        id: 'positional-sacrifices',
        title: '36. Positional and Exchange Sacrifices',
        description: 'Strategic sacrifices for long-term compensation',
        difficulty: 'Advanced',
        duration: 65,
        ratingRange: '1500-1800',
        modules: ['Exchange Sacrifices', 'Positional Sacrifices', 'Compensation Assessment', 'Practical Examples'],
        completed: false,
        progress: 0,
        objectives: ['Make strategic sacrifices', 'Assess compensation', 'Play for long-term advantage']
      },
      {
        id: 'psychological-chess',
        title: '37. Chess Psychology and Time Management',
        description: 'Mental aspects of competitive chess',
        difficulty: 'Advanced',
        duration: 50,
        ratingRange: '1400-1700',
        modules: ['Chess Psychology', 'Pressure Handling', 'Opponent Psychology', 'Mental Preparation'],
        completed: false,
        progress: 0,
        objectives: ['Handle psychological pressure', 'Understand opponent psychology', 'Prepare mentally']
      },
      {
        id: 'theoretical-endgames',
        title: '38. Theoretical Endgame Knowledge',
        description: 'Essential theoretical endgame positions',
        difficulty: 'Advanced',
        duration: 85,
        ratingRange: '1500-1800',
        modules: ['Tablebase Positions', 'Theoretical Draws', 'Endgame Theory', 'Computer Analysis'],
        completed: false,
        progress: 0,
        objectives: ['Master theoretical endgames', 'Use endgame databases', 'Understand computer analysis']
      },
      {
        id: 'middlegame-mastery',
        title: '39. Middlegame Mastery',
        description: 'Advanced middlegame concepts and plans',
        difficulty: 'Advanced',
        duration: 70,
        ratingRange: '1500-1800',
        modules: ['Complex Planning', 'Piece Maneuvering', 'Strategic Themes', 'Game Phases'],
        completed: false,
        progress: 0,
        objectives: ['Master middlegame play', 'Create complex plans', 'Execute strategic themes']
      },
      {
        id: 'tournament-preparation',
        title: '40. Tournament Play and Preparation',
        description: 'Preparing for serious competitive chess',
        difficulty: 'Advanced',
        duration: 60,
        ratingRange: '1400-1800',
        modules: ['Tournament Preparation', 'Opening Prep', 'Physical Preparation', 'Game Analysis'],
        completed: false,
        progress: 0,
        objectives: ['Prepare for tournaments', 'Develop pre-game routines', 'Analyze opponents']
      }
    ]
  },
  {
    id: 'expert-mastery',
    title: '👑 Expert Mastery',
    description: 'Master-level concepts for serious tournament players',
    difficulty: 'Expert',
    ratingRange: '1800-2200',
    totalLessons: 8,
    estimatedHours: 25,
    lessons: [
      {
        id: 'grandmaster-games',
        title: '41. Studying Grandmaster Games',
        description: 'Learning from the games of world-class players',
        difficulty: 'Expert',
        duration: 90,
        ratingRange: '1800-2200',
        modules: ['Game Selection', 'Analysis Methods', 'Pattern Recognition', 'Strategic Understanding'],
        completed: false,
        progress: 0,
        prerequisites: ['strategic-planning', 'opening-mastery'],
        objectives: ['Analyze GM games effectively', 'Extract key insights', 'Apply GM techniques']
      },
      {
        id: 'opening-innovation',
        title: '42. Opening Innovation and Preparation',
        description: 'Creating novelties and deep opening preparation',
        difficulty: 'Expert',
        duration: 120,
        ratingRange: '1900-2200',
        modules: ['Novelty Creation', 'Deep Preparation', 'Computer Analysis', 'Opening Trends'],
        completed: false,
        progress: 0,
        objectives: ['Create opening novelties', 'Prepare deeply with computers', 'Understand opening trends']
      },
      {
        id: 'endgame-artistry',
        title: '43. Endgame Artistry and Studies',
        description: 'Beautiful endgame compositions and artistic play',
        difficulty: 'Expert',
        duration: 100,
        ratingRange: '1800-2200',
        modules: ['Endgame Studies', 'Artistic Positions', 'Study Composition', 'Endgame Beauty'],
        completed: false,
        progress: 0,
        objectives: ['Appreciate endgame art', 'Study compositions', 'Create beautiful positions']
      },
      {
        id: 'strategic-mastery',
        title: '44. Strategic Mastery and Evaluation',
        description: 'Deep positional understanding and evaluation skills',
        difficulty: 'Expert',
        duration: 110,
        ratingRange: '1900-2200',
        modules: ['Position Evaluation', 'Strategic Elements', 'Imbalances', 'Strategic Mastery'],
        completed: false,
        progress: 0,
        objectives: ['Evaluate positions accurately', 'Understand strategic imbalances', 'Make strategic decisions']
      },
      {
        id: 'tactical-mastery',
        title: '45. Tactical Vision and Mastery',
        description: 'Extraordinary tactical vision and pattern recognition',
        difficulty: 'Expert',
        duration: 95,
        ratingRange: '1800-2200',
        modules: ['Pattern Mastery', 'Tactical Vision', 'Complex Combinations', 'Tactical Training'],
        completed: false,
        progress: 0,
        objectives: ['Develop tactical mastery', 'See complex patterns', 'Calculate accurately']
      },
      {
        id: 'game-preparation',
        title: '46. Professional Game Preparation',
        description: 'Preparing like a professional chess player',
        difficulty: 'Expert',
        duration: 85,
        ratingRange: '1900-2200',
        modules: ['Opponent Preparation', 'Database Analysis', 'Team Preparation', 'Professional Methods'],
        completed: false,
        progress: 0,
        objectives: ['Prepare professionally', 'Analyze opponents thoroughly', 'Use professional methods']
      },
      {
        id: 'chess-understanding',
        title: '47. Deep Chess Understanding',
        description: 'Profound understanding of chess principles and exceptions',
        difficulty: 'Expert',
        duration: 120,
        ratingRange: '1800-2200',
        modules: ['Chess Principles', 'Exceptions', 'Deep Understanding', 'Chess Philosophy'],
        completed: false,
        progress: 0,
        objectives: ['Understand chess deeply', 'Know when to break rules', 'Develop chess intuition']
      },
      {
        id: 'mastery-synthesis',
        title: '48. Chess Mastery Synthesis',
        description: 'Integrating all aspects of chess knowledge and skill',
        difficulty: 'Expert',
        duration: 100,
        ratingRange: '2000-2200',
        modules: ['Knowledge Integration', 'Skill Synthesis', 'Chess Mastery', 'Continuous Improvement'],
        completed: false,
        progress: 0,
        objectives: ['Integrate all chess knowledge', 'Achieve mastery synthesis', 'Continue improving']
      }
    ]
  }
];

const LessonsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<LessonCategory | null>(null);
  const [userProgress, setUserProgress] = useState<{[key: string]: number}>({});
  const [openLesson, setOpenLesson] = useState<any | null>(null);

  useEffect(() => {
    // Initialize progress for each lesson
    const initialProgress: {[key: string]: number} = {};
    chessCurriculum.forEach(category => {
      category.lessons.forEach(lesson => {
        initialProgress[lesson.id] = lesson.progress;
      });
    });
    setUserProgress(initialProgress);
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    // Using design tokens and avoiding light backgrounds
    switch (difficulty) {
      case 'Basics': return { 
        backgroundColor: 'var(--color-surface)', 
        color: 'var(--color-text-secondary)',
        borderColor: 'var(--color-border-default)'
      };
      case 'Beginner': return { 
        backgroundColor: 'var(--color-success-subtle)', 
        color: 'var(--color-success)',
        borderColor: 'var(--color-success)'
      };
      case 'Intermediate': return { 
        backgroundColor: 'var(--color-warning-subtle)', 
        color: 'var(--color-warning)',
        borderColor: 'var(--color-warning)'
      };
      case 'Advanced': return { 
        backgroundColor: 'var(--color-danger-subtle)', 
        color: 'var(--color-danger)',
        borderColor: 'var(--color-danger)'
      };
      case 'Expert': return { 
        backgroundColor: 'var(--color-accent-primary-subtle)', 
        color: 'var(--color-accent-primary)',
        borderColor: 'var(--color-accent-primary)'
      };
      default: return { 
        backgroundColor: 'var(--color-surface)', 
        color: 'var(--color-text-secondary)',
        borderColor: 'var(--color-border-default)'
      };
    }
  };

  const handleLessonStart = (lessonId: string, lessonTitle: string) => {
    console.log(`Starting lesson: ${lessonTitle} (${lessonId})`);
    
    // Find the lesson details from the curriculum
    const lesson = chessCurriculum.flatMap(cat => cat.lessons).find(l => l.id === lessonId);
    if (!lesson) return;
    
    // Create lesson data with actual modules
    const lessonData = {
      id: lessonId,
      title: lessonTitle,
      description: lesson.description,
      difficulty: lesson.difficulty,
      duration: lesson.duration,
      objectives: lesson.objectives,
      modules: createLessonModules(lessonId, lessonTitle, lesson)
    };
    
    setOpenLesson(lessonData);
    setUserProgress(prev => ({
      ...prev,
      [lessonId]: 25
    }));
  };

  const createLessonModules = (lessonId: string, lessonTitle: string, lesson: any) => {
    // Create dynamic modules based on lesson content
    const modules = [];
    
    // Theory module
    modules.push({
      id: `${lessonId}-theory`,
      title: 'Introduction',
      type: 'theory',
      content: getLessonTheoryContent(lessonId, lessonTitle)
    });
    
    // 🎯 Add Guided Practice for specific lessons
    const guidedLessonsWithData = ['opening-principles', 'basic-tactics', 'king-safety', 'basic-endgames'];
    if (guidedLessonsWithData.includes(lessonId)) {
      const guidedTitles = {
        'opening-principles': 'Guided Opening Practice',
        'basic-tactics': 'Guided Tactical Training',
        'king-safety': 'Guided King Safety Practice', 
        'basic-endgames': 'Guided Endgame Training'
      };
      const guidedDescriptions = {
        'opening-principles': 'Learn opening principles step-by-step with computer guidance.',
        'basic-tactics': 'Master tactical patterns with step-by-step guided practice.',
        'king-safety': 'Practice king safety concepts with interactive guidance.',
        'basic-endgames': 'Learn fundamental endgames with guided instruction.'
      };
      
      modules.push({
        id: `${lessonId}-guided`,
        title: guidedTitles[lessonId] || 'Guided Practice',
        type: 'guided-practice',
        content: guidedDescriptions[lessonId] || 'Interactive guided learning with step-by-step instruction.',
        guidedPractice: getGuidedPracticeData(lessonId)
      });
    }
    
    // Interactive module with chessboard
    modules.push({
      id: `${lessonId}-interactive`,
      title: 'Practice on the Board',
      type: 'interactive',
      content: 'Now let\'s explore this concept on the chessboard. Study the position and key moves.',
      fen: getLessonFEN(lessonId),
      moves: getLessonMoves(lessonId)
    });
    
    // Quiz module
    modules.push({
      id: `${lessonId}-quiz`,
      title: 'Test Your Knowledge',
      type: 'quiz',
      content: '',
      questions: getLessonQuiz(lessonId)
    });
    
    return modules;
  };

  const getGuidedPracticeData = (lessonId: string) => {
    const guidedLessons = {
      'opening-principles': {
        initialFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        botLevel: 3,
        theme: 'Opening Development',
        objectives: [
          'Control the center with pawns',
          'Develop knights before bishops', 
          'Castle early for king safety',
          'Avoid moving the same piece twice'
        ],
        successCriteria: {
          minCorrectMoves: 4,
          maxMistakes: 2,
          timeBonus: false
        },
        steps: [
          {
            id: 'step1',
            stepType: 'explanation',
            title: 'Welcome to Guided Opening',
            description: 'In this lesson, you\'ll learn the fundamental principles of chess openings. I\'ll guide you through each move and explain why it\'s important.',
            timeLimit: 10
          },
          {
            id: 'step2', 
            stepType: 'user-move',
            title: 'Control the Center',
            description: 'First principle: Control the center! Move your king\'s pawn two squares forward.',
            allowedMoves: ['e2e4'],
            moveArrows: [{
              from: 'e2',
              to: 'e4', 
              color: 'green',
              style: 'solid'
            }],
            highlightSquares: [{
              square: 'e2',
              color: 'require',
              animation: 'pulse'
            }],
            tooltip: {
              square: 'e2',
              message: 'Click here to move the pawn!',
              type: 'instruction'
            },
            nextStepConditions: {
              onCorrectMove: 'step3'
            }
          },
          {
            id: 'step3',
            stepType: 'computer-move', 
            title: 'Computer Response',
            description: 'Excellent! The computer responds with e7-e5, also fighting for central control. This is the most popular response.',
            computerMove: 'e7e5',
            timeLimit: 5
          },
          {
            id: 'step4',
            stepType: 'user-move',
            title: 'Develop Your Knight',
            description: 'Now develop a knight toward the center. Knights are most effective when centralized.',
            allowedMoves: ['g1f3', 'b1c3'],
            moveArrows: [
              { from: 'g1', to: 'f3', color: 'blue', style: 'solid' },
              { from: 'b1', to: 'c3', color: 'blue', style: 'dashed' }
            ],
            highlightSquares: [
              { square: 'g1', color: 'suggest', animation: 'glow' },
              { square: 'b1', color: 'suggest', animation: 'glow' }
            ],
            tooltip: {
              square: 'g1',
              message: 'Knights to f3 is most common!',
              type: 'hint'
            }
          },
          {
            id: 'step5',
            stepType: 'computer-move',
            title: 'Computer Develops',
            description: 'The computer develops its knight as well. Notice how both sides prioritize piece development.',
            computerMove: 'b8c6',
            timeLimit: 5
          },
          {
            id: 'step6',
            stepType: 'choice',
            title: 'What\'s Next?',
            description: 'You\'ve learned the basic opening principles. What would you like to focus on next?',
            choices: [
              {
                text: 'Learn about castling',
                nextStep: 'step7-castle',
                explanation: 'King safety is crucial in chess'
              },
              {
                text: 'Develop more pieces',  
                nextStep: 'step7-develop',
                explanation: 'Piece development continues'
              }
            ]
          },
          {
            id: 'step7-castle',
            stepType: 'explanation',
            title: 'Lesson Complete!',
            description: '🎉 Great job! You\'ve learned the fundamental opening principles: central control and piece development. In future lessons, we\'ll explore castling and more advanced concepts.',
            timeLimit: 10
          }
        ]
      },
      
      // 🎯 Tactical Patterns Lesson
      'basic-tactics': {
        initialFen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 6',
        botLevel: 4,
        theme: 'Tactical Awareness',
        objectives: [
          'Recognize tactical patterns',
          'Execute tactical combinations', 
          'Defend against tactics',
          'Calculate tactical sequences'
        ],
        successCriteria: {
          minCorrectMoves: 3,
          maxMistakes: 1,
          timeBonus: true
        },
        steps: [
          {
            id: 'tact1',
            stepType: 'explanation',
            title: 'Tactical Pattern Recognition',
            description: 'In this position, there are several tactical opportunities. Look for patterns like forks, pins, and skewers. The key is to spot the weakness in your opponent\'s position.',
            timeLimit: 15
          },
          {
            id: 'tact2', 
            stepType: 'user-move',
            title: 'Find the Fork!',
            description: 'Your knight can create a powerful fork. Find the move that attacks both the king and another piece!',
            allowedMoves: ['f3d4'],
            suggestedMove: 'f3d4',
            moveArrows: [{ from: 'f3', to: 'd4', color: 'green', style: 'solid' }],
            highlightSquares: [
              { square: 'f3', color: 'require', animation: 'bounce' },
              { square: 'd4', color: 'good', animation: 'glow' },
              { square: 'e8', color: 'avoid', animation: 'pulse' }
            ],
            tooltip: {
              square: 'd4',
              message: 'From here, the knight creates a powerful fork!',
              type: 'hint'
            }
          },
          {
            id: 'tact3',
            stepType: 'computer-move',
            title: 'Computer Response',
            description: 'The computer must respond to your tactical threat.',
            computerMove: 'c5d4',
            botLevel: 4,
            timeLimit: 5
          },
          {
            id: 'tact4',
            stepType: 'explanation',
            title: 'Tactical Complete!',
            description: 'Excellent! You\'ve learned to recognize and execute basic tactical patterns. Tactics are the foundation of chess improvement!',
            timeLimit: 8
          }
        ]
      },
      
      // 🏰 King Safety Lesson
      'king-safety': {
        initialFen: 'r3k2r/ppp2ppp/2n1bn2/3p4/3P4/2N2N2/PPP2PPP/R1BQKB1R w KQkq - 0 8',
        botLevel: 3,
        theme: 'King Safety',
        objectives: [
          'Recognize king safety importance',
          'Execute castling at the right time',
          'Understand when NOT to castle',
          'Create safe king positions'
        ],
        successCriteria: {
          minCorrectMoves: 2,
          maxMistakes: 1,
          timeBonus: false
        },
        steps: [
          {
            id: 'safe1',
            stepType: 'explanation',
            title: 'King Safety Priority',
            description: 'Your king is still in the center while development is nearly complete. This is dangerous! Castling should be a high priority to move your king to safety.',
            timeLimit: 12
          },
          {
            id: 'safe2',
            stepType: 'choice',
            title: 'Castle Direction Choice',
            description: 'You can castle on either side. Which side looks safer?',
            choices: [
              {
                text: 'Kingside Castle (O-O)',
                nextStep: 'safe3a',
                explanation: 'Short castle - faster and usually safer'
              },
              {
                text: 'Queenside Castle (O-O-O)',
                nextStep: 'safe3b',
                explanation: 'Long castle - more space but takes longer'
              }
            ]
          },
          {
            id: 'safe3a',
            stepType: 'user-move',
            title: 'Kingside Castling',
            description: 'Castle kingside to bring your king to safety quickly!',
            allowedMoves: ['e1g1'],
            moveArrows: [
              { from: 'e1', to: 'g1', color: 'green', style: 'solid' },
              { from: 'h1', to: 'f1', color: 'green', style: 'dashed' }
            ],
            highlightSquares: [
              { square: 'e1', color: 'require', animation: 'pulse' },
              { square: 'g1', color: 'good', animation: 'glow' },
              { square: 'f1', color: 'good', animation: 'glow' },
              { square: 'h1', color: 'suggest', animation: 'glow' }
            ],
            tooltip: {
              square: 'g1',
              message: 'Safe haven for your king!',
              type: 'success'
            }
          },
          {
            id: 'safe4',
            stepType: 'computer-move',
            title: 'Computer Castles Too',
            description: 'The computer also recognizes the importance of king safety and castles kingside.',
            computerMove: 'e8g8',
            botLevel: 3
          },
          {
            id: 'safe5',
            stepType: 'explanation',
            title: 'King Safety Complete!',
            description: 'Perfect! Both kings are now safe. Remember: get your king to safety early in the game!',
            timeLimit: 8
          }
        ]
      },
      
      // ♛ Endgame Fundamentals
      'basic-endgames': {
        initialFen: '4k3/8/4K3/8/8/8/8/4R3 w - - 0 1',
        botLevel: 2,
        theme: 'Basic Endgames',
        objectives: [
          'Learn rook endgame technique',
          'Understand king activity',
          'Master checkmate patterns',
          'Practice endgame principles'
        ],
        successCriteria: {
          minCorrectMoves: 4,
          maxMistakes: 2,
          timeBonus: false
        },
        steps: [
          {
            id: 'end1',
            stepType: 'explanation',
            title: 'Rook Endgame Basics',
            description: 'This is a fundamental rook endgame. Your goal is to checkmate the opponent king using your rook and king together. The key principle: use your king actively!',
            timeLimit: 15
          },
          {
            id: 'end2',
            stepType: 'user-move',
            title: 'Cut Off the King',
            description: 'Move your rook to cut off the enemy king. Re1-e8+ gives check and limits the king\'s escape squares.',
            allowedMoves: ['e1e8'],
            moveArrows: [{ from: 'e1', to: 'e8', color: 'green', style: 'solid' }],
            highlightSquares: [
              { square: 'e1', color: 'require', animation: 'pulse' },
              { square: 'e8', color: 'good', animation: 'glow' },
              { square: 'e8', color: 'avoid', animation: 'bounce' }
            ],
            tooltip: {
              square: 'e8',
              message: 'Check! And cuts off the 8th rank',
              type: 'instruction'
            }
          },
          {
            id: 'end3',
            stepType: 'computer-move',
            title: 'King Moves',
            description: 'The computer king is forced to move. It goes to d7, trying to stay centralized.',
            computerMove: 'e8d7',
            botLevel: 2
          },
          {
            id: 'end4',
            stepType: 'user-move',
            title: 'Activate Your King',
            description: 'Now bring your king closer! King activity is crucial in endgames.',
            allowedMoves: ['e6d6', 'e6f7', 'e6d5'],
            suggestedMove: 'e6d6',
            moveArrows: [{ from: 'e6', to: 'd6', color: 'green', style: 'solid' }],
            highlightSquares: [
              { square: 'e6', color: 'require', animation: 'pulse' },
              { square: 'd6', color: 'good', animation: 'glow' }
            ],
            tooltip: {
              square: 'd6',
              message: 'Support your rook with your king!',
              type: 'hint'
            }
          },
          {
            id: 'end5',
            stepType: 'explanation',
            title: 'Endgame Complete!',
            description: 'Excellent! You\'ve learned the basic principles of rook endgames: cut off the king and use your own king actively!',
            timeLimit: 10
          }
        ]
      }
    };
    
    return guidedLessons[lessonId] || null;
  };

  const getLessonTheoryContent = (lessonId: string, lessonTitle: string) => {
    const content = {
      'chess-101': `Welcome to the wonderful world of chess! Chess is one of the world's oldest and most beloved strategy games.

In this lesson, you'll learn:
• The history and origins of chess
• How to set up the chessboard correctly
• The names and basic movements of all chess pieces
• Chess notation and how to record moves

Chess is a game of infinite complexity and beauty. Every game tells a story, and every move matters. Let's begin your journey to chess mastery!

The chessboard consists of 64 squares arranged in an 8x8 grid. The board is positioned so that each player has a light-colored square in the bottom-right corner.

Key Facts:
• Chess originated in India around the 6th century
• The modern rules were established in the 15th century
• There are over 600 million chess players worldwide
• Chess develops critical thinking and pattern recognition skills`,

      'pawn-movement': `Pawns are the foot soldiers of chess. Though they may seem simple, pawns are crucial to your chess success.

Basic Pawn Rules:
• Pawns move forward one square at a time
• On their first move, pawns can advance two squares
• Pawns capture diagonally forward, not straight ahead
• Pawns cannot move backward

Special Pawn Rules:
• En passant capture (capturing a pawn that just moved two squares)
• Pawn promotion (when a pawn reaches the opposite end)

Strategy Tips:
• Pawn structure forms the skeleton of your position
• Advanced pawns can become powerful
• Doubled pawns are generally weak
• Isolated pawns need protection`,

      'rook-movement': `The rook is one of the most powerful pieces on the chessboard. Often called a "castle," rooks dominate open files and ranks.

Rook Movement:
• Moves horizontally and vertically any number of squares
• Cannot jump over other pieces
• Excellent for controlling open files and ranks

Rook Strategy:
• Place rooks on open files (files with no pawns)
• Double rooks on the same file for maximum power
• Rooks work well together and support each other
• The 7th rank is often a strong position for rooks

Fun Fact: In the endgame, rooks become increasingly powerful as the board opens up!`
    };
    
    return content[lessonId] || `Learn about ${lessonTitle}. This lesson will teach you the fundamental concepts and strategies.`;
  };

  const getLessonFEN = (lessonId: string) => {
    const positions = {
      'chess-101': 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      'pawn-moves': 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
      'rook-moves': 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1',
      'bishop-moves': 'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 1',
      'knight-moves': 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
      'queen-moves': 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 1',
      'king-moves': 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 1',
    };
    
    return positions[lessonId] || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  };

  const getLessonMoves = (lessonId: string) => {
    const moves = {
      'chess-101': ['e2e4', 'd2d4', 'g1f3', 'b1c3'],
      'pawn-moves': ['e2e4', 'e4e5', 'd2d4', 'f2f4'],
      'rook-moves': ['a1d1', 'h1f1', 'a1a8', 'h1h8'],
      'bishop-moves': ['c4d5', 'c5d4', 'c4b5', 'c5b4'],
      'knight-moves': ['g1f3', 'b1c3', 'f3d4', 'c3d5'],
      'queen-moves': ['d1h5', 'd1d8', 'd1a4', 'd1f3'],
      'king-moves': ['e1f1', 'e1d1', 'e1e2', 'e1f2'],
    };
    
    return moves[lessonId] || [];
  };

  const getLessonQuiz = (lessonId: string) => {
    const quizzes = {
      'chess-101': [
        {
          question: 'How many squares are on a chessboard?',
          options: ['36 squares', '49 squares', '64 squares', '81 squares'],
          correct: 2,
          explanation: 'A chessboard has 64 squares arranged in an 8×8 grid.'
        },
        {
          question: 'What color square should be in the bottom-right corner?',
          options: ['Dark square', 'Light square', 'Either color', 'No specific requirement'],
          correct: 1,
          explanation: 'The board should be oriented with a light-colored square in each player\'s bottom-right corner.'
        }
      ],
      'pawn-movement': [
        {
          question: 'How can a pawn move on its first move?',
          options: ['Only one square forward', 'One or two squares forward', 'Any direction', 'Only diagonally'],
          correct: 1,
          explanation: 'Pawns can move either one or two squares forward on their first move.'
        },
        {
          question: 'How do pawns capture?',
          options: ['Straight forward', 'Diagonally forward', 'In any direction', 'They cannot capture'],
          correct: 1,
          explanation: 'Pawns capture diagonally forward, one square at a time.'
        }
      ]
    };
    
    return quizzes[lessonId] || [
      {
        question: 'What did you learn in this lesson?',
        options: ['Important concepts', 'Basic strategies', 'Practical techniques', 'All of the above'],
        correct: 3,
        explanation: 'This lesson covered multiple important aspects of chess.'
      }
    ];
  };

  const handleCategoryStart = (categoryTitle: string) => {
    console.log(`Starting category: ${categoryTitle}`);
    alert(`Starting category: "${categoryTitle}"\n\nThis will begin with the first lesson in this category and track your progress through all lessons.`);
    // TODO: Navigate to first lesson in category
  };

  const getTotalLessons = () => {
    return chessCurriculum.reduce((total, category) => total + category.totalLessons, 0);
  };

  const getTotalHours = () => {
    return chessCurriculum.reduce((total, category) => total + category.estimatedHours, 0);
  };

  const getCompletedLessons = () => {
    return Object.values(userProgress).filter(progress => progress === 100).length;
  };

  if (selectedCategory) {
    const categoryProgress = selectedCategory.lessons.map(lesson => userProgress[lesson.id] || 0);
    const avgProgress = Math.round(categoryProgress.reduce((a, b) => a + b, 0) / categoryProgress.length);

    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-base)' }}>
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Header with back button */}
          <div className="flex items-center mb-8">
            <Button 
              variant="outline" 
              onClick={() => setSelectedCategory(null)}
              className="mr-4"
            >
              ← Back to Curriculum
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{selectedCategory.title}</h1>
              <p className="text-muted-foreground">{selectedCategory.description}</p>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 text-center" style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border-default)' }}>
              <div className="text-2xl font-bold mb-1" style={{ color: 'var(--color-accent-primary)' }}>
                {selectedCategory.totalLessons}
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Total Lessons</div>
            </Card>
            
            <Card className="p-4 text-center" style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border-default)' }}>
              <div className="text-2xl font-bold mb-1" style={{ color: 'var(--color-success)' }}>
                {selectedCategory.lessons.filter(l => userProgress[l.id] === 100).length}
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Completed</div>
            </Card>
            
            <Card className="p-4 text-center" style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border-default)' }}>
              <div className="text-2xl font-bold mb-1" style={{ color: 'var(--color-warning)' }}>
                {selectedCategory.estimatedHours}h
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Est. Duration</div>
            </Card>

            <Card className="p-4 text-center" style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border-default)' }}>
              <div className="text-2xl font-bold mb-1" style={{ color: 'var(--color-accent-primary)' }}>
                {avgProgress}%
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Progress</div>
            </Card>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span>Category Progress</span>
              <span>{selectedCategory.lessons.filter(l => userProgress[l.id] === 100).length} / {selectedCategory.totalLessons}</span>
            </div>
            <Progress value={avgProgress} className="h-3" />
          </div>

          {/* Lessons List */}
          <div className="space-y-4">
            {selectedCategory.lessons.map((lesson, index) => {
              const progress = userProgress[lesson.id] || 0;
              const isCompleted = progress === 100;
              const isInProgress = progress > 0 && progress < 100;
              
              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
                    style={{
                      backgroundColor: 'var(--color-surface-elevated)',
                      borderColor: isCompleted ? 'var(--color-success)' : 
                                   isInProgress ? 'var(--color-warning)' : 
                                   'var(--color-border-default)',
                      borderWidth: '2px'
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div 
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              isCompleted ? 'bg-green-500 text-white' :
                              isInProgress ? 'bg-yellow-500 text-white' :
                              'bg-gray-200'
                            }`}
                            style={
                              !isCompleted && !isInProgress 
                                ? { color: 'var(--color-text-secondary)' } 
                                : {}
                            }
                          >
                            {isCompleted ? '✓' : index + 1}
                          </div>
                          <h3 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{lesson.title}</h3>
                          <Badge style={getDifficultyColor(lesson.difficulty)}>
                            {lesson.difficulty}
                          </Badge>
                        </div>

                        <p className="mb-3" style={{ color: 'var(--color-text-secondary)' }}>{lesson.description}</p>

                        <div className="flex items-center gap-6 text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                          <span>⏱️ {lesson.duration} min</span>
                          <span>📊 {lesson.ratingRange} ELO</span>
                          <span>📚 {lesson.modules.length} modules</span>
                        </div>

                        {/* Learning Objectives */}
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>Learning Objectives:</h4>
                          <ul className="list-disc list-inside text-sm space-y-1" style={{ color: 'var(--color-text-secondary)' }}>
                            {lesson.objectives.map((objective, i) => (
                              <li key={i}>{objective}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Modules Preview */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {lesson.modules.slice(0, 4).map((module, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {module}
                            </Badge>
                          ))}
                          {lesson.modules.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{lesson.modules.length - 4} more
                            </Badge>
                          )}
                        </div>

                        {/* Prerequisites */}
                        {lesson.prerequisites && lesson.prerequisites.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>Prerequisites:</h4>
                            <div className="flex flex-wrap gap-2">
                              {lesson.prerequisites.map((prereq, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {prereq}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Progress Bar */}
                        {progress > 0 && (
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        )}
                      </div>

                      <div className="ml-4 flex flex-col gap-2">
                        <Button 
                          size="lg"
                          onClick={() => handleLessonStart(lesson.id, lesson.title)}
                          className={
                            isCompleted ? 'bg-green-600 hover:bg-green-700' :
                            isInProgress ? 'bg-yellow-600 hover:bg-yellow-700' :
                            'bg-blue-600 hover:bg-blue-700'
                          }
                        >
                          {isCompleted ? '✓ Review' : isInProgress ? '📖 Continue' : '🚀 Start'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
        
        {/* Lesson Player Modal for selectedCategory view */}
        {openLesson && (
          <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: 'var(--color-bg-base)' }}>
            <LessonPlayer
              lesson={openLesson}
              onComplete={() => {
                // Mark lesson as completed
                setUserProgress(prev => ({
                  ...prev,
                  [openLesson.id]: 100
                }));
                setOpenLesson(null);
                alert(`🎉 Congratulations! You've completed "${openLesson.title}"!`);
              }}
              onClose={() => setOpenLesson(null)}
              onProgress={(progress) => {
                setUserProgress(prev => ({
                  ...prev,
                  [openLesson.id]: progress
                }));
              }}
            />
          </div>
        )}
      </div>
    );
  }

  // Main curriculum overview
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3" style={{ color: 'var(--color-accent-primary)' }}>
              <BookOpen className="h-10 w-10" aria-label="Chess curriculum" />
              Chess Lessons Curriculum
            </h1>
            <p className="text-lg mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              Master chess systematically with our comprehensive A→Z curriculum from basics to expert level
            </p>
            
            {/* Overall Progress Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <Card className="p-6 text-center" style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-accent-primary)', borderWidth: '2px' }}>
                <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-accent-primary)' }}>
                  {getTotalLessons()}
                </div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Total Lessons</div>
              </Card>
              
              <Card className="p-6 text-center" style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-success)', borderWidth: '2px' }}>
                <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-success)' }}>
                  {getCompletedLessons()}
                </div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Completed</div>
              </Card>
              
              <Card className="p-6 text-center" style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-accent-primary)', borderWidth: '2px' }}>
                <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-accent-primary)' }}>
                  {getTotalHours()}h
                </div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Total Content</div>
              </Card>

              <Card className="p-6 text-center" style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-warning)', borderWidth: '2px' }}>
                <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-warning)' }}>
                  {chessCurriculum.length}
                </div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Categories</div>
              </Card>
            </div>
          </motion.div>
        </div>

        {/* Curriculum Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {chessCurriculum.map((category, index) => {
            const categoryLessons = category.lessons.map(lesson => userProgress[lesson.id] || 0);
            const avgProgress = Math.round(categoryLessons.reduce((a, b) => a + b, 0) / categoryLessons.length);
            const completedLessons = categoryLessons.filter(p => p === 100).length;
            
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card 
                  className="h-full hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                  style={{
                    backgroundColor: 'var(--color-surface-elevated)',
                    borderColor: 'var(--color-border-default)',
                    borderWidth: '2px'
                  }}
                  onClick={() => setSelectedCategory(category)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-3">
                      <Badge style={getDifficultyColor(category.difficulty)}>
                        {category.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {category.ratingRange} ELO
                      </Badge>
                    </div>
                    
                    <CardTitle className="text-xl font-bold leading-tight">
                      {category.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {category.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {/* Progress */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium">Progress</span>
                          <span style={{ color: 'var(--color-text-secondary)' }}>
                            {completedLessons} / {category.totalLessons} lessons
                          </span>
                        </div>
                        <Progress value={avgProgress} className="h-2" />
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--color-surface)' }}>
                          <div className="text-lg font-bold" style={{ color: 'var(--color-accent-primary)' }}>
                            {category.totalLessons}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Lessons</div>
                        </div>
                        <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--color-surface)' }}>
                          <div className="text-lg font-bold" style={{ color: 'var(--color-warning)' }}>
                            {category.estimatedHours}h
                          </div>
                          <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Duration</div>
                        </div>
                        <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--color-surface)' }}>
                          <div className="text-lg font-bold" style={{ color: 'var(--color-success)' }}>
                            {avgProgress}%
                          </div>
                          <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Complete</div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button 
                        className="w-full" 
                        variant={completedLessons > 0 ? "primary" : "outline"}
                        onClick={() => handleCategoryStart(category.title)}
                      >
                        {completedLessons > 0 ? '📚 Continue Learning' : '🚀 Start Category'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Learning Path Guide */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-12 text-center"
        >
          <Card className="max-w-6xl mx-auto p-8" style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-warning)', borderWidth: '2px' }}>
            <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
              🎯 Complete A→Z Chess Learning Path
            </h3>
            <div className="grid md:grid-cols-5 gap-4 text-left">
              <div>
                <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>📚 Basics (0-400)</h4>
                <ul className="text-sm space-y-1" style={{ color: 'var(--color-text-secondary)' }}>
                  <li>• Board setup & piece movements</li>
                  <li>• Check, checkmate, stalemate</li>
                  <li>• Basic chess rules</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-green-700 mb-2">🎯 Beginner (400-800)</h4>
                <ul className="text-sm text-green-600 space-y-1">
                  <li>• Opening principles</li>
                  <li>• Basic tactics (fork, pin, skewer)</li>
                  <li>• Simple endgames</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-yellow-700 mb-2">🔥 Intermediate (800-1400)</h4>
                <ul className="text-sm text-yellow-600 space-y-1">
                  <li>• Advanced tactics & combinations</li>
                  <li>• Strategic planning</li>
                  <li>• Complex endgames</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-orange-700 mb-2">🚀 Advanced (1400-1800)</h4>
                <ul className="text-sm text-orange-600 space-y-1">
                  <li>• Deep strategic concepts</li>
                  <li>• Opening theory</li>
                  <li>• Positional sacrifices</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-red-700 mb-2">👑 Expert (1800-2200)</h4>
                <ul className="text-sm text-red-600 space-y-1">
                  <li>• Grandmaster games</li>
                  <li>• Professional preparation</li>
                  <li>• Chess mastery synthesis</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
      
      {/* Lesson Player Modal */}
      {openLesson && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: 'var(--color-bg-base)' }}>
          <LessonPlayer
            lesson={openLesson}
            onComplete={() => {
              // Mark lesson as completed
              setUserProgress(prev => ({
                ...prev,
                [openLesson.id]: 100
              }));
              setOpenLesson(null);
              alert(`🎉 Congratulations! You've completed "${openLesson.title}"!`);
            }}
            onClose={() => setOpenLesson(null)}
            onProgress={(progress) => {
              setUserProgress(prev => ({
                ...prev,
                [openLesson.id]: progress
              }));
            }}
          />
        </div>
      )}
    </div>
  );
};

export default LessonsPage;