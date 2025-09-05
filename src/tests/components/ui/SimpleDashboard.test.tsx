import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '../../utils/test-utils';
import SimpleDashboard from '../../../components/ui/SimpleDashboard';

describe('SimpleDashboard Component', () => {
  it('renders welcome header section correctly', () => {
    render(<SimpleDashboard />);

    // Check main heading and description
    expect(screen.getByText('Welcome to Chess Academy!')).toBeInTheDocument();
    expect(screen.getByText('Ready to improve your chess skills today?')).toBeInTheDocument();
    
    // Check for Award icon in welcome section
    expect(screen.getByTestId('lucide-award')).toBeInTheDocument();
    
    // Check "Start Learning" button in header
    const startLearningButtons = screen.getAllByRole('link', { name: /start learning/i });
    expect(startLearningButtons.length).toBeGreaterThan(0);
  });

  describe('Feature Cards Grid', () => {
    it('renders all four feature cards', () => {
      render(<SimpleDashboard />);

      // Check all card titles
      expect(screen.getByText('Learn Chess')).toBeInTheDocument();
      expect(screen.getByText('Solve Puzzles')).toBeInTheDocument();
      expect(screen.getByText('vs Computer')).toBeInTheDocument();
      expect(screen.getByText('Leaderboard')).toBeInTheDocument();
    });

    it('displays correct descriptions for each card', () => {
      render(<SimpleDashboard />);

      expect(screen.getByText('Start with basics or improve your strategy')).toBeInTheDocument();
      expect(screen.getByText('Practice tactics and combinations')).toBeInTheDocument();
      expect(screen.getByText('Play against AI opponents')).toBeInTheDocument();
      expect(screen.getByText('See top players and rankings')).toBeInTheDocument();
    });

    it('displays correct icons for each feature card', () => {
      render(<SimpleDashboard />);

      expect(screen.getByTestId('lucide-book-open')).toBeInTheDocument();
      expect(screen.getByTestId('lucide-puzzle')).toBeInTheDocument();
      expect(screen.getByTestId('lucide-monitor')).toBeInTheDocument();
      expect(screen.getByTestId('lucide-trophy')).toBeInTheDocument();
    });

    it('renders correct action buttons with proper styling', () => {
      render(<SimpleDashboard />);

      // Learn Chess - default button
      const learnButton = screen.getByRole('link', { name: 'Start Learning' });
      expect(learnButton).toBeInTheDocument();
      expect(learnButton).toHaveAttribute('href', '/lessons');

      // Puzzles - outline button
      const puzzlesButton = screen.getByRole('link', { name: 'Start Solving' });
      expect(puzzlesButton).toBeInTheDocument();
      expect(puzzlesButton).toHaveAttribute('href', '/puzzles');

      // vs Computer - secondary button
      const playButton = screen.getByRole('link', { name: 'Play Now' });
      expect(playButton).toBeInTheDocument();
      expect(playButton).toHaveAttribute('href', '/play');

      // Leaderboard - outline button
      const leaderboardButton = screen.getByRole('link', { name: 'View Rankings' });
      expect(leaderboardButton).toBeInTheDocument();
      expect(leaderboardButton).toHaveAttribute('href', '/leaderboard');
    });

    it('applies hover effects to cards', () => {
      render(<SimpleDashboard />);

      const cards = screen.getAllByRole('link').filter(link => 
        link.closest('[class*="group hover:shadow-lg"]')
      );
      
      // Should have hover transition classes
      cards.forEach(card => {
        const cardElement = card.closest('[class*="group hover:shadow-lg"]');
        expect(cardElement).toHaveClass('group', 'hover:shadow-lg', 'transition-all', 'duration-200', 'cursor-pointer');
      });
    });

    it('displays correct color themes for each card icon', () => {
      render(<SimpleDashboard />);

      // Check for color-coded icon containers
      const blueContainer = document.querySelector('.bg-blue-100');
      const greenContainer = document.querySelector('.bg-green-100');
      const purpleContainer = document.querySelector('.bg-purple-100');
      const yellowContainer = document.querySelector('.bg-yellow-100');

      expect(blueContainer).toBeInTheDocument();
      expect(greenContainer).toBeInTheDocument();
      expect(purpleContainer).toBeInTheDocument();
      expect(yellowContainer).toBeInTheDocument();
    });
  });

  describe('Stats Section', () => {
    it('renders all three stat cards', () => {
      render(<SimpleDashboard />);

      expect(screen.getByText('Lessons Completed')).toBeInTheDocument();
      expect(screen.getByText('Puzzles Solved')).toBeInTheDocument();
      expect(screen.getByText('Current Rating')).toBeInTheDocument();
    });

    it('displays correct initial values', () => {
      render(<SimpleDashboard />);

      // Check for the "0" values in lessons and puzzles
      const zeroValues = screen.getAllByText('0');
      expect(zeroValues.length).toBeGreaterThanOrEqual(2);

      // Check current rating
      expect(screen.getByText('1200')).toBeInTheDocument();
      expect(screen.getByText('Beginner')).toBeInTheDocument();
      expect(screen.getByText('+0 this week')).toBeInTheDocument();
    });

    it('displays progress indicators correctly', () => {
      render(<SimpleDashboard />);

      // Check for progress labels
      expect(screen.getByText('Progress')).toBeInTheDocument();
      expect(screen.getByText('Accuracy')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
      expect(screen.getByText('--')).toBeInTheDocument();
    });

    it('renders stat card icons', () => {
      render(<SimpleDashboard />);

      // Should have icons for each stat card (some already checked above)
      const bookOpenIcons = screen.getAllByTestId('lucide-book-open');
      const puzzleIcons = screen.getAllByTestId('lucide-puzzle');
      const trendingUpIcon = screen.getByTestId('lucide-trending-up');

      expect(bookOpenIcons.length).toBeGreaterThanOrEqual(2); // One in card, one in stat
      expect(puzzleIcons.length).toBeGreaterThanOrEqual(2); // One in card, one in stat  
      expect(trendingUpIcon).toBeInTheDocument();
    });

    it('renders progress bars with correct initial values', () => {
      render(<SimpleDashboard />);

      // Progress bars should be rendered (even if at 0%)
      const progressBars = document.querySelectorAll('[role="progressbar"]');
      expect(progressBars.length).toBeGreaterThanOrEqual(2);
    });

    it('displays rating badge correctly', () => {
      render(<SimpleDashboard />);

      const beginnerBadge = screen.getByText('Beginner');
      expect(beginnerBadge).toBeInTheDocument();
      
      // Badge should have secondary variant styling
      expect(beginnerBadge.closest('[class*="secondary"]')).toBeInTheDocument();
    });
  });

  describe('Responsive Layout', () => {
    it('applies correct grid classes for responsive design', () => {
      const { container } = render(<SimpleDashboard />);

      // Feature cards grid
      const featureGrid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
      expect(featureGrid).toBeInTheDocument();

      // Stats grid  
      const statsGrid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-3');
      expect(statsGrid).toBeInTheDocument();
    });

    it('applies proper spacing and padding', () => {
      const { container } = render(<SimpleDashboard />);

      const mainContainer = container.querySelector('.container.mx-auto.p-6.space-y-8');
      expect(mainContainer).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<SimpleDashboard />);

      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Welcome to Chess Academy!');
    });

    it('provides meaningful link text for all navigation buttons', () => {
      render(<SimpleDashboard />);

      const links = screen.getAllByRole('link');
      
      links.forEach(link => {
        expect(link).toHaveTextContent(/start learning|start solving|play now|view rankings/i);
      });
    });

    it('maintains proper color contrast in card designs', () => {
      render(<SimpleDashboard />);

      // Check for proper text contrast classes
      const cardTitles = screen.getAllByText(/Learn Chess|Solve Puzzles|vs Computer|Leaderboard/);
      cardTitles.forEach(title => {
        // Text should have appropriate sizing and weight for readability
        expect(title).toHaveClass('text-lg');
      });
    });

    it('uses semantic elements appropriately', () => {
      render(<SimpleDashboard />);

      // Main content should be in proper containers
      expect(screen.getByText('Welcome to Chess Academy!')).toBeInTheDocument();
      
      // Stats should be in proper card structures
      const statCards = screen.getAllByText(/Lessons Completed|Puzzles Solved|Current Rating/);
      expect(statCards).toHaveLength(3);
    });
  });

  describe('Interaction Behavior', () => {
    it('handles card hover states correctly', () => {
      render(<SimpleDashboard />);

      const cards = document.querySelectorAll('[class*="group hover:shadow-lg"]');
      expect(cards.length).toBe(4); // Four feature cards

      cards.forEach(card => {
        expect(card).toHaveClass('cursor-pointer');
        expect(card).toHaveClass('transition-all');
      });
    });

    it('handles button focus states', () => {
      render(<SimpleDashboard />);

      const startLearningButton = screen.getByRole('link', { name: 'Start Learning' });
      startLearningButton.focus();
      
      expect(document.activeElement).toBe(startLearningButton);
    });
  });

  describe('Content Structure', () => {
    it('organizes content in logical sections', () => {
      const { container } = render(<SimpleDashboard />);

      // Welcome section
      expect(container.querySelector('.text-center.space-y-4')).toBeInTheDocument();
      
      // Feature cards section
      expect(container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4')).toBeInTheDocument();
      
      // Stats section
      expect(container.querySelector('.grid.grid-cols-1.md\\:grid-cols-3')).toBeInTheDocument();
    });

    it('maintains consistent spacing throughout', () => {
      const { container } = render(<SimpleDashboard />);

      const mainContainer = container.querySelector('.space-y-8');
      expect(mainContainer).toBeInTheDocument();

      const gridSections = container.querySelectorAll('.gap-6');
      expect(gridSections.length).toBe(2); // Feature cards and stats grids
    });
  });
});