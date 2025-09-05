import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../utils/test-utils';
import Header from '../../../components/layout/Header';
import { useAuthStore } from '../../../stores/authStore';

// Mock the auth store
vi.mock('../../../stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

const mockUseAuthStore = useAuthStore as vi.MockedFunction<typeof useAuthStore>;

describe('Header Component', () => {
  const mockOnMobileMenuToggle = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthStore.mockReturnValue({
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
    });
  });

  it('renders header with logo and navigation', () => {
    render(
      <Header 
        onMobileMenuToggle={mockOnMobileMenuToggle}
        isMobileMenuOpen={false}
      />
    );

    // Check logo presence
    expect(screen.getByText('Chess Academy')).toBeInTheDocument();
    expect(screen.getByText('CA')).toBeInTheDocument();

    // Check navigation items
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Lessons')).toBeInTheDocument();
    expect(screen.getByText('Puzzles')).toBeInTheDocument();
    expect(screen.getByText('vs Computer')).toBeInTheDocument();
    expect(screen.getByText('Leaderboard')).toBeInTheDocument();
  });

  it('shows mobile menu toggle button on small screens', () => {
    render(
      <Header 
        onMobileMenuToggle={mockOnMobileMenuToggle}
        isMobileMenuOpen={false}
      />
    );

    const mobileMenuButton = screen.getByText('Toggle menu');
    expect(mobileMenuButton.closest('button')).toBeInTheDocument();
  });

  it('calls onMobileMenuToggle when mobile menu button is clicked', () => {
    render(
      <Header 
        onMobileMenuToggle={mockOnMobileMenuToggle}
        isMobileMenuOpen={false}
      />
    );

    const mobileMenuButton = screen.getByText('Toggle menu').closest('button');
    fireEvent.click(mobileMenuButton!);
    
    expect(mockOnMobileMenuToggle).toHaveBeenCalledTimes(1);
  });

  it('displays correct icon based on mobile menu state', () => {
    const { rerender } = render(
      <Header 
        onMobileMenuToggle={mockOnMobileMenuToggle}
        isMobileMenuOpen={false}
      />
    );

    // Initially shows Menu icon (hamburger) - look for specific svg class
    expect(document.querySelector('.lucide-menu')).toBeInTheDocument();

    // Rerender with menu open
    rerender(
      <Header 
        onMobileMenuToggle={mockOnMobileMenuToggle}
        isMobileMenuOpen={true}
      />
    );

    // Should show X icon when menu is open
    expect(document.querySelector('.lucide-x')).toBeInTheDocument();
  });

  it('displays user information in profile dropdown', async () => {
    render(
      <Header 
        onMobileMenuToggle={mockOnMobileMenuToggle}
        isMobileMenuOpen={false}
      />
    );

    // Click profile button
    const profileButton = screen.getByText('Profile menu').closest('button');
    fireEvent.click(profileButton);

    // Check dropdown content
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('Rating: 1200')).toBeInTheDocument();
    });
  });

  it('renders profile links in dropdown menu', async () => {
    render(
      <Header 
        onMobileMenuToggle={mockOnMobileMenuToggle}
        isMobileMenuOpen={false}
      />
    );

    // Click profile button
    const profileButton = screen.getByText('Profile menu').closest('button');
    fireEvent.click(profileButton);

    // Check dropdown links
    await waitFor(() => {
      const profileLink = screen.getByRole('menuitem', { name: /profile/i });
      const settingsLink = screen.getByRole('menuitem', { name: /settings/i });
      
      expect(profileLink).toBeInTheDocument();
      expect(settingsLink).toBeInTheDocument();
    });
  });

  it('displays Demo Mode badge', () => {
    render(
      <Header 
        onMobileMenuToggle={mockOnMobileMenuToggle}
        isMobileMenuOpen={false}
      />
    );

    expect(screen.getByText('Demo Mode')).toBeInTheDocument();
  });

  it('handles guest user correctly', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <Header 
        onMobileMenuToggle={mockOnMobileMenuToggle}
        isMobileMenuOpen={false}
      />
    );

    const profileButton = screen.getByText('Profile menu').closest('button');
    fireEvent.click(profileButton);

    expect(screen.getByText('Guest')).toBeInTheDocument();
  });

  it('applies active navigation styling correctly', () => {
    // Mock current location as dashboard
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useLocation: () => ({ pathname: '/dashboard' }),
      };
    });

    render(
      <Header 
        onMobileMenuToggle={mockOnMobileMenuToggle}
        isMobileMenuOpen={false}
      />
    );

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    expect(dashboardLink).toHaveClass('text-foreground');
  });

  it('has proper accessibility attributes', () => {
    render(
      <Header 
        onMobileMenuToggle={mockOnMobileMenuToggle}
        isMobileMenuOpen={false}
      />
    );

    // Check ARIA labels
    expect(screen.getByLabelText('Toggle menu')).toBeInTheDocument();
    expect(screen.getByLabelText('Profile menu')).toBeInTheDocument();
    
    // Check semantic structure
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
    
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
  });

  it('keyboard navigation works properly', () => {
    render(
      <Header 
        onMobileMenuToggle={mockOnMobileMenuToggle}
        isMobileMenuOpen={false}
      />
    );

    const mobileMenuButton = screen.getByLabelText('Toggle menu');
    const profileButton = screen.getByText('Profile menu').closest('button');

    // Tab navigation should work
    mobileMenuButton.focus();
    expect(document.activeElement).toBe(mobileMenuButton);

    // Enter/Space should trigger buttons
    fireEvent.keyDown(mobileMenuButton, { key: 'Enter' });
    expect(mockOnMobileMenuToggle).toHaveBeenCalled();
  });

  it('responsive text displays correctly', () => {
    render(
      <Header 
        onMobileMenuToggle={mockOnMobileMenuToggle}
        isMobileMenuOpen={false}
      />
    );

    // Full text visible on larger screens
    const fullLogoText = screen.getByText('Chess Academy');
    expect(fullLogoText).toHaveClass('hidden', 'sm:inline-block');

    // Abbreviated text visible on small screens
    const shortLogoText = screen.getByText('CA');
    expect(shortLogoText).toHaveClass('sm:hidden');
  });
});