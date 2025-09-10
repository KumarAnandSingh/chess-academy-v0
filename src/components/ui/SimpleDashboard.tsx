import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Puzzle, Monitor, Trophy, Target, Crown, Zap, TrendingUp, Gamepad2, Save } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';
import { Button } from './button';
import { Progress } from './progress';
import { Badge } from './badge';
import DailyPlanHorizontal from '../DailyPlanHorizontal';

// Dashboard Card Component
interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
  cta: string;
  iconColor: string;
  bgGradient: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, 
  description, 
  icon, 
  to, 
  cta, 
  iconColor,
  bgGradient
}) => {
  return (
    <Card className="group h-full cursor-pointer transform hover:scale-[1.03] transition-all duration-300 hover:shadow-modal overflow-hidden relative" style={{ borderColor: 'var(--color-border-subtle)', backgroundColor: 'var(--color-surface-elevated)' }}>
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${bgGradient}`} />
      <CardHeader className="relative z-10 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-3 rounded-lg ${iconColor} shadow-card group-hover:shadow-dropdown transition-all duration-300 group-hover:scale-110`}>
            {icon}
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold transition-colors duration-300" style={{ color: 'var(--color-text-primary)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-primary)'}>{title}</CardTitle>
            <CardDescription className="text-sm leading-relaxed">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardFooter className="relative z-10 pt-0">
        <Button 
          asChild 
          className="w-full min-h-[44px] px-4 py-3 font-semibold transition-all duration-300"
          style={{ 
            backgroundColor: cta.includes('Try Free') || cta.includes('Play Now') ? 'var(--color-cta-primary)' : 'transparent',
            color: cta.includes('Try Free') || cta.includes('Play Now') ? '#ffffff' : 'var(--color-text-secondary)',
            border: cta.includes('Try Free') || cta.includes('Play Now') ? 'none' : '1.5px solid var(--color-border-default)',
            borderRadius: '12px'
          }}
        >
          <Link to={to} className="font-medium tracking-wide">{cta}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

// Progress Card Component
interface ProgressCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  progress?: number;
  color: string;
  icon?: React.ReactNode;
}

