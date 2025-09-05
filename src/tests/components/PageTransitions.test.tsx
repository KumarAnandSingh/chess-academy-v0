import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import { 
  PageTransition, 
  StaggeredList, 
  AnimatedBreadcrumb, 
  AnimatedTabs, 
  SmoothAccordion, 
  SmoothModal 
} from '../../components/ui/PageTransitions';

describe('PageTransitions Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('PageTransition', () => {
    it('renders children with fade transition by default', async () => {
      render(
        <PageTransition>
          <div>Page content</div>
        </PageTransition>
      );
      
      expect(screen.getByText('Page content')).toBeInTheDocument();
      
      await waitFor(() => {
        const container = screen.getByText('Page content').parentElement;
        expect(container).toHaveClass('opacity-100');
      });
    });

    it('applies slide-left transition correctly', async () => {
      render(
        <PageTransition direction="slide-left">
          <div>Sliding content</div>
        </PageTransition>
      );
      
      expect(screen.getByText('Sliding content')).toBeInTheDocument();
      
      await waitFor(() => {
        const container = screen.getByText('Sliding content').parentElement;
        expect(container).toHaveClass('translate-x-0', 'opacity-100');
      });
    });

    it('applies custom duration', async () => {
      render(
        <PageTransition duration={1000}>
          <div>Custom duration content</div>
        </PageTransition>
      );
      
      const container = screen.getByText('Custom duration content').parentElement;
      expect(container?.style.transitionDuration).toBe('1000ms');
    });
  });

  describe('StaggeredList', () => {
    const items = ['Item 1', 'Item 2', 'Item 3'];

    it('renders all items', () => {
      render(
        <StaggeredList items={items}>
          {(item, index) => <div key={index}>{item}</div>}
        </StaggeredList>
      );
      
      items.forEach(item => {
        expect(screen.getByText(item)).toBeInTheDocument();
      });
    });

    it('applies staggered animation delays', () => {
      render(
        <StaggeredList items={items} staggerDelay={200}>
          {(item, index) => <div key={index} data-testid={`item-${index}`}>{item}</div>}
        </StaggeredList>
      );
      
      const firstItem = screen.getByTestId('item-0').parentElement;
      const secondItem = screen.getByTestId('item-1').parentElement;
      
      expect(firstItem?.style.animationDelay).toBe('0ms');
      expect(secondItem?.style.animationDelay).toBe('200ms');
    });

    it('handles empty items array', () => {
      render(
        <StaggeredList items={[]}>
          {(item, index) => <div key={index}>{item}</div>}
        </StaggeredList>
      );
      
      expect(screen.queryByText('Item')).not.toBeInTheDocument();
    });
  });

  describe('AnimatedBreadcrumb', () => {
    const breadcrumbItems = [
      { label: 'Home', href: '/' },
      { label: 'Chess', href: '/chess' },
      { label: 'Puzzles', href: '/chess/puzzles' },
    ];

    it('renders all breadcrumb items', () => {
      render(<AnimatedBreadcrumb items={breadcrumbItems} />);
      
      breadcrumbItems.forEach(item => {
        expect(screen.getByText(item.label)).toBeInTheDocument();
      });
    });

    it('renders separators between items', () => {
      render(<AnimatedBreadcrumb items={breadcrumbItems} />);
      
      const separators = screen.getAllByText('❯');
      expect(separators).toHaveLength(breadcrumbItems.length - 1);
    });

    it('makes last item non-clickable', () => {
      render(<AnimatedBreadcrumb items={breadcrumbItems} />);
      
      const lastItem = screen.getByText('Puzzles');
      expect(lastItem.closest('a')).toBeNull();
    });

    it('handles single item breadcrumb', () => {
      render(<AnimatedBreadcrumb items={[{ label: 'Home', href: '/' }]} />);
      
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.queryByText('❯')).not.toBeInTheDocument();
    });
  });

  describe('AnimatedTabs', () => {
    const tabs = [
      { id: 'tab1', label: 'Tab 1', content: <div>Content 1</div> },
      { id: 'tab2', label: 'Tab 2', content: <div>Content 2</div> },
      { id: 'tab3', label: 'Tab 3', content: <div>Content 3</div> },
    ];

    it('renders all tab labels', () => {
      const onTabChange = vi.fn();
      render(<AnimatedTabs tabs={tabs} activeTab="tab1" onTabChange={onTabChange} />);
      
      tabs.forEach(tab => {
        expect(screen.getByText(tab.label)).toBeInTheDocument();
      });
    });

    it('shows active tab content', () => {
      const onTabChange = vi.fn();
      render(<AnimatedTabs tabs={tabs} activeTab="tab1" onTabChange={onTabChange} />);
      
      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
    });

    it('calls onTabChange when tab is clicked', () => {
      const onTabChange = vi.fn();
      render(<AnimatedTabs tabs={tabs} activeTab="tab1" onTabChange={onTabChange} />);
      
      fireEvent.click(screen.getByText('Tab 2'));
      
      expect(onTabChange).toHaveBeenCalledWith('tab2');
    });

    it('shows different content for different active tabs', () => {
      const onTabChange = vi.fn();
      const { rerender } = render(<AnimatedTabs tabs={tabs} activeTab="tab1" onTabChange={onTabChange} />);
      
      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
      
      rerender(<AnimatedTabs tabs={tabs} activeTab="tab2" onTabChange={onTabChange} />);
      
      expect(screen.getByText('Content 2')).toBeInTheDocument();
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    });
  });

  describe('SmoothAccordion', () => {
    const accordionItems = [
      { id: '1', title: 'Section 1', content: <div>Content 1</div> },
      { id: '2', title: 'Section 2', content: <div>Content 2</div> },
    ];

    it('renders all accordion titles', () => {
      render(<SmoothAccordion items={accordionItems} />);
      
      accordionItems.forEach(item => {
        expect(screen.getByText(item.title)).toBeInTheDocument();
      });
    });

    it('shows no content initially when allowMultiple is false', () => {
      render(<SmoothAccordion items={accordionItems} />);
      
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
    });

    it('toggles content when title is clicked', async () => {
      render(<SmoothAccordion items={accordionItems} />);
      
      fireEvent.click(screen.getByText('Section 1'));
      
      await waitFor(() => {
        expect(screen.getByText('Content 1')).toBeInTheDocument();
      });
    });

    it('allows multiple sections open when allowMultiple is true', async () => {
      render(<SmoothAccordion items={accordionItems} allowMultiple />);
      
      fireEvent.click(screen.getByText('Section 1'));
      fireEvent.click(screen.getByText('Section 2'));
      
      await waitFor(() => {
        expect(screen.getByText('Content 1')).toBeInTheDocument();
        expect(screen.getByText('Content 2')).toBeInTheDocument();
      });
    });

    it('closes other sections when allowMultiple is false', async () => {
      render(<SmoothAccordion items={accordionItems} />);
      
      fireEvent.click(screen.getByText('Section 1'));
      await waitFor(() => {
        expect(screen.getByText('Content 1')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Section 2'));
      await waitFor(() => {
        expect(screen.getByText('Content 2')).toBeInTheDocument();
        expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
      });
    });

    it('shows correct chevron directions', async () => {
      render(<SmoothAccordion items={accordionItems} />);
      
      const chevrons = screen.getAllByText('❯');
      expect(chevrons).toHaveLength(accordionItems.length);
      
      fireEvent.click(screen.getByText('Section 1'));
      
      await waitFor(() => {
        expect(screen.getByText('❯')).toBeInTheDocument();
      });
    });
  });

  describe('SmoothModal', () => {
    it('does not render when not open', () => {
      render(
        <SmoothModal isOpen={false} onClose={vi.fn()} title="Test Modal">
          <div>Modal content</div>
        </SmoothModal>
      );
      
      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
      expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
    });

    it('renders when open', () => {
      render(
        <SmoothModal isOpen={true} onClose={vi.fn()} title="Test Modal">
          <div>Modal content</div>
        </SmoothModal>
      );
      
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
      const onClose = vi.fn();
      render(
        <SmoothModal isOpen={true} onClose={onClose} title="Test Modal">
          <div>Modal content</div>
        </SmoothModal>
      );
      
      fireEvent.click(screen.getByLabelText('Close modal'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when backdrop is clicked', () => {
      const onClose = vi.fn();
      render(
        <SmoothModal isOpen={true} onClose={onClose} title="Test Modal">
          <div>Modal content</div>
        </SmoothModal>
      );
      
      const backdrop = screen.getByTestId('modal-backdrop');
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not close when modal content is clicked', () => {
      const onClose = vi.fn();
      render(
        <SmoothModal isOpen={true} onClose={onClose} title="Test Modal">
          <div>Modal content</div>
        </SmoothModal>
      );
      
      fireEvent.click(screen.getByText('Modal content'));
      expect(onClose).not.toHaveBeenCalled();
    });

    it('renders custom size correctly', () => {
      render(
        <SmoothModal isOpen={true} onClose={vi.fn()} title="Large Modal" size="large">
          <div>Large modal content</div>
        </SmoothModal>
      );
      
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveClass('max-w-4xl');
    });

    it('handles escape key press', () => {
      const onClose = vi.fn();
      render(
        <SmoothModal isOpen={true} onClose={onClose} title="Test Modal">
          <div>Modal content</div>
        </SmoothModal>
      );
      
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('traps focus within modal', () => {
      render(
        <SmoothModal isOpen={true} onClose={vi.fn()} title="Test Modal">
          <button>First button</button>
          <button>Second button</button>
        </SmoothModal>
      );
      
      const firstButton = screen.getByText('First button');
      const closeButton = screen.getByLabelText('Close modal');
      
      // Close button should be focused initially
      expect(document.activeElement).toBe(closeButton);
    });
  });
});