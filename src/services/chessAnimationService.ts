/**
 * Chess Animation Service
 * Handles smooth piece movements, visual feedback, and educational animations
 * for the guided practice chess board experience
 */

interface Square {
  rank: number;
  file: number;
}

interface ChessMove {
  from: string;
  to: string;
  piece: string;
  captured?: string;
  san?: string;
}

interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
}

interface MoveExplanationAnimation {
  squares: string[];
  arrows: Array<{
    from: string;
    to: string;
    color: string;
    style: 'solid' | 'dashed';
  }>;
  highlights: Array<{
    square: string;
    color: string;
    animation: 'pulse' | 'glow' | 'bounce';
  }>;
  duration: number;
}

class ChessAnimationService {
  private static instance: ChessAnimationService;
  
  // Animation configurations - Super fast for instant loading
  private readonly MOVE_ANIMATION_DURATION = 200;
  private readonly CAPTURE_ANIMATION_DURATION = 250;
  private readonly HIGHLIGHT_ANIMATION_DURATION = 300;
  private readonly EXPLANATION_ANIMATION_DURATION = 500;

  static getInstance(): ChessAnimationService {
    if (!ChessAnimationService.instance) {
      ChessAnimationService.instance = new ChessAnimationService();
    }
    return ChessAnimationService.instance;
  }

  /**
   * Calculate pixel coordinates for chess board animation
   */
  private squareToCoordinates(square: string, boardSize: number = 512): { x: number; y: number } {
    const file = square.charCodeAt(0) - 'a'.charCodeAt(0);
    const rank = parseInt(square[1]) - 1;
    const squareSize = boardSize / 8;
    
    return {
      x: file * squareSize,
      y: (7 - rank) * squareSize // Flip for visual board representation
    };
  }

  /**
   * Create smooth piece movement animation
   */
  createMoveAnimation(
    move: ChessMove, 
    boardElement: HTMLElement,
    config?: Partial<AnimationConfig>
  ): Animation | null {
    const pieceElement = boardElement.querySelector(`[data-square="${move.from}"] .chess-piece`);
    if (!pieceElement) {
      console.warn(`Piece not found on square ${move.from}`);
      return null;
    }

    const fromCoords = this.squareToCoordinates(move.from);
    const toCoords = this.squareToCoordinates(move.to);
    
    const deltaX = toCoords.x - fromCoords.x;
    const deltaY = toCoords.y - fromCoords.y;

    const animationConfig: AnimationConfig = {
      duration: config?.duration || this.MOVE_ANIMATION_DURATION,
      easing: config?.easing || 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      delay: config?.delay || 0
    };

    // Create WAAPI animation
    return pieceElement.animate([
      { 
        transform: 'translate(0, 0)',
        zIndex: '10'
      },
      { 
        transform: `translate(${deltaX}px, ${deltaY}px)`,
        zIndex: '10'
      }
    ], {
      duration: animationConfig.duration,
      easing: animationConfig.easing,
      delay: animationConfig.delay,
      fill: 'forwards'
    });
  }

  /**
   * Create capture animation with piece removal
   */
  createCaptureAnimation(
    move: ChessMove,
    boardElement: HTMLElement
  ): Promise<void> {
    return new Promise((resolve) => {
      const capturedPieceElement = boardElement.querySelector(`[data-square="${move.to}"] .chess-piece`);
      
      if (capturedPieceElement) {
        // Animate captured piece disappearing
        const captureAnim = capturedPieceElement.animate([
          { 
            transform: 'scale(1) rotate(0deg)',
            opacity: 1
          },
          { 
            transform: 'scale(0.3) rotate(180deg)',
            opacity: 0
          }
        ], {
          duration: this.CAPTURE_ANIMATION_DURATION / 2,
          easing: 'ease-in',
          fill: 'forwards'
        });

        captureAnim.onfinish = () => {
          // Then animate the capturing piece moving
          const moveAnim = this.createMoveAnimation(move, boardElement, {
            duration: this.CAPTURE_ANIMATION_DURATION / 2,
            delay: 100
          });
          
          if (moveAnim) {
            moveAnim.onfinish = () => resolve();
          } else {
            resolve();
          }
        };
      } else {
        // No piece to capture, just do regular move
        const moveAnim = this.createMoveAnimation(move, boardElement);
        if (moveAnim) {
          moveAnim.onfinish = () => resolve();
        } else {
          resolve();
        }
      }
    });
  }

