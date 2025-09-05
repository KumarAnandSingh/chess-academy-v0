import React from 'react';
import { useGamificationStore } from '../stores/gamificationStore';

const AchievementsPage: React.FC = () => {
  const { achievements, totalXP, currentLevel, currentStreak, longestStreak } = useGamificationStore();

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'lessons': return '🎓 Learning Achievements';
      case 'puzzles': return '🧩 Puzzle Achievements';
      case 'games': return '🏆 Game Achievements';
      case 'streaks': return '🔥 Streak Achievements';
      case 'special': return '⭐ Special Achievements';
      default: return 'Achievements';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'lessons': return 'border-blue-200 bg-blue-50';
      case 'puzzles': return 'border-green-200 bg-green-50';
      case 'games': return 'border-yellow-200 bg-yellow-50';
      case 'streaks': return 'border-red-200 bg-red-50';
      case 'special': return 'border-purple-200 bg-purple-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const groupedAchievements = achievements.reduce((groups, achievement) => {
    const category = achievement.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(achievement);
    return groups;
  }, {} as Record<string, typeof achievements>);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const completionPercentage = Math.round((unlockedCount / achievements.length) * 100);

  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Achievements</h1>
          <p className="text-gray-600 mb-6">
            Track your chess learning journey through various accomplishments and milestones.
          </p>

          {/* Overall Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <div className="text-2xl font-bold text-blue-600">{unlockedCount}/{achievements.length}</div>
              <div className="text-sm text-gray-600">Unlocked</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <div className="text-2xl font-bold text-green-600">{completionPercentage}%</div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <div className="text-2xl font-bold text-purple-600">{totalXP}</div>
              <div className="text-sm text-gray-600">Total XP</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <div className="text-2xl font-bold text-orange-600">Lv.{currentLevel}</div>
              <div className="text-sm text-gray-600">Current Level</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Achievement Progress</span>
              <span>{unlockedCount}/{achievements.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Achievement Categories */}
        <div className="space-y-8">
          {Object.entries(groupedAchievements).map(([category, categoryAchievements]) => (
            <div key={category}>
              <h2 className="text-xl font-semibold mb-4">
                {getCategoryTitle(category)}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      achievement.unlocked 
                        ? `${getCategoryColor(category)} border-opacity-100` 
                        : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`text-3xl ${achievement.unlocked ? '' : 'grayscale'}`}>
                        {achievement.icon}
                      </div>
                      {achievement.unlocked && (
                        <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                          Unlocked!
                        </div>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {achievement.description}
                    </p>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className={`font-medium ${achievement.unlocked ? 'text-green-600' : 'text-gray-900'}`}>
                          {Math.min(achievement.currentProgress, achievement.requirement)}/{achievement.requirement}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            achievement.unlocked ? 'bg-green-500' : 'bg-blue-400'
                          }`}
                          style={{
                            width: `${Math.min((achievement.currentProgress / achievement.requirement) * 100, 100)}%`
                          }}
                        />
                      </div>
                    </div>

                    {achievement.unlocked && achievement.unlockedAt && (
                      <div className="mt-3 text-xs text-gray-500">
                        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Motivational Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">🎯 Keep Going!</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="mb-2"><strong>Current Stats:</strong></p>
              <ul className="space-y-1 text-gray-600">
                <li>• Current streak: {currentStreak} days</li>
                <li>• Longest streak: {longestStreak} days</li>
                <li>• Level: {currentLevel}</li>
                <li>• Total XP: {totalXP}</li>
              </ul>
            </div>
            <div>
              <p className="mb-2"><strong>Tips for More Achievements:</strong></p>
              <ul className="space-y-1 text-gray-600">
                <li>• Complete lessons daily to build streaks</li>
                <li>• Solve puzzles quickly for speed bonuses</li>
                <li>• Aim for perfect accuracy in lessons</li>
                <li>• Play games against the computer regularly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementsPage;