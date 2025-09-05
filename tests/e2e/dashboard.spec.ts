import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock localStorage to simulate logged-in user
    await page.addInitScript(() => {
      localStorage.setItem('chess-academy-token', 'mock-jwt-token');
      localStorage.setItem('chess-academy-user', JSON.stringify({
        id: 'test-user-id',
        email: 'test@example.com',
        displayName: 'Test User',
      }));
    });
    
    await page.goto('/');
  });

  test('loads dashboard with user data', async ({ page }) => {
    // Wait for the page to load
    await expect(page.locator('h1')).toContainText('Welcome back');
    
    // Check if progress cards are visible
    await expect(page.locator('text=Your Progress')).toBeVisible();
    await expect(page.locator('text=Quick Actions')).toBeVisible();
    await expect(page.locator('text=Recent Activity')).toBeVisible();
  });

  test('displays progress information', async ({ page }) => {
    // Check for XP and level information
    await expect(page.locator('text=XP')).toBeVisible();
    await expect(page.locator('text=Level')).toBeVisible();
    
    // Check for streak information
    await expect(page.locator('text=Current Streak')).toBeVisible();
    await expect(page.locator('text=days')).toBeVisible();
  });

  test('quick action buttons work correctly', async ({ page }) => {
    // Test Start Lesson button
    const startLessonButton = page.locator('button:has-text("Start Lesson")');
    await expect(startLessonButton).toBeVisible();
    await startLessonButton.click();
    
    // Should navigate to lessons page or open lesson modal
    await expect(page.url()).toContain('lesson');
  });

  test('solve puzzle button navigates correctly', async ({ page }) => {
    const solvePuzzleButton = page.locator('button:has-text("Solve Puzzle")');
    await expect(solvePuzzleButton).toBeVisible();
    await solvePuzzleButton.click();
    
    // Should navigate to puzzles page
    await expect(page.url()).toContain('puzzle');
  });

  test('play vs computer button works', async ({ page }) => {
    const playButton = page.locator('button:has-text("Play vs Computer")');
    await expect(playButton).toBeVisible();
    await playButton.click();
    
    // Should navigate to play page
    await expect(page.url()).toContain('play');
  });

  test('responsive design works on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if mobile layout is applied
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Your Progress')).toBeVisible();
    
    // Quick actions should still be accessible
    await expect(page.locator('button:has-text("Start Lesson")')).toBeVisible();
  });

  test('progress ring animations work', async ({ page }) => {
    // Wait for progress rings to be visible
    const progressRing = page.locator('.progress-ring').first();
    await expect(progressRing).toBeVisible();
    
    // Check if SVG circle is present (indicates the progress ring is rendered)
    await expect(progressRing.locator('circle')).toBeVisible();
  });

  test('magnetic button effects work on hover', async ({ page }) => {
    const magneticButton = page.locator('.magnetic-button').first();
    await expect(magneticButton).toBeVisible();
    
    // Hover over the button
    await magneticButton.hover();
    
    // Check if transform is applied (magnetic effect)
    const transform = await magneticButton.evaluate(el => getComputedStyle(el).transform);
    expect(transform).not.toBe('none');
  });

  test('tilt cards respond to mouse movement', async ({ page }) => {
    const tiltCard = page.locator('.tilt-card').first();
    await expect(tiltCard).toBeVisible();
    
    // Hover over the card to trigger tilt effect
    await tiltCard.hover();
    
    // Move mouse around to test tilt effect
    await page.mouse.move(200, 200);
    await page.mouse.move(300, 250);
    
    // Check if perspective transform is applied
    const transform = await tiltCard.evaluate(el => getComputedStyle(el).transform);
    expect(transform).toContain('perspective');
  });

  test('loading states and animations', async ({ page }) => {
    // Reload the page to catch loading states
    await page.reload();
    
    // Check if page transitions work
    await expect(page.locator('.page-transition')).toBeVisible();
  });

  test('achievement display works', async ({ page }) => {
    // Look for achievement-related elements
    const achievementSection = page.locator('text=Recent Activity');
    await expect(achievementSection).toBeVisible();
    
    // Check if achievements are shown (if any)
    const hasAchievements = await page.locator('.achievement-item').count() > 0;
    if (hasAchievements) {
      await expect(page.locator('.achievement-item').first()).toBeVisible();
    }
  });

  test('settings and preferences accessible', async ({ page }) => {
    // Look for settings or profile access
    const settingsButton = page.locator('button[aria-label*="Settings"]').or(page.locator('text=Settings'));
    
    if (await settingsButton.count() > 0) {
      await settingsButton.click();
      // Should show settings modal or navigate to settings page
    }
  });
});

test.describe('Dashboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('chess-academy-token', 'mock-jwt-token');
      localStorage.setItem('chess-academy-user', JSON.stringify({
        id: 'test-user-id',
        email: 'test@example.com',
        displayName: 'Test User',
      }));
    });
    
    await page.goto('/');
  });

  test('navigation menu works correctly', async ({ page }) => {
    // Check if navigation is present
    const nav = page.locator('nav').or(page.locator('[role="navigation"]'));
    
    if (await nav.count() > 0) {
      await expect(nav).toBeVisible();
      
      // Test navigation links
      const links = nav.locator('a');
      const linkCount = await links.count();
      
      for (let i = 0; i < Math.min(linkCount, 3); i++) {
        const link = links.nth(i);
        const href = await link.getAttribute('href');
        if (href && !href.startsWith('http')) {
          await expect(link).toBeVisible();
        }
      }
    }
  });

  test('breadcrumb navigation works', async ({ page }) => {
    // Look for breadcrumb navigation
    const breadcrumb = page.locator('.breadcrumb').or(page.locator('[aria-label="Breadcrumb"]'));
    
    if (await breadcrumb.count() > 0) {
      await expect(breadcrumb).toBeVisible();
      
      // Test breadcrumb links
      const breadcrumbLinks = breadcrumb.locator('a');
      const linkCount = await breadcrumbLinks.count();
      
      if (linkCount > 0) {
        await expect(breadcrumbLinks.first()).toBeVisible();
      }
    }
  });
});

test.describe('Dashboard Performance', () => {
  test('page loads within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
  });

  test('animations are smooth and performant', async ({ page }) => {
    await page.goto('/');
    
    // Test magnetic button animation performance
    const magneticButton = page.locator('.magnetic-button').first();
    if (await magneticButton.count() > 0) {
      await magneticButton.hover();
      
      // Check if animation doesn't block the main thread
      const isResponsive = await page.evaluate(() => {
        return new Promise(resolve => {
          const startTime = performance.now();
          setTimeout(() => {
            const endTime = performance.now();
            resolve(endTime - startTime < 100); // Should respond within 100ms
          }, 50);
        });
      });
      
      expect(isResponsive).toBeTruthy();
    }
  });
});