const ProgressCard: React.FC<ProgressCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  progress,
  color,
  icon
}) => {
  return (
    <Card className="group hover:shadow-dropdown transition-all duration-300" style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border-default)' }}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {icon && (
              <div className="p-2 rounded-md transition-colors duration-300" style={{ backgroundColor: 'var(--color-accent-primary-subtle)', color: 'var(--color-accent-primary)' }}>
                {icon}
              </div>
            )}
            <h3 className="font-semibold font-primary text-base" style={{ color: 'var(--color-text-primary)' }}>{title}</h3>
          </div>
          {progress !== undefined && (
            <Badge variant="subtle" size="sm">
              {progress}%
            </Badge>
          )}
        </div>
        <div className="text-3xl font-bold mb-2 font-primary tracking-tight" style={{ color: color === 'accent-primary' ? 'var(--color-accent-primary)' : color === 'success' ? 'var(--color-success)' : 'var(--color-accent-primary)' }}>
          {value}
        </div>
        <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-text-secondary)' }}>{subtitle}</p>
        {progress !== undefined && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
              <span>Progress</span>
              <span className="font-medium" style={{ color: 'var(--color-accent-primary)' }}>{progress}%</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const SimpleDashboard: React.FC = () => {
  const dashboardCards = [
    {
      title: 'Learn',
      description: 'Master chess fundamentals with guided lessons. Free trial - no signup required!',
      icon: <Brain className="h-6 w-6 text-white" />,
      to: '/lessons',
      cta: 'Try Free Lessons',
      iconColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
      bgGradient: 'bg-gradient-to-br from-blue-500/20 to-blue-600/20'
    },
    {
      title: 'Puzzles',
      description: 'Sharpen your tactical skills with puzzles. Instant access - start solving now!',
      icon: <Puzzle className="h-6 w-6 text-white" />,
      to: '/puzzles',
      cta: 'Try Free Puzzles',
      iconColor: 'bg-gradient-to-br from-success to-green-600',
      bgGradient: 'bg-gradient-to-br from-success/20 to-green-600/20'
    },
    {
      title: 'vs Computer',
      description: 'Practice against AI opponents. Play instantly - no account needed!',
      icon: <Monitor className="h-6 w-6 text-white" />,
      to: '/play',
      cta: 'Play Now',
      iconColor: 'bg-gradient-to-br from-accent to-accent-600',
      bgGradient: 'bg-gradient-to-br from-accent/20 to-accent-600/20'
    },
    {
      title: 'Rate My Strength',
      description: 'Discover your chess rating level. Free assessment available!',
      icon: <Target className="h-6 w-6 text-white" />,
      to: '/strength-assessment',
      cta: 'Test Skills Free',
      iconColor: 'bg-gradient-to-br from-danger to-red-600',
      bgGradient: 'bg-gradient-to-br from-danger/20 to-red-600/20'
    },
    {
      title: 'Leaderboard',
      description: 'Compare with top players worldwide. View rankings and stats!',
      icon: <Trophy className="h-6 w-6 text-white" />,
      to: '/leaderboard',
      cta: 'View Rankings',
      iconColor: 'bg-gradient-to-br from-warning to-orange-500',
      bgGradient: 'bg-gradient-to-br from-warning/20 to-orange-500/20'
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden border-b" style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border-subtle)' }}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, var(--color-accent-primary-subtle) 0%, transparent 100%)' }} />
          <div className="absolute top-0 right-0 w-1/3 h-full" style={{ background: 'linear-gradient(270deg, var(--color-accent-primary-subtle) 0%, transparent 100%)' }} />
        </div>
        
        <div className="relative container mx-auto px-6 py-12 text-center max-w-4xl">
          {/* Chess Crown Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 group hover:scale-110 transition-transform duration-300" style={{ background: 'linear-gradient(135deg, var(--color-accent-primary) 0%, var(--color-accent-primary-hover) 100%)', boxShadow: 'var(--elevation-card)', borderRadius: '12px' }}>
            <Crown className="w-10 h-10 text-white" aria-label="Chess Academy" />
          </div>
          
          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl font-bold font-primary mb-6 tracking-tighter leading-tight" style={{ color: 'var(--color-text-primary)' }}>
            Master Chess with
            <span className="block bg-clip-text text-transparent" style={{ background: 'linear-gradient(90deg, var(--color-accent-primary) 0%, var(--color-accent-primary-hover) 100%)', WebkitBackgroundClip: 'text' }}>
              Premium Training
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl mb-8 leading-relaxed font-secondary max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
            Join thousands of players improving their chess skills with our AI-powered lessons, 
            tactical puzzles, and personalized learning paths.
          </p>
          
          {/* CTA Buttons - Primary Green Hierarchy */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="xl" 
              asChild 
              className="min-w-[200px] min-h-[44px] px-5 py-3 font-semibold transition-all duration-200"
              style={{ 
                backgroundColor: 'var(--color-cta-primary)', 
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px'
              }}
            >
              <Link to="/lessons">Start Learning</Link>
            </Button>
            <Button 
              size="xl" 
              variant="outline" 
              asChild 
              className="min-w-[200px] min-h-[44px] px-5 py-3 font-semibold transition-all duration-200 border-2"
              style={{ 
                borderColor: 'var(--color-border-default)',
                color: 'var(--color-text-secondary)',
                borderRadius: '12px'
              }}
            >
              <Link to="/play">Play vs Computer</Link>
            </Button>
          </div>
          
          {/* Guest Trial Notice */}
          <div className="text-center mb-8 p-6" style={{ background: 'linear-gradient(90deg, var(--color-accent-primary-subtle) 0%, var(--color-accent-primary-subtle) 100%)', border: '1px solid var(--color-accent-primary)', opacity: 0.7, borderRadius: '12px' }}>
            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold mb-2 flex items-center justify-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                <Gamepad2 className="w-5 h-5" style={{ color: 'var(--color-accent-primary)' }} aria-label="Gaming" />
                <strong>Full Access - No Signup Required!</strong>
              </h3>
              <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                Try everything for free: lessons, puzzles, play vs computer, strength assessment, and leaderboards. 
                No barriers, no payments - just pure chess learning.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <div className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--color-text-secondary)' }}>
                  <Save className="w-4 h-4" style={{ color: 'var(--color-accent-primary)' }} aria-label="Save progress" />
                  Want to save progress?
                </div>
                <button 
                  onClick={() => {
                    const modal = document.querySelector('[data-auth-modal]') as HTMLElement;
                    modal?.click();
                  }}
                  className="font-medium underline decoration-2 underline-offset-2" style={{ color: 'var(--color-accent-primary)' }}
                >
                  Create free account after trying →
                </button>
              </div>
            </div>
          </div>
          
          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="text-center p-4 backdrop-blur-sm" style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border-subtle)', border: '1px solid', borderRadius: '12px' }}>
              <div className="flex justify-center mb-2">
                <Target className="w-8 h-8" style={{ color: 'var(--color-accent-primary)' }} aria-label="Personalized learning" />
              </div>
              <h3 className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Personalized</h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>AI adapts to your skill level</p>
            </div>
            <div className="text-center p-4 backdrop-blur-sm" style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border-subtle)', border: '1px solid', borderRadius: '12px' }}>
              <div className="flex justify-center mb-2">
                <Zap className="w-8 h-8" style={{ color: 'var(--color-accent-primary)' }} aria-label="Interactive practice" />
              </div>
              <h3 className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Interactive</h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Practice with real-time feedback</p>
            </div>
            <div className="text-center p-4 backdrop-blur-sm" style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border-subtle)', border: '1px solid', borderRadius: '12px' }}>
              <div className="flex justify-center mb-2">
                <TrendingUp className="w-8 h-8" style={{ color: 'var(--color-accent-primary)' }} aria-label="Progressive improvement" />
              </div>
              <h3 className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Progressive</h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Track your improvement</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-6 py-16 max-w-7xl">

        {/* Daily Plan Widget */}
        <div className="mb-12 flex justify-center">
          <div className="w-full max-w-lg">
            <div className="p-6" style={{ background: 'linear-gradient(135deg, var(--color-surface-elevated) 0%, var(--color-surface) 100%)', border: '1px solid var(--color-border-subtle)', boxShadow: 'var(--elevation-card)', borderRadius: '12px' }}>
              <h2 className="text-xl font-semibold font-primary mb-4 text-center" style={{ color: 'var(--color-text-primary)' }}>
                Today's Plan
              </h2>
              <DailyPlanHorizontal />
            </div>
          </div>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold font-primary mb-3 tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
              Choose Your Path
            </h2>
            <p className="text-lg font-secondary" style={{ color: 'var(--color-text-secondary)' }}>
              Select an area to focus on and start your chess improvement journey
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {dashboardCards.map((card) => (
              <DashboardCard
                key={card.title}
                title={card.title}
                description={card.description}
                icon={card.icon}
                to={card.to}
                cta={card.cta}
                iconColor={card.iconColor}
                bgGradient={card.bgGradient}
              />
            ))}
          </div>
        </div>

        {/* Progress Section */}
        <div>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold font-primary mb-3 tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
              Your Progress
            </h2>
            <p className="text-lg font-secondary" style={{ color: 'var(--color-text-secondary)' }}>
              Track your chess development across different areas
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ProgressCard
              title="Lessons Completed"
              value={0}
              subtitle="Begin your learning journey"
              progress={0}
              color="accent-primary"
              icon={<Brain className="h-4 w-4" />}
            />
            
            <ProgressCard
              title="Puzzles Solved"
              value={0}
              subtitle="Sharpen your tactics"
              progress={0}
              color="success"
              icon={<Puzzle className="h-4 w-4" />}
            />
            
            <ProgressCard
              title="Current Rating"
              value={1200}
              subtitle="Your estimated skill level"
              color="accent-primary"
              icon={<Target className="h-4 w-4" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboard;