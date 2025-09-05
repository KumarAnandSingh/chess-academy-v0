import React from 'react';
import { PieceSymbol, Color } from 'chess.js';

interface PieceTooltipProps {
  piece: PieceSymbol;
  color: Color;
  square: string;
  show: boolean;
  position: { x: number; y: number };
  classicFact?: string;
}

const PIECE_NAMES = {
  p: 'Pawn',
  r: 'Rook', 
  n: 'Knight',
  b: 'Bishop',
  q: 'Queen',
  k: 'King'
};

const PIECE_FACTS: Record<string, string[]> = {
  p: [
    "The only piece that captures differently than it moves!",
    "Can promote to any piece except King when reaching the end",
    "En passant is a special pawn capture rule",
    "Pawns are the soul of chess - Philidor"
  ],
  r: [
    "Worth about 5 points in material value",
    "Most powerful on open files and ranks",
    "Can castle with the King for safety",
    "Rook and King vs King is a basic checkmate"
  ],
  n: [
    "The only piece that can jump over others",
    "Always lands on opposite colored squares",
    "Worth about 3 points in material value",
    "Knights on the rim are dim!"
  ],
  b: [
    "Each player starts with one light and one dark-squared bishop",
    "Worth about 3 points in material value",
    "Long diagonal bishops can be very powerful",
    "Bishop pair advantage in open positions"
  ],
  q: [
    "The most powerful piece, worth about 9 points",
    "Combines the power of Rook and Bishop",
    "Don't bring your Queen out too early!",
    "Queen sacrifices can lead to brilliant combinations"
  ],
  k: [
    "The most important piece - must be protected",
    "Can move one square in any direction",
    "Castling helps keep the King safe",
    "In endgames, the King becomes an active piece"
  ]
};

const CLASSIC_MOVES: Record<string, string> = {
  'f7': "This is the weakest square in Black's position!",
  'h7': "A common target for mating attacks",
  'g7': "The fianchetto square for Black's bishop",
  'b7': "The fianchetto square for Black's bishop",
  'f2': "This is the weakest square in White's position!",
  'h2': "A common target for mating attacks",
  'g2': "The fianchetto square for White's bishop",
  'b2': "The fianchetto square for White's bishop",
  'e4': "Best by test - Bobby Fischer's favorite!",
  'd4': "The Queen's Gambit starts here",
  'e5': "The most popular response to 1.e4",
  'd5': "Challenging the center immediately",
  'c4': "The English Opening - flexible and strategic",
  'f4': "The King's Gambit - aggressive and romantic",
  'c5': "The Sicilian Defense - Black's most ambitious reply"
};

export const PieceTooltip: React.FC<PieceTooltipProps> = ({
  piece,
  color,
  square,
  show,
  position,
  classicFact
}) => {
  if (!show) return null;

  const pieceName = PIECE_NAMES[piece];
  const colorName = color === 'w' ? 'White' : 'Black';
  const facts = PIECE_FACTS[piece];
  const randomFact = facts[Math.floor(Math.random() * facts.length)];
  const squareFact = CLASSIC_MOVES[square];
  
  return (
    <div
      className="absolute z-50 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl border border-gray-700 max-w-xs pointer-events-none"
      style={{
        left: position.x + 10,
        top: position.y - 10,
        transform: 'translateY(-100%)'
      }}
    >
      {/* Piece Info */}
      <div className="font-bold text-yellow-300 mb-1">
        {colorName} {pieceName}
      </div>
      
      {/* Square Info */}
      <div className="text-gray-300 mb-2">
        Square: <span className="font-mono font-bold">{square.toUpperCase()}</span>
      </div>
      
      {/* Fun Fact */}
      <div className="text-blue-200 text-xs mb-1">
        💡 {randomFact}
      </div>
      
      {/* Square-specific fact */}
      {squareFact && (
        <div className="text-green-200 text-xs border-t border-gray-600 pt-1">
          🏰 {squareFact}
        </div>
      )}
      
      {/* Classic move fact */}
      {classicFact && (
        <div className="text-purple-200 text-xs border-t border-gray-600 pt-1">
          ⭐ {classicFact}
        </div>
      )}
      
      {/* Tooltip arrow */}
      <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
    </div>
  );
};