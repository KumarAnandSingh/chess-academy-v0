import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../utils/test-utils';
import Layout from '../../../components/ui/Layout';

// Mock child components to focus on Layout integration
vi.mock('../../../components/layout/Header', () => ({
  default: ({ onMobileMenuToggle, isMobileMenuOpen }: any) => (
    <header data-testid="mock-header">
      <button 
        data-testid="mobile-menu-toggle" 
        onClick={onMobileMenuToggle}
        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
      >
        {isMobileMenuOpen ? 'Close' : 'Menu'}
      </button>
    </header>
  )
}));

vi.mock('../../../components/layout/Sidebar', () => ({
  default: ({ isOpen, onClose }: any) => (
    <aside data-testid="mock-sidebar" className={isOpen ? 'open' : 'closed'}>
      <button data-testid="close-sidebar" onClick={onClose}>Close</button>
      Sidebar Content
    </aside>
  )
}));

describe('Layout Component', () => {
  const TestContent = () => <div data-testid="test-content">Test Content</div>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders layout structure correctly', () => {
    render(
      <Layout>
        <TestContent />
      </Layout>
    );

    // Check main layout structure
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    
    // Check for multiple sidebars (desktop and mobile)
    const sidebars = screen.getAllByTestId('mock-sidebar');
    expect(sidebars).toHaveLength(2);
  });

  it('renders children content in main element', () => {
    render(
      <Layout>
        <TestContent />
      </Layout>
    );

    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toContainElement(screen.getByTestId('test-content'));
  });

  describe('Mobile Menu State Management', () => {
    it('initializes with mobile menu closed', () => {
      render(
        <Layout>
          <TestContent />
        </Layout>
      );

      const menuToggle = screen.getByTestId('mobile-menu-toggle');
      expect(menuToggle).toHaveAttribute('aria-label', 'Open menu');
      expect(menuToggle).toHaveTextContent('Menu');
    });

    it('toggles mobile menu state when toggle button is clicked', () => {
      render(
        <Layout>
          <TestContent />
        </Layout>
      );

      const menuToggle = screen.getByTestId('mobile-menu-toggle');
      
      // Initially closed
      expect(menuToggle).toHaveAttribute('aria-label', 'Open menu');
      
      // Click to open
      fireEvent.click(menuToggle);
      expect(menuToggle).toHaveAttribute('aria-label', 'Close menu');
      expect(menuToggle).toHaveTextContent('Close');
      
      // Click to close
      fireEvent.click(menuToggle);
      expect(menuToggle).toHaveAttribute('aria-label', 'Open menu');
      expect(menuToggle).toHaveTextContent('Menu');
    });

    it('closes mobile menu when sidebar close is triggered', () => {
      render(
        <Layout>
          <TestContent />
        </Layout>
      );

      const menuToggle = screen.getByTestId('mobile-menu-toggle');
      const sidebarCloseButton = screen.getAllByTestId('close-sidebar')[1]; // Mobile sidebar
      
      // Open menu
      fireEvent.click(menuToggle);
      expect(menuToggle).toHaveAttribute('aria-label', 'Close menu');
      
      // Close via sidebar
      fireEvent.click(sidebarCloseButton);
      expect(menuToggle).toHaveAttribute('aria-label', 'Open menu');
    });
  });

  describe('Sidebar Integration', () => {
    it('passes correct props to desktop sidebar', () => {
      render(
        <Layout>
          <TestContent />
        </Layout>
      );

      const sidebars = screen.getAllByTestId('mock-sidebar');
      const desktopSidebar = sidebars[0];
      
      // Desktop sidebar should always be open
      expect(desktopSidebar).toHaveClass('open');
    });

    it('passes correct state to mobile sidebar', () => {
      render(
        <Layout>
          <TestContent />
        </Layout>
      );

      const sidebars = screen.getAllByTestId('mock-sidebar');
      const mobileSidebar = sidebars[1];
      const menuToggle = screen.getByTestId('mobile-menu-toggle');
      
      // Initially closed
      expect(mobileSidebar).toHaveClass('closed');
      
      // Open mobile menu
      fireEvent.click(menuToggle);
      expect(mobileSidebar).toHaveClass('open');
    });
  });

  describe('Layout Structure and Styling', () => {
    it('applies correct CSS classes to layout container', () => {
      const { container } = render(
        <Layout>
          <TestContent />
        </Layout>
      );

      const layoutContainer = container.firstChild as HTMLElement;
      expect(layoutContainer).toHaveClass('flex', 'h-screen', 'bg-background');
    });

    it('renders desktop sidebar container with correct styling', () => {
      render(
        <Layout>
          <TestContent />
        </Layout>
      );

      // Check for desktop sidebar container
      const desktopSidebarContainer = document.querySelector('.hidden.md\\:flex.md\\:w-64.md\\:flex-col');
      expect(desktopSidebarContainer).toBeInTheDocument();
    });

    it('renders main content area with correct styling', () => {
      render(
        <Layout>
          <TestContent />
        </Layout>
      );

      // Check for main content wrapper
      const mainContentWrapper = document.querySelector('.flex.flex-1.flex-col.overflow-hidden');
      expect(mainContentWrapper).toBeInTheDocument();

      const main = screen.getByRole('main');
      expect(main).toHaveClass('flex-1', 'overflow-y-auto');
    });
  });

  describe('Header Integration', () => {
    it('passes mobile menu toggle handler to header', () => {
      render(
        <Layout>
          <TestContent />
        </Layout>
      );

      const menuToggle = screen.getByTestId('mobile-menu-toggle');
      
      // Verify the toggle functionality works
      fireEvent.click(menuToggle);
      expect(menuToggle).toHaveTextContent('Close');
    });

    it('passes mobile menu state to header', () => {
      render(
        <Layout>
          <TestContent />
        </Layout>
      );

      const menuToggle = screen.getByTestId('mobile-menu-toggle');
      
      // Initially closed
      expect(menuToggle).toHaveAttribute('aria-label', 'Open menu');
      
      // After opening
      fireEvent.click(menuToggle);
      expect(menuToggle).toHaveAttribute('aria-label', 'Close menu');
    });
  });

  describe('Responsive Behavior', () => {
    it('handles multiple children correctly', () => {
      render(
        <Layout>
          <div>Child 1</div>
          <div>Child 2</div>
          <TestContent />
        </Layout>
      );

      const main = screen.getByRole('main');
      expect(main).toContainElement(screen.getByText('Child 1'));
      expect(main).toContainElement(screen.getByText('Child 2'));
      expect(main).toContainElement(screen.getByTestId('test-content'));
    });

    it('maintains scroll behavior in main content area', () => {
      render(
        <Layout>
          <TestContent />
        </Layout>
      );

      const main = screen.getByRole('main');
      expect(main).toHaveClass('overflow-y-auto');
    });
  });

  describe('Accessibility', () => {
    it('maintains proper semantic structure', () => {
      render(
        <Layout>
          <TestContent />
        </Layout>
      );

      // Should have main landmark
      expect(screen.getByRole('main')).toBeInTheDocument();
      
      // Should have header (from mocked header)
      expect(screen.getByTestId('mock-header')).toBeInTheDocument();
      
      // Should have complementary landmarks (sidebars)
      const sidebars = screen.getAllByTestId('mock-sidebar');
      expect(sidebars).toHaveLength(2);
    });

    it('manages focus properly during menu interactions', () => {
      render(
        <Layout>
          <TestContent />
        </Layout>
      );

      const menuToggle = screen.getByTestId('mobile-menu-toggle');
      
      // Focus the toggle button
      menuToggle.focus();
      expect(document.activeElement).toBe(menuToggle);
      
      // Opening menu should maintain focus
      fireEvent.click(menuToggle);
      expect(document.activeElement).toBe(menuToggle);
    });
  });

  describe('State Management', () => {
    it('maintains independent state for mobile menu', () => {
      render(
        <Layout>
          <TestContent />
        </Layout>
      );

      const menuToggle = screen.getByTestId('mobile-menu-toggle');
      const sidebars = screen.getAllByTestId('mock-sidebar');
      const mobileSidebar = sidebars[1];
      
      // Multiple toggles should work correctly
      fireEvent.click(menuToggle); // Open
      expect(mobileSidebar).toHaveClass('open');
      
      fireEvent.click(menuToggle); // Close
      expect(mobileSidebar).toHaveClass('closed');
      
      fireEvent.click(menuToggle); // Open again
      expect(mobileSidebar).toHaveClass('open');
    });
  });
});