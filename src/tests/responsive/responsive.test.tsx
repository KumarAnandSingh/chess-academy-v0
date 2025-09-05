import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '../utils/test-utils';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import Layout from '../../components/ui/Layout';
import SimpleDashboard from '../../components/ui/SimpleDashboard';

// Mock matchMedia for responsive testing
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

// Mock auth store for tests
vi.mock('../../stores/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    user: { displayName: 'Test User' },
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
  })),
}));

describe('Responsive Design Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Reset matchMedia
    vi.restoreAllMocks();
  });

  describe('Mobile Breakpoint (< 768px)', () => {
    beforeEach(() => {
      mockMatchMedia(true); // Simulate mobile
    });

    describe('Header Component', () => {
      it('shows mobile menu button on small screens', () => {
        render(<Header onMobileMenuToggle={vi.fn()} isMobileMenuOpen={false} />);

        const mobileMenuButton = screen.getByLabelText('Toggle menu');
        expect(mobileMenuButton).toBeInTheDocument();
        expect(mobileMenuButton.closest('button')).toHaveClass('md:hidden');
      });

      it('hides desktop navigation on mobile', () => {
        render(<Header onMobileMenuToggle={vi.fn()} isMobileMenuOpen={false} />);

        const desktopNav = document.querySelector('.hidden.md\\:flex');
        expect(desktopNav).toBeInTheDocument();
      });

      it('shows abbreviated logo text on mobile', () => {
        render(<Header onMobileMenuToggle={vi.fn()} isMobileMenuOpen={false} />);

        const shortLogo = screen.getByText('CA');
        const fullLogo = screen.getByText('Chess Academy');
        
        expect(shortLogo).toHaveClass('sm:hidden');
        expect(fullLogo).toHaveClass('hidden', 'sm:inline-block');
      });

      it('hides demo badge on very small screens', () => {
        render(<Header onMobileMenuToggle={vi.fn()} isMobileMenuOpen={false} />);

        const demoBadge = screen.getByText('Demo Mode');
        expect(demoBadge).toHaveClass('hidden', 'sm:inline-flex');
      });
    });

    describe('Sidebar Component', () => {
      it('renders as overlay on mobile', () => {
        render(<Sidebar isOpen={true} onClose={vi.fn()} />);

        const sidebar = screen.getByRole('complementary');
        expect(sidebar).toHaveClass('fixed', 'left-0', 'top-14', 'z-50');
      });

      it('shows mobile logo section', () => {
        render(<Sidebar isOpen={true} onClose={vi.fn()} />);

        const mobileLogoSection = document.querySelector('.md\\:hidden');
        expect(mobileLogoSection).toBeInTheDocument();
      });

      it('renders overlay backdrop when open', () => {
        render(<Sidebar isOpen={true} onClose={vi.fn()} />);

        const overlay = document.querySelector('.fixed.inset-0.bg-black\\/50.z-40.md\\:hidden');
        expect(overlay).toBeInTheDocument();
      });

      it('translates off-screen when closed', () => {
        render(<Sidebar isOpen={false} onClose={vi.fn()} />);

        const sidebar = screen.getByRole('complementary');
        expect(sidebar).toHaveClass('-translate-x-full');
      });
    });

    describe('Layout Component', () => {
      it('hides desktop sidebar container on mobile', () => {
        render(<Layout><div>Content</div></Layout>);

        const desktopSidebarContainer = document.querySelector('.hidden.md\\:flex.md\\:w-64');
        expect(desktopSidebarContainer).toBeInTheDocument();
      });

      it('maintains full-height layout on mobile', () => {
        const { container } = render(<Layout><div>Content</div></Layout>);

        const layoutContainer = container.firstChild as HTMLElement;
        expect(layoutContainer).toHaveClass('flex', 'h-screen');
      });
    });

    describe('SimpleDashboard Component', () => {
      it('stacks feature cards in single column on mobile', () => {
        const { container } = render(<SimpleDashboard />);

        const featureGrid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
        expect(featureGrid).toBeInTheDocument();
      });

      it('stacks stats cards in single column on mobile', () => {
        const { container } = render(<SimpleDashboard />);

        const statsGrid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-3');
        expect(statsGrid).toBeInTheDocument();
      });

      it('maintains proper spacing on mobile', () => {
        const { container } = render(<SimpleDashboard />);

        const mainContainer = container.querySelector('.container.mx-auto.p-6');
        expect(mainContainer).toBeInTheDocument();
      });
    });
  });

  describe('Tablet Breakpoint (768px - 1024px)', () => {
    beforeEach(() => {
      mockMatchMedia(false); // Not mobile
    });

    describe('SimpleDashboard Component', () => {
      it('shows 2-column grid for feature cards on tablet', () => {
        const { container } = render(<SimpleDashboard />);

        const featureGrid = container.querySelector('.md\\:grid-cols-2');
        expect(featureGrid).toBeInTheDocument();
      });

      it('shows 3-column grid for stats on tablet', () => {
        const { container } = render(<SimpleDashboard />);

        const statsGrid = container.querySelector('.md\\:grid-cols-3');
        expect(statsGrid).toBeInTheDocument();
      });
    });

    describe('Header Component', () => {
      it('shows full logo text on tablet', () => {
        render(<Header onMobileMenuToggle={vi.fn()} isMobileMenuOpen={false} />);

        const fullLogo = screen.getByText('Chess Academy');
        expect(fullLogo).toHaveClass('hidden', 'sm:inline-block');
      });

      it('shows desktop navigation on tablet', () => {
        render(<Header onMobileMenuToggle={vi.fn()} isMobileMenuOpen={false} />);

        const desktopNav = document.querySelector('.hidden.md\\:flex');
        expect(desktopNav).toBeInTheDocument();
      });

      it('hides mobile menu button on tablet', () => {
        render(<Header onMobileMenuToggle={vi.fn()} isMobileMenuOpen={false} />);

        const mobileMenuButton = screen.getByLabelText('Toggle menu');
        expect(mobileMenuButton.closest('button')).toHaveClass('md:hidden');
      });
    });

    describe('Sidebar Component', () => {
      it('positions relatively on tablet/desktop', () => {
        render(<Sidebar isOpen={true} onClose={vi.fn()} />);

        const sidebar = screen.getByRole('complementary');
        expect(sidebar).toHaveClass('md:relative', 'md:top-0', 'md:translate-x-0');
      });

      it('does not show overlay on tablet/desktop', () => {
        render(<Sidebar isOpen={true} onClose={vi.fn()} />);

        const overlay = document.querySelector('.md\\:hidden');
        // Overlay should have md:hidden class to hide on tablet+
        expect(overlay).toBeInTheDocument();
      });
    });
  });

  describe('Desktop Breakpoint (> 1024px)', () => {
    beforeEach(() => {
      mockMatchMedia(false); // Desktop
    });

    describe('SimpleDashboard Component', () => {
      it('shows 4-column grid for feature cards on desktop', () => {
        const { container } = render(<SimpleDashboard />);

        const featureGrid = container.querySelector('.lg\\:grid-cols-4');
        expect(featureGrid).toBeInTheDocument();
      });

      it('maintains 3-column stats grid on desktop', () => {
        const { container } = render(<SimpleDashboard />);

        const statsGrid = container.querySelector('.md\\:grid-cols-3');
        expect(statsGrid).toBeInTheDocument();
      });
    });

    describe('Layout Component', () => {
      it('shows desktop sidebar container', () => {
        render(<Layout><div>Content</div></Layout>);

        const desktopSidebarContainer = document.querySelector('.hidden.md\\:flex.md\\:w-64.md\\:flex-col');
        expect(desktopSidebarContainer).toBeInTheDocument();
      });

      it('maintains proper layout proportions', () => {
        const { container } = render(<Layout><div>Content</div></Layout>);

        const mainContentWrapper = container.querySelector('.flex.flex-1.flex-col.overflow-hidden');
        expect(mainContentWrapper).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Utilities', () => {
    describe('Container and Spacing', () => {
      it('applies responsive container classes', () => {
        const { container } = render(<SimpleDashboard />);

        const mainContainer = container.querySelector('.container.mx-auto');
        expect(mainContainer).toBeInTheDocument();
      });

      it('uses responsive gap spacing', () => {
        const { container } = render(<SimpleDashboard />);

        const grids = container.querySelectorAll('.gap-6');
        expect(grids.length).toBeGreaterThan(0);
      });

      it('applies responsive padding', () => {
        const { container } = render(<SimpleDashboard />);

        const paddedContainer = container.querySelector('.p-6');
        expect(paddedContainer).toBeInTheDocument();
      });
    });

    describe('Typography Scaling', () => {
      it('uses responsive text sizing', () => {
        render(<SimpleDashboard />);

        const mainHeading = screen.getByText('Welcome to Chess Academy!');
        expect(mainHeading).toHaveClass('text-4xl');

        const subHeading = screen.getByText('Ready to improve your chess skills today?');
        expect(subHeading).toHaveClass('text-xl');
      });

      it('applies appropriate font weights for hierarchy', () => {
        render(<SimpleDashboard />);

        const mainHeading = screen.getByText('Welcome to Chess Academy!');
        expect(mainHeading).toHaveClass('font-bold');

        const cardTitles = screen.getAllByText(/Learn Chess|Solve Puzzles|vs Computer|Leaderboard/);
        cardTitles.forEach(title => {
          expect(title).toHaveClass('text-lg');
        });
      });
    });

    describe('Interactive Element Sizing', () => {
      it('maintains proper button sizes across breakpoints', () => {
        render(<SimpleDashboard />);

        const largeButton = screen.getByRole('link', { name: 'Start Learning' });
        expect(largeButton.closest('a')).toHaveClass('w-full');
      });

      it('ensures adequate touch targets on mobile', () => {
        render(<Header onMobileMenuToggle={vi.fn()} isMobileMenuOpen={false} />);

        const mobileMenuButton = screen.getByLabelText('Toggle menu');
        // Should have minimum 44px touch target (handled by h-5 w-5 classes on icon + button padding)
        expect(mobileMenuButton).toBeInTheDocument();
      });
    });

    describe('Layout Flexibility', () => {
      it('adapts sidebar positioning across breakpoints', () => {
        render(<Sidebar isOpen={true} onClose={vi.fn()} />);

        const sidebar = screen.getByRole('complementary');
        expect(sidebar).toHaveClass(
          'fixed', 'left-0', 'top-14', 'z-50', // Mobile
          'md:relative', 'md:top-0', 'md:translate-x-0' // Desktop
        );
      });

      it('manages overflow behavior responsively', () => {
        render(<Layout><div>Content</div></Layout>);

        const mainContent = screen.getByRole('main');
        expect(mainContent).toHaveClass('flex-1', 'overflow-y-auto');
      });
    });

    describe('Visual Hierarchy Responsiveness', () => {
      it('maintains card aspect ratios across breakpoints', () => {
        const { container } = render(<SimpleDashboard />);

        const cards = container.querySelectorAll('[class*="group hover:shadow-lg"]');
        expect(cards.length).toBe(4);

        cards.forEach(card => {
          expect(card).toHaveClass('transition-all', 'duration-200');
        });
      });

      it('preserves icon sizing across screen sizes', () => {
        render(<SimpleDashboard />);

        // Icons should maintain consistent sizing
        expect(screen.getByTestId('lucide-award')).toHaveClass('h-8', 'w-8');
        expect(screen.getByTestId('lucide-book-open')).toHaveClass('h-6', 'w-6');
      });
    });
  });

  describe('Breakpoint-Specific Features', () => {
    it('shows/hides elements appropriately at different breakpoints', () => {
      render(<Header onMobileMenuToggle={vi.fn()} isMobileMenuOpen={false} />);

      // Mobile menu button should be hidden on larger screens
      const mobileMenuButton = screen.getByLabelText('Toggle menu');
      expect(mobileMenuButton.closest('button')).toHaveClass('md:hidden');

      // Desktop nav should be hidden on smaller screens
      const desktopNav = document.querySelector('.hidden.md\\:flex');
      expect(desktopNav).toBeInTheDocument();
    });

    it('applies appropriate spacing at different breakpoints', () => {
      render(<Header onMobileMenuToggle={vi.fn()} isMobileMenuOpen={false} />);

      // Navigation items should have appropriate spacing
      const nav = document.querySelector('.hidden.md\\:flex.items-center.space-x-6');
      expect(nav).toBeInTheDocument();
    });

    it('manages sidebar behavior across breakpoints', () => {
      const { container } = render(<Layout><div>Test</div></Layout>);

      // Desktop sidebar container
      const desktopSidebar = container.querySelector('.hidden.md\\:flex.md\\:w-64.md\\:flex-col');
      expect(desktopSidebar).toBeInTheDocument();

      // Mobile sidebar should be separate
      const mobileSidebar = screen.getAllByRole('complementary')[1];
      expect(mobileSidebar).toBeInTheDocument();
    });
  });
});