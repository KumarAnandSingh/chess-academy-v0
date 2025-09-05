interface CoachingContext {
  position: string; // FEN string
  moveHistory: string[];
  playerLevel: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  lastMove?: string;
  isCorrectMove?: boolean;
  puzzleType?: string;
  lessonTopic?: string;
}

interface CoachResponse {
  message: string;
  type: 'hint' | 'encouragement' | 'correction' | 'analysis' | 'celebration';
  suggestedMove?: string;
  explanation?: string;
  confidence: number;
}

interface PuzzleHint {
  hint: string;
  level: 'gentle' | 'specific' | 'direct';
  suggestedSquares?: string[];
}

interface GameAnalysis {
  evaluation: string;
  bestMove?: string;
  reasoning: string;
  playerStrengths: string[];
  areasForImprovement: string[];
}

class AIChessCoach {
  private apiKey: string | null = null;
  private baseUrl = 'https://api.anthropic.com/v1';
  
  constructor() {
    // In a real app, this would come from environment variables or user settings
    // For now, we'll use a mock/demo mode
    this.apiKey = null; // Set to null to use mock mode for development
  }

  setApiKey(key: string) {
    this.apiKey = key;
  }

  async getCoaching(context: CoachingContext): Promise<CoachResponse> {
    if (!this.apiKey) {
      return this.getMockCoaching(context);
    }

    try {
      const prompt = this.buildCoachingPrompt(context);
      
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 200,
          temperature: 0.7,
          system: 'You are a friendly and encouraging chess coach. Provide helpful, personalized coaching based on the student\'s level and situation. Keep responses concise but supportive. Use encouraging emojis and maintain a positive tone.',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        message: data.content[0].text,
        type: this.determineResponseType(context),
        confidence: 0.9
      };
    } catch (error) {
      console.error('AI Coach API error:', error);
      return this.getMockCoaching(context);
    }
  }

  async getPuzzleHint(context: CoachingContext, attemptCount: number): Promise<PuzzleHint> {
    if (!this.apiKey) {
      return this.getMockPuzzleHint(context, attemptCount);
    }

    try {
      const prompt = `Chess position: ${context.position}
Player level: ${context.playerLevel}
Attempts made: ${attemptCount}
Puzzle type: ${context.puzzleType}

The player is struggling with this chess puzzle. Please provide a helpful hint that's appropriate for their skill level and attempt count. For fewer attempts, give gentler hints. For more attempts, be more specific.

Respond with just the hint text, keep it concise and encouraging.`;
      
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 150,
          temperature: 0.7,
          system: 'You are a chess coach providing hints for puzzles. Give helpful, progressive hints that encourage learning.',
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      const data = await response.json();
      const level = attemptCount <= 2 ? 'gentle' : attemptCount <= 4 ? 'specific' : 'direct';
      
      return {
        hint: data.content[0].text,
        level,
        suggestedSquares: attemptCount > 5 ? ['e4', 'f7', 'd5'] : undefined
      };
    } catch (error) {
      console.error('AI Coach hint error:', error);
      return this.getMockPuzzleHint(context, attemptCount);
    }
  }

  async analyzeGame(context: CoachingContext): Promise<GameAnalysis> {
    if (!this.apiKey) {
      return this.getMockGameAnalysis(context);
    }

    try {
      const prompt = `Please analyze this chess game:

Final position: ${context.position}
Player level: ${context.playerLevel}
Move history: ${context.moveHistory.join(' ')}

Provide a brief analysis focusing on:
1. Overall evaluation of the player's performance
2. 2-3 key strengths they showed
3. 1-2 areas for improvement
4. Reasoning for the assessment

Keep it encouraging and educational for a ${context.difficulty} level player.`;
      
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 300,
          temperature: 0.7,
          system: 'You are a chess coach analyzing games. Provide constructive feedback that helps players improve while staying encouraging.',
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      const data = await response.json();
      const analysisText = data.content[0].text;
      
      // Parse the response to extract structured data
      // For now, we'll use the mock analysis structure with Claude's text
      const mockAnalysis = this.getMockGameAnalysis(context);
      
      return {
        evaluation: analysisText.split('\n')[0] || mockAnalysis.evaluation,
        reasoning: "Based on Claude's analysis of your game performance",
        playerStrengths: mockAnalysis.playerStrengths, // Could parse these from Claude's response
        areasForImprovement: mockAnalysis.areasForImprovement // Could parse these from Claude's response
      };
    } catch (error) {
      console.error('AI Coach analysis error:', error);
      return this.getMockGameAnalysis(context);
    }
  }

  private buildCoachingPrompt(context: CoachingContext): string {
    let prompt = `Chess position: ${context.position}\n`;
    prompt += `Player level: ${context.playerLevel}\n`;
    prompt += `Difficulty: ${context.difficulty}\n`;
    
    if (context.lastMove) {
      prompt += `Last move: ${context.lastMove}\n`;
    }
    
    if (context.isCorrectMove !== undefined) {
      prompt += `Move was ${context.isCorrectMove ? 'correct' : 'incorrect'}\n`;
    }
    
    if (context.puzzleType) {
      prompt += `Puzzle type: ${context.puzzleType}\n`;
    }
    
    if (context.lessonTopic) {
      prompt += `Lesson topic: ${context.lessonTopic}\n`;
    }
    
    prompt += `Provide coaching appropriate for this situation.`;
    
    return prompt;
  }

  private determineResponseType(context: CoachingContext): CoachResponse['type'] {
    if (context.isCorrectMove === true) return 'celebration';
    if (context.isCorrectMove === false) return 'correction';
    if (context.puzzleType) return 'hint';
    return 'encouragement';
  }

  // Mock implementations for development
  private getMockCoaching(context: CoachingContext): CoachResponse {
    const responses = {
      celebration: [
        "Excellent move! You're really getting the hang of this! 🎉",
        "Perfect! That was exactly the right idea! ⭐",
        "Brilliant! You spotted that tactic beautifully! 👏",
        "Great job! Your chess vision is improving! 🔥"
      ],
      correction: [
        "Not quite right, but you're thinking in the right direction! 🤔",
        "That's a reasonable idea, but let's look for something stronger! 💪",
        "Good attempt! Try to look for forcing moves like checks and captures! 🎯",
        "Almost there! Consider what your opponent's threats are first! 🛡️"
      ],
      hint: [
        "Look for a move that attacks two pieces at once! 👀",
        "Sometimes the best move is the most forcing one! ⚡",
        "What would happen if you moved your most active piece? 🚀",
        "Try to find a move that improves your worst-placed piece! 📈"
      ],
      encouragement: [
        "Take your time and look for the best move! You've got this! 💫",
        "Remember the basic principles: develop pieces, control the center! 🎯",
        "You're doing great! Each game makes you stronger! 🌟",
        "Think about what your opponent is planning next! 🧠"
      ],
      analysis: [
        "This position has some interesting tactical possibilities! 🔍",
        "The key here is improving piece coordination! 🤝",
        "Focus on controlling the most important squares! 🎯",
        "This is a great learning position - lots of candidate moves! 📚"
      ]
    };

    const type = this.determineResponseType(context);
    const messages = responses[type] || responses.encouragement;
    const message = messages[Math.floor(Math.random() * messages.length)];

    return {
      message,
      type,
      confidence: 0.8
    };
  }

  private getMockPuzzleHint(context: CoachingContext, attemptCount: number): PuzzleHint {
    const hints = {
      gentle: [
        "Look for moves that create immediate threats!",
        "What pieces can you activate with tempo?",
        "Sometimes the solution involves a sacrifice!",
        "Check if there are any pins or forks available!"
      ],
      specific: [
        "Focus on the center of the board - there might be a tactic there!",
        "Look at your opponent's king safety - is there a weakness?",
        "Your pieces need to work together - which combination is strongest?",
        "Sometimes retreating a piece can set up a powerful follow-up!"
      ],
      direct: [
        "Try moving your most active piece to create multiple threats!",
        "Look for a move that attacks the king AND another piece!",
        "The solution probably involves your strongest piece!",
        "Count the attackers and defenders around the key squares!"
      ]
    };

    const level = attemptCount <= 2 ? 'gentle' : attemptCount <= 4 ? 'specific' : 'direct';
    const hintList = hints[level];
    const hint = hintList[Math.floor(Math.random() * hintList.length)];

    return {
      hint,
      level,
      suggestedSquares: attemptCount > 5 ? ['e4', 'f7', 'd5'] : undefined // Mock suggested squares for very stuck players
    };
  }

  private getMockGameAnalysis(context: CoachingContext): GameAnalysis {
    const evaluations = [
      "You played a solid opening, focusing on development!",
      "Your tactical awareness was strong in the middlegame!",
      "You handled the endgame with good technique!",
      "Your positional understanding is improving!"
    ];

    const strengths = [
      "Good piece development",
      "Strong tactical vision", 
      "Solid pawn structure",
      "Active piece play",
      "Good time management"
    ];

    const improvements = [
      "Look for more forcing moves",
      "Improve king safety earlier",
      "Consider pawn structure more",
      "Calculate deeper variations",
      "Work on endgame technique"
    ];

    return {
      evaluation: evaluations[Math.floor(Math.random() * evaluations.length)],
      reasoning: "Based on your recent performance and the moves you made in this game.",
      playerStrengths: strengths.slice(0, Math.floor(Math.random() * 3) + 2),
      areasForImprovement: improvements.slice(0, Math.floor(Math.random() * 2) + 1)
    };
  }

  // Utility methods
  isApiKeyConfigured(): boolean {
    return this.apiKey !== null;
  }

  isClaudeApiEnabled(): boolean {
    return this.apiKey !== null;
  }

  getCoachingForMove(move: string, isCorrect: boolean, position: string, playerLevel: number): Promise<CoachResponse> {
    return this.getCoaching({
      position,
      moveHistory: [],
      playerLevel,
      difficulty: playerLevel < 5 ? 'beginner' : playerLevel < 15 ? 'intermediate' : 'advanced',
      lastMove: move,
      isCorrectMove: isCorrect
    });
  }

  getHintForPuzzle(position: string, attemptCount: number, puzzleType: string = 'tactical'): Promise<PuzzleHint> {
    return this.getPuzzleHint({
      position,
      moveHistory: [],
      playerLevel: 5, // Default level for puzzles
      difficulty: 'intermediate',
      puzzleType
    }, attemptCount);
  }
}

// Export a singleton instance
export const aiCoach = new AIChessCoach();

// Export types for use in components
export type { CoachResponse, PuzzleHint, GameAnalysis, CoachingContext };