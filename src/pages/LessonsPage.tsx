import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Mock lesson data - this would come from your backend API
const mockLessons = [
  {
    id: '1',
    title: 'Chess Basics: How the Pieces Move',
    description: 'Learn how each chess piece moves and captures. Perfect for absolute beginners!',
    difficulty: 'beginner' as const,
    duration: 25,
    modules: ['Welcome to Chess', 'Pawns', 'Rooks', 'Bishops', 'Knights', 'Queen & King'],
    completed: false,
    progress: 0,
  },
  {
    id: '2', 
    title: 'Checkmate Patterns',
    description: 'Learn essential checkmate patterns including back rank mates and basic endgames.',
    difficulty: 'beginner' as const,
    duration: 30,
    modules: ['What is Checkmate?', 'Back Rank Mate', 'Queen Checkmate', 'Smothered Mate'],
    completed: false,
    progress: 0,
  },
  {
    id: '3',
    title: 'Advanced Tactics',
    description: 'Master tactical patterns like forks, pins, and skewers to win material.',
    difficulty: 'intermediate' as const,
    duration: 40,
    modules: ['Introduction to Tactics', 'Forks', 'Pins', 'Skewers', 'Discovery Attacks'],
    completed: false,
    progress: 0,
  },
  {
    id: '4',
    title: 'King and Pawn Endgames',
    description: 'Master the most important endgame: King and Pawn vs King.',
    difficulty: 'intermediate' as const,
    duration: 35,
    modules: ['Endgame Fundamentals', 'Rule of the Square', 'Opposition', 'Winning Technique'],
    completed: false,
    progress: 0,
  },
  {
    id: '5',
    title: 'Opening Principles',
    description: 'Learn the fundamental principles for playing strong chess openings.',
    difficulty: 'advanced' as const,
    duration: 45,
    modules: ['Opening Goals', 'Center Control', 'Piece Development', 'King Safety', 'Common Mistakes'],
    completed: false,
    progress: 0,
  },
];

const LessonsPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [sortBy, setSortBy] = useState<'title' | 'difficulty' | 'duration'>('title');

  const filteredLessons = mockLessons
    .filter(lesson => filter === 'all' || lesson.difficulty === filter)
    .sort((a, b) => {
      switch (sortBy) {
        case 'difficulty':
          const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        case 'duration':
          return a.duration - b.duration;
        case 'title':
        default:
          return a.title.localeCompare(b.title);
      }
    });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'advanced':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress === 0) return 'bg-gray-200';
    if (progress < 50) return 'bg-yellow-400';
    if (progress < 100) return 'bg-blue-400';
    return 'bg-green-400';
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Chess Lessons</h1>
          <p className="text-gray-600 mb-6">
            Master chess through our interactive lessons. From basic piece movements to advanced strategies!
          </p>

          {/* Filters and Sorting */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex gap-2">
              <span className="text-sm font-medium text-gray-700 self-center mr-2">Filter:</span>
              {['all', 'beginner', 'intermediate', 'advanced'].map((level) => (
                <button
                  key={level}
                  onClick={() => setFilter(level as any)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filter === level
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
            
            <div className="flex gap-2">
              <span className="text-sm font-medium text-gray-700 self-center mr-2">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="title">Title</option>
                <option value="difficulty">Difficulty</option>
                <option value="duration">Duration</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">
                {mockLessons.length}
              </div>
              <div className="text-sm text-gray-600">Total Lessons</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-green-600">
                {mockLessons.filter(l => l.completed).length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-yellow-600">
                {mockLessons.filter(l => l.progress > 0 && !l.completed).length}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(mockLessons.reduce((acc, l) => acc + l.progress, 0) / mockLessons.length)}%
              </div>
              <div className="text-sm text-gray-600">Overall Progress</div>
            </div>
          </div>
        </div>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {lesson.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(lesson.difficulty)}`}>
                    {lesson.difficulty}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {lesson.description}
                </p>

                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{lesson.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(lesson.progress)}`}
                      style={{ width: `${lesson.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {lesson.duration} min
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {lesson.modules.length} modules
                  </span>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Modules:</h4>
                  <div className="flex flex-wrap gap-1">
                    {lesson.modules.slice(0, 3).map((module, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                      >
                        {module}
                      </span>
                    ))}
                    {lesson.modules.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{lesson.modules.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  to={`/lessons/${lesson.id}`}
                  className={`w-full flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    lesson.progress === 0
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : lesson.progress < 100
                      ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {lesson.progress === 0 ? 'Start Lesson' : lesson.progress < 100 ? 'Continue' : 'Review'}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredLessons.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No lessons found</h3>
            <p className="text-gray-600">Try adjusting your filters to see more lessons.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonsPage;