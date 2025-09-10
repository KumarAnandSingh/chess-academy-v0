import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';

// Mock data for demonstration - in real app this would come from API
const mockLeaderboardData = [
  {
    id: 1,
    rank: 1,
    name: "ChessMaster2024",
    rating: 1847,
    weeklyGames: 23,
    winRate: 78,
    streak: 12,
    badges: ["🏆", "⚡", "🔥"],
    avatar: "👤",
    country: "🇺🇸"
  },
  {
    id: 2,
    rank: 2,
    name: "TacticalGenius",
    rating: 1732,
    weeklyGames: 19,
    winRate: 71,
    streak: 8,
    badges: ["🏆", "⚡"],
    avatar: "👤",
    country: "🇮🇳"
  },
  {
    id: 3,
    rank: 3,
    name: "QueenSacrifice",
    rating: 1698,
    weeklyGames: 31,
    winRate: 69,
    streak: 5,
    badges: ["🔥", "📈"],
    avatar: "👤",
    country: "🇬🇧"
  },
  {
    id: 4,
    rank: 4,
    name: "EndgameExpert",
    rating: 1654,
    weeklyGames: 15,
    winRate: 73,
    streak: 7,
    badges: ["⚡"],
    avatar: "👤",
    country: "🇩🇪"
  },
  {
    id: 5,
    rank: 5,
    name: "PuzzleSolver",
    rating: 1623,
    weeklyGames: 27,
    winRate: 66,
    streak: 3,
    badges: ["📈"],
    avatar: "👤",
    country: "🇫🇷"
  }
];

const currentUserData = {
  id: 'current',
  rank: 47,
  name: "You",
  rating: 1234,
  weeklyGames: 8,
  winRate: 62,
  streak: 2,
  badges: ["📈"],
  avatar: "👤",
  country: "🇮🇳",
  ratingChange: +23,
  nextMilestone: 1300,
  progressToNext: 66
};

const seasonData = {
  name: "Autumn Championship 2025",
  endsIn: "23 days",
  totalPlayers: 1247,
  prize: "Chess.com Premium + Trophies"
};

const LeaderboardPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('global');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 1800) return "text-purple-600 font-bold";
    if (rating >= 1600) return "text-blue-600 font-semibold";
    if (rating >= 1400) return "text-green-600 font-medium";
    if (rating >= 1200) return "text-yellow-600 font-medium";
    return ""; // Will use inline style for design token
  };

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="space-y-4">
                <div className="h-40 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🏆 Leaderboard
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Compete with chess players worldwide and climb the rankings!
          </p>
        </div>

        {/* Season Info Banner */}
        <Card className="mb-6 border-l-4 border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg text-yellow-800">
                  🎯 {seasonData.name}
                </CardTitle>
                <CardDescription className="text-yellow-700">
                  Ends in {seasonData.endsIn} • {seasonData.totalPlayers.toLocaleString()} players competing
                </CardDescription>
              </div>
              <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">
                🏆 {seasonData.prize}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { id: 'global', label: '🌍 Global', count: '1.2K' },
            { id: 'friends', label: '👥 Friends', count: '12' },
            { id: 'country', label: '🇮🇳 India', count: '247' }
          ].map(tab => (
            <Button
              key={tab.id}
              variant={selectedTab === tab.id ? "primary" : "ghost"}
              size="sm"
              onClick={() => setSelectedTab(tab.id)}
              className={selectedTab === tab.id ? 'bg-white shadow-sm' : ''}
            >
              {tab.label} ({tab.count})
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Leaderboard */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">📊</span>
                  Top Players
                </CardTitle>
                <CardDescription>
                  This week's most active and highest-rated players
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockLeaderboardData.map((player, index) => (
                  <div key={player.id}>
                    <div className={`flex items-center justify-between p-4 rounded-lg transition-all hover:bg-gray-50 ${
                      index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' : ''
                    }`}>
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl font-bold w-12 text-center">
                          {getRankIcon(player.rank)}
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{player.avatar}</div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                                {player.name}
                              </span>
                              <span className="text-sm">{player.country}</span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                              <span className={getRatingColor(player.rating)}>
                                {player.rating} ELO
                              </span>
                              <span>•</span>
                              <span>{player.weeklyGames} games</span>
                              <span>•</span>
                              <span>{player.winRate}% win rate</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {player.streak > 0 && (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                            🔥 {player.streak}
                          </Badge>
                        )}
                        <div className="flex space-x-1">
                          {player.badges.map((badge, i) => (
                            <span key={i} className="text-lg" title="Achievement badge">
                              {badge}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    {index < mockLeaderboardData.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Your Rank Card */}
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <span>📈</span>
                  Your Rank
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{currentUserData.avatar}</div>
                    <div>
                      <div className="font-semibold text-blue-900">{currentUserData.name}</div>
                      <div className="text-sm text-blue-700">Rank #{currentUserData.rank}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getRatingColor(currentUserData.rating)}`}>
                      {currentUserData.rating}
                    </div>
                    <div className="text-xs text-green-600 font-medium">
                      +{currentUserData.ratingChange} this week
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress to {currentUserData.nextMilestone}</span>
                    <span className="font-medium">{currentUserData.progressToNext}%</span>
                  </div>
                  <Progress value={currentUserData.progressToNext} className="h-2" />
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-lg font-bold text-blue-600">{currentUserData.weeklyGames}</div>
                    <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Games</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">{currentUserData.winRate}%</div>
                    <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Win Rate</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-orange-600">{currentUserData.streak}</div>
                    <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Streak</div>
                  </div>
                </div>

                {currentUserData.badges.length > 0 && (
                  <div className="flex justify-center space-x-1 pt-2 border-t border-blue-200">
                    <span className="text-sm text-blue-700 mr-2">Badges:</span>
                    {currentUserData.badges.map((badge, i) => (
                      <span key={i} className="text-lg">{badge}</span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <span>⚡</span>
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" size="sm">
                  🎯 Play Rated Game
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  🧩 Solve Puzzles
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  👥 Challenge Friend
                </Button>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <span>🏆</span>
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2 p-2 bg-yellow-50 rounded text-sm">
                  <span>🔥</span>
                  <span>5-game win streak!</span>
                </div>
                <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded text-sm">
                  <span>📈</span>
                  <span>Rating milestone: 1200+</span>
                </div>
                <div className="flex items-center space-x-2 p-2 bg-green-50 rounded text-sm">
                  <span>🧩</span>
                  <span>100 puzzles solved</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;