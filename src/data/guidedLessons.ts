/**
 * Comprehensive Guided Practice Lessons Library
 * Contains all structured guided practice lessons with step-by-step content,
 * animations, visual guidance, and educational explanations
 */

export interface GuidedLessonLibrary {
  [key: string]: {
    initialFen: string;
    botLevel: number;
    theme: string;
    objectives: string[];
    successCriteria: {
      minCorrectMoves: number;
      maxMistakes: number;
      timeBonus?: boolean;
    };
    steps: Array<{
      id: string;
      stepType: 'user-move' | 'computer-move' | 'explanation' | 'choice';
      title: string;
      description: string;
      timeLimit?: number;
      allowedMoves?: string[];
      suggestedMove?: string;
      computerMove?: string;
      botLevel?: number;
      moveArrows?: Array<{
        from: string;
        to: string;
        color: string;
        style?: 'solid' | 'dashed' | 'dotted';
      }>;
      highlightSquares?: Array<{
        square: string;
        color: 'suggest' | 'require' | 'avoid' | 'good' | 'bad';
        animation?: 'pulse' | 'glow' | 'bounce' | 'none';
      }>;
      tooltip?: {
        square: string;
        message: string;
        type: 'hint' | 'instruction' | 'warning' | 'success';
      };
      choices?: Array<{
        text: string;
        nextStep: string;
        explanation: string;
      }>;
      nextStepConditions?: {
        onCorrectMove?: string;
        onIncorrectMove?: string;
        onTimeout?: string;
      };
    }>;
  };
}

export const guidedLessonsLibrary: GuidedLessonLibrary = {
  // 🌟 Complete Opening Mastery
  'complete-opening-mastery': {
    initialFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    botLevel: 4,
    theme: 'Complete Opening Mastery',
    objectives: [
      'Master all opening principles',
      'Understand opening theory deeply',
      'Make strategic opening choices',
      'Transition to strong middlegames'
    ],
    successCriteria: {
      minCorrectMoves: 8,
      maxMistakes: 2,
      timeBonus: true
    },
    steps: [
      {
        id: 'master1',
        stepType: 'explanation',
        title: 'Opening Mastery Journey',
        description: 'Welcome to advanced opening mastery! This comprehensive lesson will take you through multiple opening systems, strategic concepts, and transition techniques. You will learn to make informed opening choices based on your playing style.',
        timeLimit: 20
      },
      {
        id: 'master2',
        stepType: 'choice',
        title: 'Choose Your Opening Style',
        description: 'What type of opening suits your playing style? Each choice leads to different strategic themes.',
        choices: [
          {
            text: 'Aggressive Attacking Play',
            nextStep: 'master3a',
            explanation: 'Learn openings like Italian Game, King\'s Gambit for direct attacks'
          },
          {
            text: 'Solid Positional Play',
            nextStep: 'master3b',
            explanation: 'Master systems like Ruy Lopez, French Defense for strategic depth'
          },
          {
            text: 'Flexible Universal System',
            nextStep: 'master3c',
            explanation: 'Study openings like English Opening, Caro-Kann for adaptability'
          }
        ]
      },
      {
        id: 'master3a',
        stepType: 'user-move',
        title: 'Aggressive Opening - Center Control',
        description: 'Start with aggressive central control. Move e2-e4 to stake your claim in the center immediately!',
        allowedMoves: ['e2e4'],
        moveArrows: [{ from: 'e2', to: 'e4', color: 'red', style: 'solid' }],
        highlightSquares: [
          { square: 'e2', color: 'require', animation: 'bounce' },
          { square: 'e4', color: 'good', animation: 'glow' }
        ],
        tooltip: {
          square: 'e4',
          message: 'Most forcing and aggressive first move!',
          type: 'instruction'
        }
      }
    ]
  },

  // ⚔️ Advanced Tactical Mastery
  'advanced-tactical-mastery': {
    initialFen: 'r2qkb1r/ppp2ppp/2n2n2/3pp1B1/2PP4/2N2N2/PP2PPPP/R2QKB1R w KQkq - 0 8',
    botLevel: 6,
    theme: 'Advanced Tactical Mastery',
    objectives: [
      'Recognize complex tactical patterns',
      'Execute multi-move combinations',
      'Defend against tactical threats',
      'Calculate deep tactical sequences'
    ],
    successCriteria: {
      minCorrectMoves: 5,
      maxMistakes: 1,
      timeBonus: true
    },
    steps: [
      {
        id: 'tact_adv1',
        stepType: 'explanation',
        title: 'Advanced Tactical Patterns',
        description: 'This position contains multiple tactical themes: pins, forks, discoveries, and sacrifices. Your task is to find the strongest continuation. Look for forcing moves - checks, captures, and threats!',
        timeLimit: 30
      },
      {
        id: 'tact_adv2',
        stepType: 'user-move',
        title: 'Find the Tactical Shot!',
        description: 'There is a powerful tactical blow here. Look for a move that creates multiple threats simultaneously!',
        allowedMoves: ['d4xe5', 'g5xh6'],
        suggestedMove: 'd4xe5',
        moveArrows: [
          { from: 'd4', to: 'e5', color: 'red', style: 'solid' },
          { from: 'g5', to: 'h6', color: 'orange', style: 'dashed' }
        ],
        highlightSquares: [
          { square: 'd4', color: 'suggest', animation: 'pulse' },
          { square: 'e5', color: 'bad', animation: 'glow' },
          { square: 'f6', color: 'avoid', animation: 'bounce' }
        ],
        tooltip: {
          square: 'e5',
          message: 'This opens up tactical possibilities!',
          type: 'hint'
        }
      }
    ]
  },

  // 🏰 Strategic Planning Mastery
  'strategic-planning-mastery': {
    initialFen: 'r1bqr1k1/pp3ppp/2n2n2/3p4/3P4/2N1PN2/PP3PPP/R1BQKB1R w KQ - 0 9',
    botLevel: 5,
    theme: 'Strategic Planning Mastery',
    objectives: [
      'Create long-term strategic plans',
      'Identify pawn structure themes',
      'Coordinate pieces effectively',
      'Execute strategic breakthroughs'
    ],
    successCriteria: {
      minCorrectMoves: 6,
      maxMistakes: 2,
      timeBonus: false
    },
    steps: [
      {
        id: 'strat1',
        stepType: 'explanation',
        title: 'Strategic Assessment',
        description: 'This middlegame position requires strategic thinking. Analyze the pawn structure, piece activity, and potential plans for both sides. White has space advantage, Black has solid development.',
        timeLimit: 25
      },
      {
        id: 'strat2',
        stepType: 'choice',
        title: 'Choose Your Strategic Plan',
        description: 'What strategic approach do you prefer in this position?',
        choices: [
          {
            text: 'Kingside Attack',
            nextStep: 'strat3a',
            explanation: 'Build pressure against Black\'s castled king'
          },
          {
            text: 'Central Expansion',
            nextStep: 'strat3b',
            explanation: 'Advance in the center to gain space'
          },
          {
            text: 'Queenside Initiative',
            nextStep: 'strat3c',
            explanation: 'Create play on the queenside with pawn advances'
          }
        ]
      }
    ]
  },

  // 👑 Endgame Mastery Course
  'endgame-mastery-course': {
    initialFen: '8/5k2/4p3/4K3/5P2/8/8/8 w - - 0 1',
    botLevel: 3,
    theme: 'Endgame Mastery Course',
    objectives: [
      'Master fundamental endgame techniques',
      'Understand king and pawn endgames',
      'Learn opposition and triangulation',
      'Execute winning endgame plans'
    ],
    successCriteria: {
      minCorrectMoves: 10,
      maxMistakes: 3,
      timeBonus: false
    },
    steps: [
      {
        id: 'end_master1',
        stepType: 'explanation',
        title: 'King and Pawn Endgame Mastery',
        description: 'This is a fundamental king and pawn endgame. The key concepts are opposition, triangulation, and breakthrough. Your f-pawn gives you winning chances, but technique is critical!',
        timeLimit: 20
      },
      {
        id: 'end_master2',
        stepType: 'user-move',
        title: 'Seize the Opposition',
        description: 'Take the direct opposition with your king! This constrains Black\'s king and gives you the advantage.',
        allowedMoves: ['e5f6', 'e5d6', 'e5e6'],
        suggestedMove: 'e5f6',
        moveArrows: [{ from: 'e5', to: 'f6', color: 'green', style: 'solid' }],
        highlightSquares: [
          { square: 'e5', color: 'require', animation: 'pulse' },
          { square: 'f6', color: 'good', animation: 'glow' },
          { square: 'f7', color: 'avoid', animation: 'bounce' }
        ],
        tooltip: {
          square: 'f6',
          message: 'Direct opposition - the key to winning!',
          type: 'instruction'
        }
      }
    ]
  },

  // 🎭 Pattern Recognition Training
  'pattern-recognition-training': {
    initialFen: 'r2q1rk1/ppp2ppp/2n1bn2/3p4/3P4/2N1PN2/PPP1BPPP/R1BQK2R w KQ - 0 8',
    botLevel: 4,
    theme: 'Pattern Recognition Training',
    objectives: [
      'Recognize common chess patterns',
      'Identify tactical motifs quickly',
      'Understand positional patterns',
      'Apply pattern knowledge in games'
    ],
    successCriteria: {
      minCorrectMoves: 4,
      maxMistakes: 1,
      timeBonus: true
    },
    steps: [
      {
        id: 'pattern1',
        stepType: 'explanation',
        title: 'Pattern Recognition Skills',
        description: 'Pattern recognition is crucial for chess improvement. This position contains several common patterns - can you spot them? Look for piece arrangements that create tactical or strategic opportunities.',
        timeLimit: 18
      },
      {
        id: 'pattern2',
        stepType: 'user-move',
        title: 'Spot the Pattern!',
        description: 'There is a classic tactical pattern here. Find the move that exploits Black\'s piece coordination!',
        allowedMoves: ['e3e4', 'c3d5'],
        suggestedMove: 'c3d5',
        moveArrows: [{ from: 'c3', to: 'd5', color: 'blue', style: 'solid' }],
        highlightSquares: [
          { square: 'c3', color: 'suggest', animation: 'glow' },
          { square: 'd5', color: 'good', animation: 'pulse' },
          { square: 'e6', color: 'avoid', animation: 'bounce' }
        ],
        tooltip: {
          square: 'd5',
          message: 'Classic central breakthrough pattern!',
          type: 'hint'
        }
      }
    ]
  }
};

export const getLessonsByDifficulty = (difficulty: 'beginner' | 'intermediate' | 'advanced') => {
  const difficultyMap = {
    beginner: ['opening-principles', 'king-safety', 'basic-endgames'],
    intermediate: ['basic-tactics', 'pattern-recognition-training'],
    advanced: ['complete-opening-mastery', 'advanced-tactical-mastery', 'strategic-planning-mastery', 'endgame-mastery-course']
  };
  
  return difficultyMap[difficulty] || [];
};

export const getLessonsByTheme = (theme: string) => {
  return Object.entries(guidedLessonsLibrary)
    .filter(([_, lesson]) => lesson.theme.toLowerCase().includes(theme.toLowerCase()))
    .map(([id, _]) => id);
};

export const getLessonProgress = (lessonId: string) => {
  // This would integrate with user progress tracking
  // For now, return mock progress data
  return {
    completed: false,
    currentStep: 0,
    totalSteps: guidedLessonsLibrary[lessonId]?.steps.length || 0,
    correctMoves: 0,
    mistakes: 0,
    bestTime: null,
    lastAttempt: null
  };
};

export default guidedLessonsLibrary;