  /**
   * Create explanation animation that highlights squares and shows arrows
   */
  createExplanationAnimation(
    explanation: MoveExplanationAnimation,
    boardElement: HTMLElement
  ): Promise<void> {
    return new Promise((resolve) => {
      const animations: Animation[] = [];

      // Highlight squares with animations - Added error handling
      explanation.highlights.forEach(({ square, color, animation }, index) => {
        const squareElement = boardElement.querySelector(`[data-square="${square}"]`);
        if (!squareElement) {
          console.warn(`Square element not found: ${square}`);
          return;
        }
        
        try {
          let keyframes: Keyframe[] = [];
          
          switch (animation) {
            case 'pulse':
              keyframes = [
                { transform: 'scale(1)', filter: 'brightness(1)' },
                { transform: 'scale(1.1)', filter: 'brightness(1.3)' },
                { transform: 'scale(1)', filter: 'brightness(1)' }
              ];
              break;
            case 'glow':
              keyframes = [
                { boxShadow: 'inset 0 0 0 2px transparent' },
                { boxShadow: `inset 0 0 0 2px ${color}, 0 0 8px ${color}` },
                { boxShadow: 'inset 0 0 0 2px transparent' }
              ];
              break;
            case 'bounce':
              keyframes = [
                { transform: 'translateY(0)' },
                { transform: 'translateY(-4px)' },
                { transform: 'translateY(0)' },
                { transform: 'translateY(-2px)' },
                { transform: 'translateY(0)' }
              ];
              break;
          }

          const anim = squareElement.animate(keyframes, {
            duration: this.HIGHLIGHT_ANIMATION_DURATION,
            delay: index * 20, // Minimal delay for instant loading
            iterations: 1, // Single iteration for speed
            easing: 'ease-in-out'
          });
          
          animations.push(anim);
        } catch (error) {
          console.error(`Animation error for square ${square}:`, error);
        }
      });

      // Create arrow animations (would require SVG overlay)
      this.createArrowAnimations(explanation.arrows, boardElement, animations, explanation.duration);

      // Wait for all animations to complete - Instant resolution
      Promise.all(animations.map(anim => anim.finished)).then(() => {
        resolve(); // No delay for instant loading
      });
    });
  }

  /**
   * Create arrow animations for move explanations
   */
  private createArrowAnimations(
    arrows: MoveExplanationAnimation['arrows'],
    boardElement: HTMLElement,
    animations: Animation[],
    duration: number = 1000
  ): void {
    arrows.forEach((arrow, index) => {
      // Create SVG arrow element if it doesn't exist
      let arrowContainer = boardElement.querySelector('.chess-arrows') as HTMLElement;
      if (!arrowContainer) {
        arrowContainer = document.createElement('div');
        arrowContainer.className = 'chess-arrows absolute inset-0 pointer-events-none';
        arrowContainer.innerHTML = '<svg width="100%" height="100%" class="absolute inset-0"></svg>';
        boardElement.appendChild(arrowContainer);
      }

      const svg = arrowContainer.querySelector('svg');
      if (svg) {
        const fromCoords = this.squareToCoordinates(arrow.from);
        const toCoords = this.squareToCoordinates(arrow.to);
        
        // Create arrow path
        const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const d = `M ${fromCoords.x + 32} ${fromCoords.y + 32} L ${toCoords.x + 32} ${toCoords.y + 32}`;
        
        arrowPath.setAttribute('d', d);
        arrowPath.setAttribute('stroke', arrow.color);
        arrowPath.setAttribute('stroke-width', '3');
        arrowPath.setAttribute('stroke-linecap', 'round');
        arrowPath.setAttribute('marker-end', 'url(#arrowhead)');
        arrowPath.setAttribute('opacity', '0');
        
        if (arrow.style === 'dashed') {
          arrowPath.setAttribute('stroke-dasharray', '5,5');
        }

        svg.appendChild(arrowPath);

        // Animate arrow appearance - Faster loading
        const anim = arrowPath.animate([
          { opacity: 0, strokeDashoffset: '100%' },
          { opacity: 0.8, strokeDashoffset: '0%' }
        ], {
          duration: 400, // Reduced duration
          delay: index * 100, // Reduced delay
          fill: 'forwards',
          easing: 'ease-out'
        });

        animations.push(anim);

        // Remove arrow after animation - Faster cleanup
        setTimeout(() => {
          if (arrowPath.parentNode) {
            arrowPath.remove();
          }
        }, duration + (index * 100));
      }
    });
  }

