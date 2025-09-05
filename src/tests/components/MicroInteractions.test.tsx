import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import { 
  MagneticButton, 
  TiltCard, 
  MorphingIcon, 
  LoadingDots, 
  FloatingActionButton, 
  ProgressRing 
} from '../../components/ui/MicroInteractions';
import { audioService } from '../../services/audioService';

// Mock audio service
vi.mock('../../services/audioService', () => ({
  audioService: {
    playUISound: vi.fn(),
  },
}));

describe('MicroInteractions Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('MagneticButton', () => {
    it('renders with children and default props', () => {
      render(
        <MagneticButton>
          Click me
        </MagneticButton>
      );
      
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('applies magnetic effect on mouse move when hovered', async () => {
      render(
        <MagneticButton strength={50}>
          Magnetic Button
        </MagneticButton>
      );
      
      const button = screen.getByRole('button', { name: 'Magnetic Button' });
      
      // Hover over button
      fireEvent.mouseEnter(button);
      
      // Mock getBoundingClientRect
      vi.spyOn(button, 'getBoundingClientRect').mockReturnValue({
        left: 100,
        top: 100,
        width: 200,
        height: 50,
        right: 300,
        bottom: 150,
        x: 100,
        y: 100,
        toJSON: () => ({}),
      });
      
      // Move mouse to trigger magnetic effect
      fireEvent.mouseMove(button, { clientX: 250, clientY: 125 });
      
      await waitFor(() => {
        expect(button.style.transform).toContain('translate');
      });
    });

    it('resets transform on mouse leave', async () => {
      render(
        <MagneticButton>
          Reset Button
        </MagneticButton>
      );
      
      const button = screen.getByRole('button', { name: 'Reset Button' });
      
      fireEvent.mouseEnter(button);
      fireEvent.mouseLeave(button);
      
      await waitFor(() => {
        expect(button.style.transform).toBe('translate(0px, 0px) scale(1)');
      });
    });

    it('calls onClick handler when clicked', () => {
      const handleClick = vi.fn();
      render(
        <MagneticButton onClick={handleClick}>
          Clickable Button
        </MagneticButton>
      );
      
      fireEvent.click(screen.getByRole('button', { name: 'Clickable Button' }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('TiltCard', () => {
    it('renders with children and default props', () => {
      render(
        <TiltCard>
          <div>Card content</div>
        </TiltCard>
      );
      
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('applies tilt effect on mouse move when hovered', async () => {
      render(
        <TiltCard tiltStrength={30}>
          <div>Tilt Card</div>
        </TiltCard>
      );
      
      const card = screen.getByText('Tilt Card').parentElement;
      expect(card).toBeInTheDocument();
      
      if (card) {
        // Mock getBoundingClientRect
        vi.spyOn(card, 'getBoundingClientRect').mockReturnValue({
          left: 0,
          top: 0,
          width: 300,
          height: 200,
          right: 300,
          bottom: 200,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        });
        
        fireEvent.mouseEnter(card);
        fireEvent.mouseMove(card, { clientX: 150, clientY: 100 });
        
        await waitFor(() => {
          expect(card.style.transform).toContain('perspective');
        });
      }
    });

    it('resets transform on mouse leave', async () => {
      render(
        <TiltCard>
          <div>Reset Tilt Card</div>
        </TiltCard>
      );
      
      const card = screen.getByText('Reset Tilt Card').parentElement;
      
      if (card) {
        fireEvent.mouseEnter(card);
        fireEvent.mouseLeave(card);
        
        await waitFor(() => {
          expect(card.style.transform).toBe('perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)');
        });
      }
    });
  });

  describe('MorphingIcon', () => {
    it('renders with initial icon', () => {
      render(
        <MorphingIcon 
          initialIcon="▶️" 
          hoverIcon="⏸️" 
          ariaLabel="Play button"
        />
      );
      
      expect(screen.getByLabelText('Play button')).toBeInTheDocument();
      expect(screen.getByText('▶️')).toBeInTheDocument();
    });

    it('changes icon on hover', async () => {
      render(
        <MorphingIcon 
          initialIcon="❤️" 
          hoverIcon="💔" 
          ariaLabel="Heart icon"
        />
      );
      
      const icon = screen.getByLabelText('Heart icon');
      
      fireEvent.mouseEnter(icon);
      
      await waitFor(() => {
        expect(screen.getByText('💔')).toBeInTheDocument();
      });
    });

    it('reverts icon on mouse leave', async () => {
      render(
        <MorphingIcon 
          initialIcon="🌙" 
          hoverIcon="☀️" 
          ariaLabel="Theme toggle"
        />
      );
      
      const icon = screen.getByLabelText('Theme toggle');
      
      fireEvent.mouseEnter(icon);
      fireEvent.mouseLeave(icon);
      
      await waitFor(() => {
        expect(screen.getByText('🌙')).toBeInTheDocument();
      });
    });
  });

  describe('LoadingDots', () => {
    it('renders with default props', () => {
      render(<LoadingDots />);
      
      const dots = screen.getAllByTestId(/loading-dot-/);
      expect(dots).toHaveLength(3);
    });

    it('renders custom number of dots', () => {
      render(<LoadingDots dotCount={5} />);
      
      const dots = screen.getAllByTestId(/loading-dot-/);
      expect(dots).toHaveLength(5);
    });

    it('applies custom color', () => {
      render(<LoadingDots color="red" />);
      
      const firstDot = screen.getByTestId('loading-dot-0');
      expect(firstDot).toHaveStyle({ backgroundColor: 'red' });
    });
  });

  describe('FloatingActionButton', () => {
    it('renders with icon and default props', () => {
      render(
        <FloatingActionButton icon="+" aria-label="Add item" />
      );
      
      expect(screen.getByLabelText('Add item')).toBeInTheDocument();
      expect(screen.getByText('+')).toBeInTheDocument();
    });

    it('shows label on hover', async () => {
      render(
        <FloatingActionButton 
          icon="✏️" 
          label="Edit" 
          aria-label="Edit button"
        />
      );
      
      const button = screen.getByLabelText('Edit button');
      
      fireEvent.mouseEnter(button);
      
      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument();
      });
    });

    it('plays sound on click when audio is enabled', () => {
      const handleClick = vi.fn();
      render(
        <FloatingActionButton 
          icon="🔊" 
          onClick={handleClick}
          aria-label="Sound button"
        />
      );
      
      fireEvent.click(screen.getByLabelText('Sound button'));
      
      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(audioService.playUISound).toHaveBeenCalledWith('click');
    });
  });

  describe('ProgressRing', () => {
    it('renders with default props', () => {
      render(<ProgressRing progress={50} />);
      
      const svg = screen.getByRole('img', { hidden: true });
      expect(svg).toBeInTheDocument();
    });

    it('displays percentage when enabled', () => {
      render(
        <ProgressRing 
          progress={75} 
          showPercentage={true} 
        />
      );
      
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('renders custom children instead of percentage', () => {
      render(
        <ProgressRing progress={60}>
          <span>Custom Content</span>
        </ProgressRing>
      );
      
      expect(screen.getByText('Custom Content')).toBeInTheDocument();
      expect(screen.queryByText('60%')).not.toBeInTheDocument();
    });

    it('applies custom size and color', () => {
      render(
        <ProgressRing 
          progress={30} 
          size={120} 
          color="#ff0000" 
        />
      );
      
      const svg = screen.getByRole('img', { hidden: true });
      expect(svg).toHaveAttribute('width', '120');
      expect(svg).toHaveAttribute('height', '120');
    });

    it('handles progress values correctly', () => {
      const { rerender } = render(<ProgressRing progress={0} showPercentage={true} />);
      expect(screen.getByText('0%')).toBeInTheDocument();
      
      rerender(<ProgressRing progress={100} showPercentage={true} />);
      expect(screen.getByText('100%')).toBeInTheDocument();
      
      rerender(<ProgressRing progress={150} showPercentage={true} />);
      expect(screen.getByText('100%')).toBeInTheDocument(); // Should clamp to 100
    });
  });
});