import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../utils/test-utils';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';
import { Badge } from '../../../components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../../../components/ui/dropdown-menu';

describe('Shadcn/UI Components', () => {
  describe('Button Component', () => {
    it('renders with default variant and size', () => {
      render(<Button>Click me</Button>);
      
      const button = screen.getByRole('button', { name: 'Click me' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-primary', 'text-primary-foreground', 'h-10', 'px-4', 'py-2');
    });

    it('applies different variants correctly', () => {
      const { rerender } = render(<Button variant="outline">Outline</Button>);
      expect(screen.getByRole('button')).toHaveClass('border', 'border-input', 'bg-background');

      rerender(<Button variant="secondary">Secondary</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-secondary', 'text-secondary-foreground');

      rerender(<Button variant="ghost">Ghost</Button>);
      expect(screen.getByRole('button')).toHaveClass('hover:bg-accent', 'hover:text-accent-foreground');

      rerender(<Button variant="destructive">Destructive</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-destructive', 'text-destructive-foreground');
    });

    it('applies different sizes correctly', () => {
      const { rerender } = render(<Button size="sm">Small</Button>);
      expect(screen.getByRole('button')).toHaveClass('h-9', 'px-3');

      rerender(<Button size="lg">Large</Button>);
      expect(screen.getByRole('button')).toHaveClass('h-11', 'px-8');

      rerender(<Button size="icon">Icon</Button>);
      expect(screen.getByRole('button')).toHaveClass('h-10', 'w-10');
    });

    it('handles asChild prop correctly', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );

      const link = screen.getByRole('link', { name: 'Link Button' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
      expect(link).toHaveClass('bg-primary', 'text-primary-foreground');
    });

    it('supports disabled state', () => {
      render(<Button disabled>Disabled</Button>);
      
      const button = screen.getByRole('button', { name: 'Disabled' });
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
    });

    it('handles click events', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      
      const button = screen.getByRole('button', { name: 'Click me' });
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('has proper focus styles', () => {
      render(<Button>Focus me</Button>);
      
      const button = screen.getByRole('button', { name: 'Focus me' });
      expect(button).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-ring');
    });
  });

  describe('Card Components', () => {
    it('renders complete card structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card content goes here</p>
          </CardContent>
        </Card>
      );

      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card Description')).toBeInTheDocument();
      expect(screen.getByText('Card content goes here')).toBeInTheDocument();
    });

    it('applies correct styling to card elements', () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Description</CardDescription>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('rounded-lg', 'border', 'bg-card', 'text-card-foreground', 'shadow-sm');
    });

    it('supports custom className prop', () => {
      const { container } = render(<Card className="custom-class">Content</Card>);
      
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('Progress Component', () => {
    it('renders with correct value', () => {
      render(<Progress value={50} />);
      
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
    });

    it('handles different progress values', () => {
      const { rerender } = render(<Progress value={0} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');

      rerender(<Progress value={100} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');

      rerender(<Progress value={75} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75');
    });

    it('applies correct accessibility attributes', () => {
      render(<Progress value={60} />);
      
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('handles undefined value correctly', () => {
      render(<Progress />);
      
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Badge Component', () => {
    it('renders with default variant', () => {
      render(<Badge>Default Badge</Badge>);
      
      const badge = screen.getByText('Default Badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-primary', 'text-primary-foreground');
    });

    it('applies different variants correctly', () => {
      const { rerender } = render(<Badge variant="secondary">Secondary</Badge>);
      expect(screen.getByText('Secondary')).toHaveClass('bg-secondary', 'text-secondary-foreground');

      rerender(<Badge variant="destructive">Destructive</Badge>);
      expect(screen.getByText('Destructive')).toHaveClass('bg-destructive', 'text-destructive-foreground');

      rerender(<Badge variant="outline">Outline</Badge>);
      expect(screen.getByText('Outline')).toHaveClass('text-foreground');
    });

    it('supports custom className', () => {
      render(<Badge className="custom-badge">Custom</Badge>);
      
      const badge = screen.getByText('Custom');
      expect(badge).toHaveClass('custom-badge');
    });

    it('has proper inline styling', () => {
      render(<Badge>Inline Badge</Badge>);
      
      const badge = screen.getByText('Inline Badge');
      expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded-full', 'border', 'px-2.5', 'py-0.5', 'text-xs', 'font-semibold');
    });
  });

  describe('DropdownMenu Components', () => {
    it('renders dropdown menu structure', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const triggerButton = screen.getByRole('button', { name: 'Open Menu' });
      expect(triggerButton).toBeInTheDocument();
    });

    it('opens dropdown when trigger is clicked', async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const triggerButton = screen.getByRole('button', { name: 'Menu' });
      fireEvent.click(triggerButton);

      // Items should appear after clicking
      expect(screen.getByRole('menuitem', { name: 'Item 1' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Item 2' })).toBeInTheDocument();
    });

    it('handles menu item clicks', async () => {
      const handleClick = vi.fn();
      
      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleClick}>Clickable Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const triggerButton = screen.getByRole('button', { name: 'Menu' });
      fireEvent.click(triggerButton);

      const menuItem = screen.getByRole('menuitem', { name: 'Clickable Item' });
      fireEvent.click(menuItem);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('supports keyboard navigation', async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>First</DropdownMenuItem>
            <DropdownMenuItem>Second</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const triggerButton = screen.getByRole('button', { name: 'Menu' });
      
      // Open with Enter key
      fireEvent.keyDown(triggerButton, { key: 'Enter' });
      
      expect(screen.getByRole('menuitem', { name: 'First' })).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('works together in complex layouts', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Dashboard Stats</span>
              <Badge variant="secondary">New</Badge>
            </CardTitle>
            <CardDescription>Your progress overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>75%</span>
                </div>
                <Progress value={75} className="mt-2" />
              </div>
              <div className="flex gap-2">
                <Button size="sm">Action 1</Button>
                <Button variant="outline" size="sm">Action 2</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );

      // Verify all components render together
      expect(screen.getByText('Dashboard Stats')).toBeInTheDocument();
      expect(screen.getByText('New')).toBeInTheDocument();
      expect(screen.getByText('Your progress overview')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75');
      expect(screen.getByRole('button', { name: 'Action 1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action 2' })).toBeInTheDocument();
    });

    it('maintains consistent theming across components', () => {
      const { container } = render(
        <div>
          <Button>Primary Action</Button>
          <Card className="mt-4">
            <CardContent className="p-4">
              <Badge>Status</Badge>
            </CardContent>
          </Card>
        </div>
      );

      // All components should use design system tokens
      const button = screen.getByRole('button');
      const badge = screen.getByText('Status');
      
      expect(button).toHaveClass('bg-primary', 'text-primary-foreground');
      expect(badge).toHaveClass('bg-primary', 'text-primary-foreground');
    });
  });
});