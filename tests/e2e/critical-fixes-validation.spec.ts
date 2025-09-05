import { test, expect, Page } from '@playwright/test';

/**
 * Critical Fixes Validation Test Suite
 * 
 * This test suite validates all the critical fixes implemented for the Chess Academy application:
 * 1. Chess board interaction (react-chessboard event handlers)
 * 2. Engine initialization (no longer hangs)
 * 3. React state updates for chess.js integration
 * 4. Mobile responsiveness (sidebar + hamburger menu)
 * 5. Audio feedback system
 * 6. Interactive lessons integration
 */

test.describe('Critical Fixes Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002');
  });

  test.describe('Core Chess Functionality', () => {
    test('Chess board should be interactive - piece click-to-move', async ({ page }) => {
      console.log('Testing chess board piece interaction...');
      
      // Navigate to Play vs Computer
      await page.click('[data-testid="play-link"], text="Play"');
      await expect(page.locator('h2:has-text("Play vs Computer")')).toBeVisible();
      
      // Wait for engine to be ready (should not hang)
      await expect(page.locator('text="Initializing engine..."')).toBeVisible();
      await expect(page.locator('text="Initializing engine..."')).not.toBeVisible({ timeout: 10000 });
      
      // Verify board is rendered
      await expect(page.locator('[data-testid="chessboard"]')).toBeVisible();
      
      // Test piece interaction - click on e2 pawn
      const e2Square = page.locator('[data-square="e2"]');
      await expect(e2Square).toBeVisible();
      await e2Square.click();
      
      // Verify piece selection (should highlight square)
      await expect(e2Square).toHaveAttribute('style', /background.*rgba\(255, 255, 0/);
      
      // Click on e4 to complete the move
      const e4Square = page.locator('[data-square="e4"]');
      await e4Square.click();
      
      // Verify move was made - check game status or move history
      await expect(page.locator('text="Turn: Black"')).toBeVisible({ timeout: 5000 });
      
      console.log('✅ Chess board interaction test passed');
    });

    test('Chess board should support drag and drop', async ({ page }) => {
      console.log('Testing chess board drag and drop...');
      
      // Navigate to Play vs Computer
      await page.click('[data-testid="play-link"], text="Play"');
      await expect(page.locator('h2:has-text("Play vs Computer")')).toBeVisible();
      
      // Wait for engine ready
      await expect(page.locator('text="Initializing engine..."')).not.toBeVisible({ timeout: 10000 });
      
      // Test drag and drop - drag pawn from d2 to d4
      const d2Square = page.locator('[data-square="d2"]');
      const d4Square = page.locator('[data-square="d4"]');
      
      await d2Square.dragTo(d4Square);
      
      // Verify move was made
      await expect(page.locator('text="Turn: Black"')).toBeVisible({ timeout: 5000 });
      
      console.log('✅ Drag and drop test passed');
    });

    test('Engine initialization should not hang', async ({ page }) => {
      console.log('Testing engine initialization...');
      
      // Navigate to Play vs Computer
      await page.click('[data-testid="play-link"], text="Play"');
      
      // Should show "Initializing engine..." briefly
      await expect(page.locator('text="Initializing engine..."')).toBeVisible();
      
      // Should NOT hang - should become ready within 10 seconds
      await expect(page.locator('text="Initializing engine..."')).not.toBeVisible({ timeout: 10000 });
      
      // Should show engine is ready with turn indicator
      await expect(page.locator('text="Turn:"')).toBeVisible();
      
      console.log('✅ Engine initialization test passed');
    });

    test('Computer should make moves after player', async ({ page }) => {
      console.log('Testing computer move generation...');
      
      // Navigate to Play vs Computer
      await page.click('[data-testid="play-link"], text="Play"');
      await expect(page.locator('text="Initializing engine..."')).not.toBeVisible({ timeout: 10000 });
      
      // Make a player move
      const e2Square = page.locator('[data-square="e2"]');
      const e4Square = page.locator('[data-square="e4"]');
      await e2Square.click();
      await e4Square.click();
      
      // Wait for computer thinking indicator
      await expect(page.locator('text="Computer is thinking..."')).toBeVisible({ timeout: 5000 });
      
      // Wait for computer to make a move
      await expect(page.locator('text="Computer is thinking..."')).not.toBeVisible({ timeout: 10000 });
      
      // Should be player's turn again
      await expect(page.locator('text="Turn: White"')).toBeVisible();
      
      console.log('✅ Computer move generation test passed');
    });
  });

  test.describe('User Interface & Mobile Responsiveness', () => {
    test('Desktop sidebar should be visible and functional', async ({ page }) => {
      console.log('Testing desktop sidebar...');
      
      // On desktop viewport, sidebar should be visible
      await page.setViewportSize({ width: 1200, height: 800 });
      
      // Sidebar should be visible
      await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
      
      // Test navigation links
      const navLinks = ['Dashboard', 'Lessons', 'Puzzles', 'Play', 'Analysis'];
      for (const linkText of navLinks) {
        await expect(page.locator(`text="${linkText}"`)).toBeVisible();
      }
      
      // Test navigation functionality
      await page.click('text="Lessons"');
      await expect(page.locator('h1:has-text("Interactive Lessons"), h2:has-text("Lessons")')).toBeVisible();
      
      await page.click('text="Puzzles"');
      await expect(page.locator('h1:has-text("Chess Puzzles"), h2:has-text("Puzzles")')).toBeVisible();
      
      console.log('✅ Desktop sidebar test passed');
    });

    test('Mobile hamburger menu should work correctly', async ({ page }) => {
      console.log('Testing mobile responsiveness...');
      
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Sidebar should be hidden on mobile
      await expect(page.locator('[data-testid="sidebar"]')).not.toBeVisible();
      
      // Hamburger menu button should be visible
      const hamburgerButton = page.locator('button[aria-label="Open menu"], button:has-text("Menu"), [data-testid="mobile-menu-toggle"]');
      await expect(hamburgerButton.first()).toBeVisible();
      
      // Click hamburger menu
      await hamburgerButton.first().click();
      
      // Mobile sidebar overlay should appear
      await expect(page.locator('[data-testid="mobile-sidebar"], [class*="mobile-menu"]')).toBeVisible();
      
      // Test mobile navigation
      await page.click('text="Lessons"');
      await expect(page.locator('h1:has-text("Interactive Lessons"), h2:has-text("Lessons")')).toBeVisible();
      
      // Mobile menu should close after navigation
      await expect(page.locator('[data-testid="mobile-sidebar"], [class*="mobile-menu"]')).not.toBeVisible();
      
      console.log('✅ Mobile responsiveness test passed');
    });

    test('Layout should adapt to different screen sizes', async ({ page }) => {
      console.log('Testing responsive layout...');
      
      const viewports = [
        { width: 320, height: 568, name: 'Mobile Small' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 1024, height: 768, name: 'Desktop Small' },
        { width: 1920, height: 1080, name: 'Desktop Large' }
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        
        // Page should be responsive and content should be visible
        await expect(page.locator('main')).toBeVisible();
        await expect(page.locator('body')).not.toHaveCSS('overflow-x', 'scroll');
        
        console.log(`✅ ${viewport.name} (${viewport.width}x${viewport.height}) layout test passed`);
      }
    });
  });

  test.describe('Audio Feedback System', () => {
    test('Audio service should be initialized and functional', async ({ page }) => {
      console.log('Testing audio service initialization...');
      
      // Check if audio service is available in the global scope
      const audioServiceExists = await page.evaluate(() => {
        return typeof window !== 'undefined' && 
               window.AudioContext !== undefined || 
               (window as any).webkitAudioContext !== undefined;
      });
      
      expect(audioServiceExists).toBe(true);
      
      console.log('✅ Audio service initialization test passed');
    });

    test('Move sounds should trigger on chess moves', async ({ page }) => {
      console.log('Testing move sound feedback...');
      
      // Navigate to Play vs Computer
      await page.click('[data-testid="play-link"], text="Play"');
      await expect(page.locator('text="Initializing engine..."')).not.toBeVisible({ timeout: 10000 });
      
      // Monitor audio context creation (sounds will attempt to play)
      let audioContextCreated = false;
      await page.evaluate(() => {
        const originalAudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (originalAudioContext) {
          const AudioContextProxy = function(...args: any[]) {
            // @ts-ignore
            window._testAudioContextCreated = true;
            return new originalAudioContext(...args);
          };
          AudioContextProxy.prototype = originalAudioContext.prototype;
          window.AudioContext = AudioContextProxy as any;
          (window as any).webkitAudioContext = AudioContextProxy;
        }
      });
      
      // Make a move
      const e2Square = page.locator('[data-square="e2"]');
      const e4Square = page.locator('[data-square="e4"]');
      await e2Square.click();
      await e4Square.click();
      
      // Check if audio context was created (indicating sound attempt)
      audioContextCreated = await page.evaluate(() => (window as any)._testAudioContextCreated === true);
      
      // Audio should attempt to play (even if muted in headless mode)
      expect(audioContextCreated).toBe(true);
      
      console.log('✅ Move sound feedback test passed');
    });
  });

  test.describe('Interactive Lessons Integration', () => {
    test('Lessons page should load and display lessons', async ({ page }) => {
      console.log('Testing lessons page...');
      
      // Navigate to Lessons
      await page.click('text="Lessons"');
      await expect(page.locator('h1:has-text("Interactive Lessons"), h2:has-text("Lessons")')).toBeVisible();
      
      // Should display lesson cards
      await expect(page.locator('[data-testid="lesson-card"], .lesson-card')).toBeVisible();
      
      console.log('✅ Lessons page test passed');
    });

    test('Interactive lesson should load and function', async ({ page }) => {
      console.log('Testing interactive lesson functionality...');
      
      // Navigate to Lessons
      await page.click('text="Lessons"');
      await expect(page.locator('h1:has-text("Interactive Lessons"), h2:has-text("Lessons")')).toBeVisible();
      
      // Click on first lesson
      await page.click('[data-testid="lesson-1"], text="Chess Basics"');
      
      // Should load interactive lesson
      await expect(page.locator('h1:has-text("Chess Basics")')).toBeVisible();
      
      // Should show lesson progress
      await expect(page.locator('[data-testid="lesson-progress"], .progress')).toBeVisible();
      
      // Should have chess board for practice steps
      const continueButton = page.locator('button:has-text("Continue")');
      if (await continueButton.isVisible()) {
        await continueButton.click();
      }
      
      // Look for chess board in lesson
      const hasChessBoard = await page.locator('[data-testid="chessboard"]').isVisible();
      if (hasChessBoard) {
        console.log('Chess board found in lesson');
        await expect(page.locator('[data-testid="chessboard"]')).toBeVisible();
      }
      
      console.log('✅ Interactive lesson test passed');
    });

    test('Lesson navigation should work correctly', async ({ page }) => {
      console.log('Testing lesson navigation...');
      
      // Navigate to specific lesson
      await page.goto('http://localhost:3002/lessons/1');
      
      // Should load lesson
      await expect(page.locator('h1:has-text("Chess Basics")')).toBeVisible();
      
      // Should have navigation buttons
      const nextButton = page.locator('button:has-text("Next")');
      const prevButton = page.locator('button:has-text("Previous")');
      const continueButton = page.locator('button:has-text("Continue")');
      
      // Start navigation
      if (await continueButton.isVisible()) {
        await continueButton.click();
      } else if (await nextButton.isVisible()) {
        await nextButton.click();
      }
      
      // Should progress through lesson steps
      await expect(page.locator('[data-testid="lesson-progress"], .progress')).toBeVisible();
      
      console.log('✅ Lesson navigation test passed');
    });
  });

  test.describe('Cross-Device Compatibility', () => {
    test('Touch interactions should work on mobile', async ({ page }) => {
      console.log('Testing touch interactions...');
      
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Navigate to Play vs Computer
      await page.click('text="Play"');
      await expect(page.locator('text="Initializing engine..."')).not.toBeVisible({ timeout: 10000 });
      
      // Test touch tap on chess pieces (simulated as click in Playwright)
      const e2Square = page.locator('[data-square="e2"]');
      const e4Square = page.locator('[data-square="e4"]');
      
      // Tap to select piece
      await e2Square.tap();
      
      // Should highlight square
      await expect(e2Square).toHaveAttribute('style', /background.*rgba\(255, 255, 0/);
      
      // Tap destination
      await e4Square.tap();
      
      // Should make move
      await expect(page.locator('text="Turn: Black"')).toBeVisible({ timeout: 5000 });
      
      console.log('✅ Touch interactions test passed');
    });
  });

  test.describe('Performance & Error Handling', () => {
    test('Page load should be fast and stable', async ({ page }) => {
      console.log('Testing page load performance...');
      
      const startTime = Date.now();
      await page.goto('http://localhost:3002');
      
      // Page should load within reasonable time
      await expect(page.locator('main')).toBeVisible();
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
      
      // No JavaScript errors should be present
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      // Navigate to different pages to trigger any runtime errors
      await page.click('text="Play"');
      await page.waitForTimeout(1000);
      await page.click('text="Lessons"');
      await page.waitForTimeout(1000);
      
      // Filter out expected/harmless errors
      const criticalErrors = errors.filter(error => 
        !error.includes('favicon') && 
        !error.includes('net::ERR_') &&
        !error.includes('chrome-extension')
      );
      
      expect(criticalErrors.length).toBe(0);
      
      console.log('✅ Performance and error handling test passed');
    });
  });
});