  /**
   * Create feedback animation for correct/incorrect moves
   */
  createFeedbackAnimation(
    isCorrect: boolean,
    square: string,
    boardElement: HTMLElement
  ): Promise<void> {
    return new Promise((resolve) => {
      const squareElement = boardElement.querySelector(`[data-square="${square}"]`);
      if (!squareElement) {
        resolve();
        return;
      }

      const color = isCorrect ? '#22c55e' : '#ef4444';
      const symbol = isCorrect ? '✓' : '✗';
      
      // Create feedback overlay
      const feedback = document.createElement('div');
      feedback.className = 'absolute inset-0 flex items-center justify-center pointer-events-none z-20';
      feedback.innerHTML = `
        <div class="feedback-symbol text-white text-4xl font-bold bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center">
          ${symbol}
        </div>
      `;
      feedback.style.color = color;
      
      squareElement.appendChild(feedback);

      // Animate feedback
      const anim = feedback.animate([
        { 
          transform: 'scale(0.5)',
          opacity: 0
        },
        { 
          transform: 'scale(1.2)',
          opacity: 1
        },
        { 
          transform: 'scale(1)',
          opacity: 1
        },
        { 
          transform: 'scale(0.8)',
          opacity: 0
        }
      ], {
        duration: 1200,
        easing: 'ease-out'
      });

      anim.onfinish = () => {
        feedback.remove();
        resolve();
      };
    });
  }

  /**
   * Create lesson transition animation
   */
  createLessonTransition(
    fromElement: HTMLElement,
    toElement: HTMLElement,
    direction: 'next' | 'previous' = 'next'
  ): Promise<void> {
    return new Promise((resolve) => {
      const slideDistance = direction === 'next' ? '-100%' : '100%';
      
      // Animate out current element
      const outAnim = fromElement.animate([
        { transform: 'translateX(0)', opacity: 1 },
        { transform: `translateX(${slideDistance})`, opacity: 0 }
      ], {
        duration: 300,
        easing: 'ease-in',
        fill: 'forwards'
      });

      // Prepare new element
      toElement.style.transform = `translateX(${direction === 'next' ? '100%' : '-100%'})`;
      toElement.style.opacity = '0';

      outAnim.onfinish = () => {
        // Animate in new element
        const inAnim = toElement.animate([
          { transform: `translateX(${direction === 'next' ? '100%' : '-100%'})`, opacity: 0 },
          { transform: 'translateX(0)', opacity: 1 }
        ], {
          duration: 300,
          easing: 'ease-out',
          fill: 'forwards'
        });

        inAnim.onfinish = () => resolve();
      };
    });
  }

  /**
   * Cleanup animations and reset board state
   */
  cleanup(boardElement: HTMLElement): void {
    // Remove any temporary arrow containers
    const arrowContainer = boardElement.querySelector('.chess-arrows');
    if (arrowContainer) {
      arrowContainer.remove();
    }

    // Remove any feedback overlays
    const feedbacks = boardElement.querySelectorAll('.feedback-symbol');
    feedbacks.forEach(feedback => feedback.parentElement?.remove());

    // Reset all piece transforms
    const pieces = boardElement.querySelectorAll('.chess-piece');
    pieces.forEach(piece => {
      (piece as HTMLElement).style.transform = '';
      (piece as HTMLElement).style.zIndex = '';
    });
  }

  /**
   * Preload animation assets and setup SVG markers
   */
  initializeAnimations(boardElement: HTMLElement): void {
    // Create SVG definitions for arrow markers
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '7');
    marker.setAttribute('refX', '10');
    marker.setAttribute('refY', '3.5');
    marker.setAttribute('orient', 'auto');
    
    path.setAttribute('d', 'M 0 0 L 10 3.5 L 0 7 z');
    path.setAttribute('fill', 'currentColor');
    
    marker.appendChild(path);
    defs.appendChild(marker);
    
    // Add to any existing SVG or create one
    let svg = boardElement.querySelector('svg');
    if (!svg) {
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '0');
      svg.setAttribute('height', '0');
      svg.style.position = 'absolute';
      boardElement.appendChild(svg);
    }
    
    svg.appendChild(defs);
  }
}

export const chessAnimationService = ChessAnimationService.getInstance();
export type { ChessMove, MoveExplanationAnimation, AnimationConfig };
export default ChessAnimationService;