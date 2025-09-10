import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Gamepad2, 
  Puzzle,
  Users,
  Medal,
  Star,
  Crown,
  Flame,
  Zap,
  Globe,
  ChevronUp,
  Activity
} from 'lucide-react';

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
    badges: ["master", "lightning", "fire"],
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
    badges: ["master", "lightning"],
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
    badges: ["fire", "trending"],
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
    badges: ["lightning"],
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
    badges: ["trending"],
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
  badges: ["trending"],
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
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-600" aria-label="1st place" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-500" aria-label="2nd place" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" aria-label="3rd place" />;
    return <span className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>#{rank}</span>;
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 1800) return "text-purple-600 font-bold";
    if (rating >= 1600) return "text-blue-600 font-semibold"; 
    if (rating >= 1400) return "text-green-600 font-medium";
    if (rating >= 1200) return "text-yellow-600 font-medium";
    return "font-medium";
  };

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'master': return <Trophy className="w-4 h-4" aria-label="Master" />;
      case 'lightning': return <Zap className="w-4 h-4" aria-label="Lightning fast" />;
      case 'fire': return <Flame className="w-4 h-4" aria-label="On fire" />;
      case 'trending': return <TrendingUp className="w-4 h-4" aria-label="Trending up" />;
      default: return <Star className="w-4 h-4" aria-label="Achievement" />;
    }
  };

  if (isLoading) {
    return (
      <div className="py-8" style={{ backgroundColor: 'var(--color-bg-base)' }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 rounded w-48 mb-8" style={{ backgroundColor: 'var(--color-surface)' }}></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="h-20 rounded" style={{ backgroundColor: 'var(--color-surface)' }}></div>
                ))}
              </div>
              <div className="space-y-4">
                <div className="h-40 rounded" style={{ backgroundColor: 'var(--color-surface)' }}></div>
                <div className="h-32 rounded" style={{ backgroundColor: 'var(--color-surface)' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 min-h-screen" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Header - Fixed BUG-001: High contrast heading */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3 flex items-center gap-3" style={{ color: 'var(--color-text-primary)' }}>
            <Trophy className="w-10 h-10" style={{ color: 'var(--color-accent-primary)' }} aria-hidden="true" />
            Leaderboard
          </h1>
          <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            Compete with chess players worldwide and climb the rankings!
          </p>
        </div>

        {/* Season Info Banner - Fixed BUG-002: Improved tournament label contrast */}
        <Card className="mb-6 relative" style={{ 
          backgroundColor: 'var(--color-surface-elevated)', 
          borderLeft: '4px solid var(--color-warning)',
          border: '1px solid var(--color-border-default)'
        }}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg flex items-center gap-2 mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  <Target className="w-5 h-5" style={{ color: 'var(--color-accent-primary)' }} aria-hidden="true" />
                  {seasonData.name}
                </CardTitle>
                <CardDescription className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
                  Ends in {seasonData.endsIn} • {seasonData.totalPlayers.toLocaleString()} players competing
                </CardDescription>
              </div>
              {/* Fixed BUG-002: High contrast badge with solid background */}
              <Badge 
                className="px-4 py-2 text-sm font-semibold whitespace-nowrap flex items-center gap-2"
                style={{ 
                  backgroundColor: 'var(--color-accent-primary)', 
                  color: 'var(--color-accent-primary-contrast)',
                  border: '1px solid var(--color-accent-primary-hover)'
                }}
              >
                <Trophy className="w-4 h-4" aria-hidden="true" />
                {seasonData.prize}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Tab Navigation - Fixed BUG-010: Clear selected state and BUG-006: Focus states */}
        <div className="flex flex-wrap gap-2 mb-6 p-2 rounded-lg w-fit" style={{ backgroundColor: 'var(--color-surface)' }}>
          {[
            { id: 'global', label: 'Global', count: '1.2K', icon: Globe },
            { id: 'friends', label: 'Friends', count: '12', icon: Users },
            { id: 'country', label: 'India', count: '247', icon: Activity }
          ].map(tab => {
            const IconComponent = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={selectedTab === tab.id ? "primary" : "ghost"}
                size="sm"
                onClick={() => setSelectedTab(tab.id)}
                className={`
                  min-h-[44px] px-4 py-2 font-medium transition-all duration-200
                  focus:outline-none focus:ring-3 focus:ring-blue-500 focus:ring-opacity-50
                  ${selectedTab === tab.id 
                    ? 'shadow-md transform scale-[1.02]' 
                    : 'hover:scale-[1.01] hover:shadow-sm'
                  }
                `}
                style={{
                  backgroundColor: selectedTab === tab.id 
                    ? 'var(--color-accent-primary)' 
                    : 'transparent',
                  color: selectedTab === tab.id 
                    ? 'var(--color-accent-primary-contrast)' 
                    : 'var(--color-text-primary)',
                  border: selectedTab === tab.id 
                    ? '2px solid var(--color-accent-primary-hover)' 
                    : '2px solid transparent'
                }}
                aria-pressed={selectedTab === tab.id}
              >
                <IconComponent className="w-4 h-4 mr-2" aria-hidden="true" />
                {tab.label} ({tab.count})
              </Button>
            );
          })}
        </div>

        {/* Fixed BUG-007: Responsive layout with proper stacking */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Leaderboard */}
          <div className="xl:col-span-2 order-1">
            <Card style={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-default)' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl" style={{ color: 'var(--color-text-primary)' }}>
                  <Activity className="w-6 h-6" style={{ color: 'var(--color-accent-primary)' }} aria-hidden="true" />
                  Top Players
                </CardTitle>
                <CardDescription className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
                  This week's most active and highest-rated players
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockLeaderboardData.map((player, index) => (
                  <div key={player.id}>
                    <div className={`
                      flex items-center justify-between p-4 rounded-lg transition-all duration-200
                      hover:scale-[1.01] hover:shadow-md
                      focus-within:outline-none focus-within:ring-3 focus-within:ring-blue-500 focus-within:ring-opacity-50
                      ${index < 3 ? 'border-2' : 'border'}
                    `} style={{
                      backgroundColor: index < 3 
                        ? 'var(--color-accent-primary-subtle)' 
                        : 'var(--color-surface)',
                      borderColor: index < 3 
                        ? 'var(--color-accent-primary)' 
                        : 'var(--color-border-subtle)'
                    }}>
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-12 text-center">
                          {getRankIcon(player.rank)}
                        </div>
                        
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="text-2xl flex-shrink-0">{player.avatar}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-semibold text-lg truncate" style={{ color: 'var(--color-text-primary)' }}>
                                {player.name}
                              </span>
                              <span className="text-lg flex-shrink-0">{player.country}</span>
                            </div>
                            {/* Fixed BUG-001: Better contrast for secondary text */}
                            <div className="flex items-center space-x-3 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                              <span className={`${getRatingColor(player.rating)} text-base`}>
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

                      <div className="flex items-center space-x-3 flex-shrink-0">
                        {player.streak > 0 && (
                          <Badge 
                            className="flex items-center gap-1 px-2 py-1 font-semibold"
                            style={{ 
                              backgroundColor: 'var(--color-warning-subtle)', 
                              color: 'var(--color-warning)',
                              border: '1px solid var(--color-warning)'
                            }}
                          >
                            <Flame className="w-3 h-3" aria-hidden="true" />
                            {player.streak}
                          </Badge>
                        )}
                        <div className="flex space-x-1">
                          {player.badges.map((badge, i) => (
                            <div 
                              key={i} 
                              className="p-1 rounded"
                              style={{ 
                                backgroundColor: 'var(--color-accent-primary-subtle)',
                                color: 'var(--color-accent-primary)'
                              }}
                              title={`${badge} achievement`}
                            >
                              {getBadgeIcon(badge)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {index < mockLeaderboardData.length - 1 && (
                      <Separator className="my-2" style={{ backgroundColor: 'var(--color-border-subtle)' }} />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Fixed BUG-007: Sidebar with proper responsive order */}
          <div className="space-y-6 order-2 xl:order-2">
            {/* Your Rank Card */}
            <Card 
              className="border-2" 
              style={{ 
                backgroundColor: 'var(--color-surface-elevated)', 
                borderColor: 'var(--color-accent-primary)',
                boxShadow: 'var(--elevation-card)'
              }}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg" style={{ color: 'var(--color-text-primary)' }}>
                  <TrendingUp className="w-5 h-5" style={{ color: 'var(--color-accent-primary)' }} aria-hidden="true" />
                  Your Rank
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{currentUserData.avatar}</div>
                    <div>
                      <div className="font-semibold text-lg" style={{ color: 'var(--color-text-primary)' }}>
                        {currentUserData.name}
                      </div>
                      <div className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                        Rank #{currentUserData.rank}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-bold ${getRatingColor(currentUserData.rating)}`}>
                      {currentUserData.rating}
                    </div>
                    <div className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--color-success)' }}>
                      <ChevronUp className="w-3 h-3" aria-hidden="true" />
                      +{currentUserData.ratingChange} this week
                    </div>
                  </div>
                </div>

                {/* Fixed BUG-012: Improved progress bar contrast and visibility */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      Progress to {currentUserData.nextMilestone}
                    </span>
                    <span className="font-bold text-base" style={{ color: 'var(--color-accent-primary)' }}>
                      {currentUserData.progressToNext}%
                    </span>
                  </div>
                  <div 
                    className="w-full rounded-full h-3 relative overflow-hidden"
                    style={{ backgroundColor: 'var(--color-surface)' }}
                  >
                    <div 
                      className="h-full rounded-full transition-all duration-500 ease-out relative"
                      style={{ 
                        width: `${currentUserData.progressToNext}%`,
                        backgroundColor: 'var(--color-accent-primary)',
                        boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)'
                      }}
                    />
                  </div>
                </div>

                {/* Fixed BUG-014: Improved microcopy contrast and size */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-xl font-bold" style={{ color: 'var(--color-accent-primary)' }}>
                      {currentUserData.weeklyGames}
                    </div>
                    <div className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                      Games
                    </div>
                  </div>
                  <div>
                    <div className="text-xl font-bold" style={{ color: 'var(--color-success)' }}>
                      {currentUserData.winRate}%
                    </div>
                    <div className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                      Win Rate
                    </div>
                  </div>
                  <div>
                    <div className="text-xl font-bold" style={{ color: 'var(--color-warning)' }}>
                      {currentUserData.streak}
                    </div>
                    <div className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                      Streak
                    </div>
                  </div>
                </div>

                {currentUserData.badges.length > 0 && (
                  <div className="flex justify-center items-center gap-2 pt-3 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                      Badges:
                    </span>
                    {currentUserData.badges.map((badge, i) => (
                      <div 
                        key={i} 
                        className="p-1 rounded"
                        style={{ 
                          backgroundColor: 'var(--color-accent-primary-subtle)',
                          color: 'var(--color-accent-primary)'
                        }}
                      >
                        {getBadgeIcon(badge)}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Fixed BUG-005: Improved button affordances */}
            <Card style={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-default)' }}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg" style={{ color: 'var(--color-text-primary)' }}>
                  <Zap className="w-5 h-5" style={{ color: 'var(--color-accent-primary)' }} aria-hidden="true" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Primary action with filled button */}
                <Button 
                  className="w-full min-h-[44px] font-semibold text-base transition-all duration-200 
                    focus:outline-none focus:ring-3 focus:ring-blue-500 focus:ring-opacity-50
                    hover:scale-[1.02] hover:shadow-md"
                  size="lg"
                  style={{
                    backgroundColor: 'var(--color-accent-primary)',
                    color: 'var(--color-accent-primary-contrast)',
                    border: '2px solid var(--color-accent-primary-hover)'
                  }}
                >
                  <Gamepad2 className="w-5 h-5 mr-2" aria-hidden="true" />
                  Play Rated Game
                </Button>
                {/* Secondary actions with outlined buttons */}
                <Button 
                  variant="outline" 
                  className="w-full min-h-[44px] font-medium text-base transition-all duration-200
                    focus:outline-none focus:ring-3 focus:ring-blue-500 focus:ring-opacity-50
                    hover:scale-[1.01] hover:shadow-sm"
                  size="lg"
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--color-text-primary)',
                    borderColor: 'var(--color-border-default)',
                    borderWidth: '2px'
                  }}
                >
                  <Puzzle className="w-5 h-5 mr-2" aria-hidden="true" />
                  Solve Puzzles
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full min-h-[44px] font-medium text-base transition-all duration-200
                    focus:outline-none focus:ring-3 focus:ring-blue-500 focus:ring-opacity-50
                    hover:scale-[1.01] hover:shadow-sm"
                  size="lg"
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--color-text-primary)',
                    borderColor: 'var(--color-border-default)',
                    borderWidth: '2px'
                  }}
                >
                  <Users className="w-5 h-5 mr-2" aria-hidden="true" />
                  Challenge Friend
                </Button>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card style={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-default)' }}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg" style={{ color: 'var(--color-text-primary)' }}>
                  <Trophy className="w-5 h-5" style={{ color: 'var(--color-accent-primary)' }} aria-hidden="true" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div 
                  className="flex items-center space-x-3 p-3 rounded-lg font-medium"
                  style={{ backgroundColor: 'var(--color-warning-subtle)' }}
                >
                  <Flame className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-warning)' }} aria-hidden="true" />
                  <span style={{ color: 'var(--color-text-primary)' }}>5-game win streak!</span>
                </div>
                <div 
                  className="flex items-center space-x-3 p-3 rounded-lg font-medium"
                  style={{ backgroundColor: 'var(--color-accent-primary-subtle)' }}
                >
                  <TrendingUp className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-accent-primary)' }} aria-hidden="true" />
                  <span style={{ color: 'var(--color-text-primary)' }}>Rating milestone: 1200+</span>
                </div>
                <div 
                  className="flex items-center space-x-3 p-3 rounded-lg font-medium"
                  style={{ backgroundColor: 'var(--color-success-subtle)' }}
                >
                  <Puzzle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-success)' }} aria-hidden="true" />
                  <span style={{ color: 'var(--color-text-primary)' }}>100 puzzles solved</span>
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