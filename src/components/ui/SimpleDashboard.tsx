import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Puzzle, Monitor, Trophy } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';
import { Button } from './button';
import { Progress } from './progress';
import { Badge } from './badge';

// Dashboard Card Component
interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
  cta: string;
  color: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, 
  description, 
  icon, 
  to, 
  cta, 
  color 
}) => {
  return (
    <Card className="h-full hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center gap-3">
        <div className={`p-3 rounded-xl ${color}`}>
          {icon}
        </div>
        <div className="flex-1">
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription className="text-sm">{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent />
      <CardFooter>
        <Button asChild className="w-full">
          <Link to={to}>{cta}</Link>
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
}

const ProgressCard: React.FC<ProgressCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  progress,
  color 
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {progress !== undefined && (
            <Badge variant="secondary" className="ml-2">
              {progress}%
            </Badge>
          )}
        </div>
        <div className={`text-3xl font-bold mb-1 ${color}`}>{value}</div>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
        {progress !== undefined && (
          <div className="mt-3">
            <Progress value={progress} className="h-2" />
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
      description: 'Start with fundamentals and strategy.',
      icon: <Brain className="h-6 w-6 text-white" />,
      to: '/lessons',
      cta: 'Begin',
      color: 'bg-blue-500'
    },
    {
      title: 'Puzzles',
      description: 'Sharpen tactics with themed sets.',
      icon: <Puzzle className="h-6 w-6 text-white" />,
      to: '/puzzles',
      cta: 'Solve',
      color: 'bg-green-500'
    },
    {
      title: 'vs Computer',
      description: 'Practice games at your level.',
      icon: <Monitor className="h-6 w-6 text-white" />,
      to: '/play',
      cta: 'Play',
      color: 'bg-purple-500'
    },
    {
      title: 'Leaderboard',
      description: 'See top players and rankings.',
      icon: <Trophy className="h-6 w-6 text-white" />,
      to: '/leaderboard',
      cta: 'View',
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="text-6xl mb-4">♛</div>
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Welcome to Chess Academy!
        </h1>
        <p className="text-lg text-muted-foreground mb-6">
          Ready to improve your chess skills today? 🚀
        </p>
        <Button size="lg" asChild>
          <Link to="/lessons">Start Course</Link>
        </Button>
      </div>

      {/* Dashboard Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {dashboardCards.map((card) => (
          <DashboardCard
            key={card.title}
            title={card.title}
            description={card.description}
            icon={card.icon}
            to={card.to}
            cta={card.cta}
            color={card.color}
          />
        ))}
      </div>

      {/* Progress Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ProgressCard
          title="Lessons Completed"
          value={0}
          subtitle="Start your first lesson"
          progress={0}
          color="text-blue-600"
        />
        
        <ProgressCard
          title="Puzzles Solved"
          value={0}
          subtitle="Tactical problems solved"
          progress={0}
          color="text-green-600"
        />
        
        <ProgressCard
          title="Current Rating"
          value={1200}
          subtitle="Keep playing to improve"
          color="text-purple-600"
        />
      </div>
    </div>
  );
};

export default SimpleDashboard;