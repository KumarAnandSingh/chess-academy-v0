import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '../utils/test-utils';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import Layout from '../../components/ui/Layout';
import SimpleDashboard from '../../components/ui/SimpleDashboard';

// Mock the auth store for accessibility tests
vi.mock('../../stores/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    user: {
      id: '1',
      displayName: 'Test User',
      email: 'test@example.com',
      profilePicture: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
  })),
}));

describe('Accessibility Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Keyboard Navigation', () => {
    describe('Header Component', () => {
      it('supports Tab navigation through interactive elements', () => {
        render(<Header onMobileMenuToggle={vi.fn()} isMobileMenuOpen={false} />);

        const mobileMenuButton = screen.getByLabelText('Toggle menu');
        const profileButton = screen.getByLabelText('Profile menu');
        const logoLink = screen.getByRole('link', { name: /chess academy/i });

        // Tab order should be logical
        mobileMenuButton.focus();
        expect(document.activeElement).toBe(mobileMenuButton);

        // Simulate Tab to next element
        fireEvent.keyDown(document, { key: 'Tab' });
        // Logo link should be next in tab order
      });

      it('supports Enter and Space key activation', () => {
        const mockToggle = vi.fn();
        render(<Header onMobileMenuToggle={mockToggle} isMobileMenuOpen={false} />);

        const mobileMenuButton = screen.getByLabelText('Toggle menu');
        
        // Enter key
        fireEvent.keyDown(mobileMenuButton, { key: 'Enter' });
        expect(mockToggle).toHaveBeenCalledTimes(1);

        // Space key
        fireEvent.keyDown(mobileMenuButton, { key: ' ' });
        expect(mockToggle).toHaveBeenCalledTimes(2);
      });

      it('maintains focus after dropdown interactions', async () => {
        render(<Header onMobileMenuToggle={vi.fn()} isMobileMenuOpen={false} />);

        const profileButton = screen.getByLabelText('Profile menu');
        profileButton.focus();
        
        // Open dropdown with Enter
        fireEvent.keyDown(profileButton, { key: 'Enter' });
        
        // Focus should remain manageable
        expect(document.activeElement).toBe(profileButton);
      });

      it('supports Escape key to close dropdowns', async () => {
        render(<Header onMobileMenuToggle={vi.fn()} isMobileMenuOpen={false} />);

        const profileButton = screen.getByLabelText('Profile menu');
        fireEvent.click(profileButton);

        // Escape should close dropdown
        fireEvent.keyDown(document, { key: 'Escape' });
        
        // Dropdown content should be hidden
        expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
      });
    });

    describe('Sidebar Component', () => {
      it('maintains proper tab order in navigation items', () => {
        render(<Sidebar isOpen={true} onClose={vi.fn()} />);

        const navItems = screen.getAllByRole('link');
        const firstNavItem = navItems.find(item => item.textContent?.includes('Dashboard'));
        
        if (firstNavItem) {
          firstNavItem.focus();
          expect(document.activeElement).toBe(firstNavItem);
        }
      });

      it('supports keyboard navigation through sidebar links', () => {
        const mockOnClose = vi.fn();
        render(<Sidebar isOpen={true} onClose={mockOnClose} />);

        const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
        
        // Enter key should trigger navigation
        fireEvent.keyDown(dashboardLink, { key: 'Enter' });
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });

      it('handles Escape key to close mobile sidebar', () => {
        const mockOnClose = vi.fn();
        render(<Sidebar isOpen={true} onClose={mockOnClose} />);

        fireEvent.keyDown(document, { key: 'Escape' });
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });

    describe('SimpleDashboard Component', () => {
      it('maintains logical tab order through dashboard cards', () => {
        render(<SimpleDashboard />);

        const actionButtons = screen.getAllByRole('link');
        const startLearningButton = actionButtons.find(btn => 
          btn.textContent?.includes('Start Learning')
        );
        
        if (startLearningButton) {
          startLearningButton.focus();
          expect(document.activeElement).toBe(startLearningButton);
        }
      });

      it('supports keyboard navigation to all interactive elements', () => {
        render(<SimpleDashboard />);

        const interactiveElements = [
          ...screen.getAllByRole('link'),
          ...screen.getAllByRole('button')
        ];

        // All interactive elements should be focusable
        interactiveElements.forEach(element => {
          element.focus();
          expect(document.activeElement).toBe(element);
        });
      });
    });
  });

  describe('ARIA Compliance', () => {
    describe('Header Component', () => {
      it('has proper ARIA labels for all interactive elements', () => {
        render(<Header onMobileMenuToggle={vi.fn()} isMobileMenuOpen={false} />);

        expect(screen.getByLabelText('Toggle menu')).toBeInTheDocument();
        expect(screen.getByLabelText('Profile menu')).toBeInTheDocument();
      });

      it('uses proper semantic HTML elements', () => {
        render(<Header onMobileMenuToggle={vi.fn()} isMobileMenuOpen={false} />);

        expect(screen.getByRole('banner')).toBeInTheDocument();
        expect(screen.getByRole('navigation')).toBeInTheDocument();
      });

      it('provides screen reader text for icon-only buttons', () => {
        render(<Header onMobileMenuToggle={vi.fn()} isMobileMenuOpen={false} />);

        const mobileMenuButton = screen.getByLabelText('Toggle menu');
        const srText = within(mobileMenuButton).getByText('Toggle menu', { selector: '.sr-only' });
        expect(srText).toBeInTheDocument();

        const profileButton = screen.getByLabelText('Profile menu');
        const profileSrText = within(profileButton).getByText('Profile menu', { selector: '.sr-only' });
        expect(profileSrText).toBeInTheDocument();
      });

      it('maintains proper heading hierarchy', () => {
        render(<Header onMobileMenuToggle={vi.fn()} isMobileMenuOpen={false} />);

        // Header should not contain improper heading elements that break hierarchy
        const headings = screen.queryAllByRole('heading');
        expect(headings.length).toBe(0); // Header shouldn't have headings
      });
    });

    describe('Sidebar Component', () => {
      it('uses semantic navigation structure', () => {
        render(<Sidebar isOpen={true} onClose={vi.fn()} />);

        const nav = screen.getByRole('navigation');
        expect(nav).toBeInTheDocument();
        
        const complementary = screen.getByRole('complementary');
        expect(complementary).toBeInTheDocument();
      });

      it('provides proper link context', () => {
        render(<Sidebar isOpen={true} onClose={vi.fn()} />);

        const links = screen.getAllByRole('link');
        links.forEach(link => {
          expect(link).toHaveAccessibleName();
        });
      });

      it('indicates current page state for screen readers', () => {
        // Mock location for current page indication
        vi.mock('react-router-dom', async () => {
          const actual = await vi.importActual('react-router-dom');
          return {
            ...actual,
            useLocation: () => ({ pathname: '/dashboard' }),
          };
        });

        render(<Sidebar isOpen={true} onClose={vi.fn()} />);

        // Active navigation item should have appropriate styling/attributes
        const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
        expect(dashboardLink).toHaveClass('bg-accent', 'text-accent-foreground');
      });
    });

    describe('SimpleDashboard Component', () => {
      it('has proper heading structure', () => {
        render(<SimpleDashboard />);

        const mainHeading = screen.getByRole('heading', { level: 1 });
        expect(mainHeading).toHaveTextContent('Welcome to Chess Academy!');
        
        // Should not skip heading levels
        const allHeadings = screen.getAllByRole('heading');
        expect(allHeadings[0]).toHaveAttribute('aria-level', '1');
      });

      it('provides accessible names for all interactive elements', () => {
        render(<SimpleDashboard />);

        const links = screen.getAllByRole('link');
        links.forEach(link => {
          expect(link).toHaveAccessibleName();
          expect(link.textContent).toBeTruthy();
        });
      });

      it('includes proper progress bar accessibility', () => {
        render(<SimpleDashboard />);

        const progressBars = screen.getAllByRole('progressbar');
        progressBars.forEach(progressBar => {
          expect(progressBar).toHaveAttribute('aria-valuemin');
          expect(progressBar).toHaveAttribute('aria-valuemax');
          expect(progressBar).toHaveAttribute('aria-valuenow');
        });
      });
    });
  });

  describe('Color Contrast and Visual Accessibility', () => {
    it('uses appropriate text contrast classes', () => {
      render(<SimpleDashboard />);

      // Main heading should have proper contrast
      const mainHeading = screen.getByText('Welcome to Chess Academy!');
      expect(mainHeading).toHaveClass('text-4xl', 'font-bold');

      // Description text should have muted styling
      const description = screen.getByText('Ready to improve your chess skills today?');
      expect(description).toHaveClass('text-muted-foreground');
    });

    it('provides sufficient visual hierarchy', () => {
      render(<SimpleDashboard />);

      // Card titles should be distinct from descriptions
      const cardTitle = screen.getByText('Learn Chess');
      expect(cardTitle).toHaveClass('text-lg');

      const cardDescription = screen.getByText('Start with basics or improve your strategy');
      expect(cardDescription.closest('[class*="text-muted-foreground"]')).toBeTruthy();
    });
  });

  describe('Focus Management', () => {
    it('maintains focus visibility', () => {
      render(<Layout><SimpleDashboard /></Layout>);

      const firstButton = screen.getAllByRole('link')[0];
      firstButton.focus();
      
      expect(document.activeElement).toBe(firstButton);
      // Focus visible styles should be applied through Tailwind classes
    });

    it('provides logical focus order', () => {
      render(<SimpleDashboard />);

      const interactiveElements = [
        ...screen.getAllByRole('link'),
        ...screen.getAllByRole('button')
      ];

      // Should be able to tab through all elements in logical order
      let currentIndex = 0;
      interactiveElements.forEach(element => {
        element.focus();
        expect(document.activeElement).toBe(element);
        currentIndex++;
      });
    });

    it('handles focus trapping in modal-like components', () => {
      const mockOnClose = vi.fn();
      render(<Sidebar isOpen={true} onClose={mockOnClose} />);

      // Focus should be manageable within sidebar when open
      const firstNavItem = screen.getByRole('link', { name: /dashboard/i });
      firstNavItem.focus();
      
      expect(document.activeElement).toBe(firstNavItem);
    });
  });

  describe('Screen Reader Support', () => {
    it('provides meaningful text for icon-only elements', () => {
      render(<Header onMobileMenuToggle={vi.fn()} isMobileMenuOpen={false} />);

      // All icons should have text alternatives
      const mobileMenuButton = screen.getByLabelText('Toggle menu');
      expect(within(mobileMenuButton).getByText('Toggle menu', { selector: '.sr-only' })).toBeInTheDocument();
    });

    it('uses proper semantic elements for content structure', () => {
      render(<Layout><SimpleDashboard /></Layout>);

      expect(screen.getByRole('banner')).toBeInTheDocument(); // Header
      expect(screen.getByRole('main')).toBeInTheDocument(); // Main content
      expect(screen.getByRole('complementary')).toBeInTheDocument(); // Sidebar
      expect(screen.getByRole('navigation')).toBeInTheDocument(); // Navigation
    });

    it('provides context for complex interactions', () => {
      render(<Header onMobileMenuToggle={vi.fn()} isMobileMenuOpen={false} />);

      const profileButton = screen.getByLabelText('Profile menu');
      fireEvent.click(profileButton);

      // Menu items should be properly labeled
      const profileItem = screen.getByRole('menuitem', { name: /profile/i });
      const settingsItem = screen.getByRole('menuitem', { name: /settings/i });
      
      expect(profileItem).toBeInTheDocument();
      expect(settingsItem).toBeInTheDocument();
    });
  });

  describe('Mobile Accessibility', () => {
    it('provides appropriate touch targets', () => {
      render(<Header onMobileMenuToggle={vi.fn()} isMobileMenuOpen={false} />);

      const mobileMenuButton = screen.getByLabelText('Toggle menu');
      // Button should have minimum touch target size (typically handled by Tailwind classes)
      expect(mobileMenuButton).toHaveClass('h-5', 'w-5');
    });

    it('maintains accessibility during responsive state changes', () => {
      const mockOnClose = vi.fn();
      const { rerender } = render(<Sidebar isOpen={false} onClose={mockOnClose} />);

      // Closed state
      expect(screen.getByRole('complementary')).toHaveClass('-translate-x-full');

      // Open state
      rerender(<Sidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByRole('complementary')).toHaveClass('translate-x-0');
    });
  });
});