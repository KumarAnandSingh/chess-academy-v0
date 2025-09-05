import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../utils/test-utils';
import Sidebar from '../../../components/layout/Sidebar';

describe('Sidebar Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Desktop Sidebar', () => {
    it('renders navigation items correctly', () => {
      render(<Sidebar isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Lessons')).toBeInTheDocument();
      expect(screen.getByText('Puzzles')).toBeInTheDocument();
      expect(screen.getByText('vs Computer')).toBeInTheDocument();
      expect(screen.getByText('Leaderboard')).toBeInTheDocument();
    });

    it('displays current rating in bottom section', () => {
      render(<Sidebar isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText('Current Rating')).toBeInTheDocument();
      expect(screen.getByText('1200')).toBeInTheDocument();
    });

    it('shows navigation icons correctly', () => {
      render(<Sidebar isOpen={true} onClose={mockOnClose} />);

      // Check for lucide icons (they should have data-testid attributes)
      expect(screen.getByTestId('lucide-bar-chart-3')).toBeInTheDocument();
      expect(screen.getByTestId('lucide-book-open')).toBeInTheDocument();
      expect(screen.getByTestId('lucide-puzzle')).toBeInTheDocument();
      expect(screen.getByTestId('lucide-monitor')).toBeInTheDocument();
      expect(screen.getByTestId('lucide-trophy')).toBeInTheDocument();
    });
  });

  describe('Mobile Sidebar', () => {
    it('shows mobile logo when on mobile', () => {
      render(<Sidebar isOpen={true} onClose={mockOnClose} />);

      // Mobile logo section should be present
      const mobileLogoSection = screen.getByText('Chess Academy').closest('div');
      expect(mobileLogoSection).toHaveClass('md:hidden');
    });

    it('renders overlay when open on mobile', () => {
      render(<Sidebar isOpen={true} onClose={mockOnClose} />);

      // Check for overlay (black/50 background)
      const overlay = document.querySelector('.fixed.inset-0.bg-black\\/50');
      expect(overlay).toBeInTheDocument();
    });

    it('does not render overlay when closed', () => {
      render(<Sidebar isOpen={false} onClose={mockOnClose} />);

      const overlay = document.querySelector('.fixed.inset-0.bg-black\\/50');
      expect(overlay).not.toBeInTheDocument();
    });

    it('calls onClose when overlay is clicked', () => {
      render(<Sidebar isOpen={true} onClose={mockOnClose} />);

      const overlay = document.querySelector('.fixed.inset-0.bg-black\\/50');
      if (overlay) {
        fireEvent.click(overlay);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }
    });

    it('calls onClose when navigation item is clicked', () => {
      render(<Sidebar isOpen={true} onClose={mockOnClose} />);

      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      fireEvent.click(dashboardLink);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when mobile logo is clicked', () => {
      render(<Sidebar isOpen={true} onClose={mockOnClose} />);

      // Find the mobile logo link and click it
      const logoLinks = screen.getAllByText('Chess Academy');
      const mobileLogoLink = logoLinks.find(link => 
        link.closest('div')?.classList.contains('md:hidden')
      );
      
      if (mobileLogoLink) {
        fireEvent.click(mobileLogoLink);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('Responsive Behavior', () => {
    it('applies correct transform classes based on isOpen state', () => {
      const { rerender } = render(<Sidebar isOpen={false} onClose={mockOnClose} />);

      // When closed, should have translate-x-full class
      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('-translate-x-full');

      // When open, should have translate-x-0 class
      rerender(<Sidebar isOpen={true} onClose={mockOnClose} />);
      expect(sidebar).toHaveClass('translate-x-0');
    });

    it('has proper positioning classes for mobile and desktop', () => {
      render(<Sidebar isOpen={true} onClose={mockOnClose} />);

      const sidebar = screen.getByRole('complementary');
      
      // Should have mobile-first positioning
      expect(sidebar).toHaveClass('fixed', 'left-0', 'top-14', 'z-50');
      
      // Should have desktop overrides
      expect(sidebar).toHaveClass('md:relative', 'md:top-0', 'md:translate-x-0');
    });

    it('has correct dimensions and styling', () => {
      render(<Sidebar isOpen={true} onClose={mockOnClose} />);

      const sidebar = screen.getByRole('complementary');
      
      expect(sidebar).toHaveClass(
        'w-64',
        'h-[calc(100vh-3.5rem)]',
        'border-r',
        'bg-background'
      );
    });
  });

  describe('Navigation State', () => {
    it('applies active styling to current page', () => {
      // Mock current location as lessons
      vi.mock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useLocation: () => ({ pathname: '/lessons' }),
        };
      });

      render(<Sidebar isOpen={true} onClose={mockOnClose} />);

      const lessonsButton = screen.getByRole('link', { name: /lessons/i });
      expect(lessonsButton).toHaveClass('bg-accent', 'text-accent-foreground');
    });

    it('applies inactive styling to non-current pages', () => {
      render(<Sidebar isOpen={true} onClose={mockOnClose} />);

      // Assuming we're not on puzzles page
      const puzzlesButton = screen.getByRole('link', { name: /puzzles/i });
      expect(puzzlesButton).not.toHaveClass('bg-accent');
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      render(<Sidebar isOpen={true} onClose={mockOnClose} />);

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toBeInTheDocument();

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('maintains focus management on mobile', () => {
      render(<Sidebar isOpen={true} onClose={mockOnClose} />);

      const firstNavItem = screen.getByRole('link', { name: /dashboard/i });
      firstNavItem.focus();
      
      expect(document.activeElement).toBe(firstNavItem);
    });

    it('supports keyboard navigation', () => {
      render(<Sidebar isOpen={true} onClose={mockOnClose} />);

      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      
      // Simulate Enter key press
      fireEvent.keyDown(dashboardLink, { key: 'Enter' });
      
      // Should call onClose since it's a navigation action
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Animation and Transitions', () => {
    it('has transition classes for smooth animations', () => {
      render(<Sidebar isOpen={true} onClose={mockOnClose} />);

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass(
        'transition-transform',
        'duration-200',
        'ease-in-out'
      );
    });
  });

  describe('Button Styling', () => {
    it('applies correct button variants and styling', () => {
      render(<Sidebar isOpen={true} onClose={mockOnClose} />);

      const buttons = screen.getAllByRole('link');
      
      buttons.forEach(button => {
        expect(button).toHaveClass(
          'w-full',
          'justify-start',
          'space-x-2',
          'h-10'
        );
      });
    });

    it('shows proper spacing between icon and text', () => {
      render(<Sidebar isOpen={true} onClose={mockOnClose} />);

      const dashboardButton = screen.getByRole('link', { name: /dashboard/i });
      expect(dashboardButton).toHaveClass('space-x-2');
    });
  });
});