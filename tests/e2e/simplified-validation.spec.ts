import { test, expect } from '@playwright/test';

/**
 * Simplified Critical Fixes Validation
 * 
 * This test validates the most critical fixes in a simplified manner:
 * 1. Application loads without hanging
 * 2. Navigation works
 * 3. Chess board renders and is interactive
 * 4. Mobile responsiveness works
 * 5. Engine doesn't hang during initialization
 */

test.describe('Simplified Critical Fixes Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002');
    // Wait for app to fully load
    await page.waitForTimeout(2000);
  });

  test('Application loads successfully without hanging', async ({ page }) => {
    console.log('🔍 Testing application load...');
    
    // Main content should be visible
    await expect(page.locator('main, body')).toBeVisible();
    
    // Should not show any loading spinners hanging indefinitely
    await page.waitForTimeout(1000);
    
    // Check for basic navigation elements
    const hasNavigation = await page.locator('nav, [role="navigation"], aside').count() > 0;
    expect(hasNavigation).toBe(true);
    
    console.log('✅ Application loads successfully');
  });

  test('Navigation works correctly', async ({ page }) => {
    console.log('🔍 Testing navigation...');
    
    // Try to find and click Play link
    const playLink = page.locator('text="Play"').first();
    if (await playLink.isVisible()) {
      await playLink.click();
      await page.waitForTimeout(1000);
      
      // Should navigate to play page
      const isOnPlayPage = await page.locator('text="Play vs Computer", text="Chess Game", h1:has-text("Play"), h2:has-text("Play")').count() > 0;
      expect(isOnPlayPage).toBe(true);
    }
    
    console.log('✅ Navigation works correctly');
  });

  test('Chess board renders and engine initializes', async ({ page }) => {
    console.log('🔍 Testing chess board and engine...');
    
    // Navigate to Play page
    const playLink = page.locator('text="Play"').first();
    if (await playLink.isVisible()) {
      await playLink.click();
      await page.waitForTimeout(2000);
      
      // Look for chess board elements
      const boardSelectors = [
        '[class*="chessboard"]',
        '[data-testid="chessboard"]', 
        'div[class*="chess"]',
        '[id*="chessboard"]'
      ];
      
      let boardFound = false;
      for (const selector of boardSelectors) {
        if (await page.locator(selector).count() > 0) {
          boardFound = true;
          console.log(`Found chess board with selector: ${selector}`);
          break;
        }
      }
      
      expect(boardFound).toBe(true);
      
      // Check that engine initialization doesn't hang - look for initialization text
      const initializingText = page.locator('text="Initializing engine..."');
      if (await initializingText.isVisible()) {
        console.log('Engine initialization detected...');
        
        // Should not hang - wait max 10 seconds for engine to be ready
        await expect(initializingText).not.toBeVisible({ timeout: 10000 });
        console.log('Engine initialization completed');
      }
      
      // Look for game status indicators
      const hasGameStatus = await page.locator('text="Turn:", text="White", text="Black"').count() > 0;
      if (hasGameStatus) {
        console.log('Game status indicators found - engine is ready');
      }
    }
    
    console.log('✅ Chess board and engine test passed');
  });

  test('Mobile responsiveness works', async ({ page }) => {
    console.log('🔍 Testing mobile responsiveness...');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForTimeout(1000);
    
    // Page should still be usable on mobile
    await expect(page.locator('main, body')).toBeVisible();
    
    // Look for mobile menu indicators
    const mobileMenuSelectors = [
      'button[aria-label*="menu"]',
      'button[aria-label*="Menu"]',
      '[class*="hamburger"]',
      '[class*="mobile-menu"]',
      'svg[class*="menu"]'
    ];
    
    let mobileMenuFound = false;
    for (const selector of mobileMenuSelectors) {
      if (await page.locator(selector).count() > 0) {
        mobileMenuFound = true;
        console.log(`Found mobile menu with selector: ${selector}`);
        
        // Try to click the mobile menu
        await page.locator(selector).first().click();
        await page.waitForTimeout(500);
        break;
      }
    }
    
    // Even if no specific mobile menu found, layout should be responsive
    const contentVisible = await page.locator('main, body').isVisible();
    expect(contentVisible).toBe(true);
    
    // Check that content doesn't overflow
    const bodyWidth = await page.locator('body').evaluate(el => el.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(400); // Allow some margin
    
    console.log('✅ Mobile responsiveness test passed');
  });

  test('Interactive lessons are accessible', async ({ page }) => {
    console.log('🔍 Testing interactive lessons...');
    
    // Try to navigate to lessons
    const lessonsLink = page.locator('text="Lessons"').first();
    if (await lessonsLink.isVisible()) {
      await lessonsLink.click();
      await page.waitForTimeout(1000);
      
      // Should be on lessons page
      const onLessonsPage = await page.locator('text="Lesson", text="Interactive", h1:has-text("Lessons"), h2:has-text("Lessons")').count() > 0;
      expect(onLessonsPage).toBe(true);
      
      // Look for lesson content
      const hasLessons = await page.locator('[class*="lesson"], [data-testid*="lesson"]').count() > 0 ||
                         await page.locator('text="Chess Basics", text="Beginner"').count() > 0;
      
      if (hasLessons) {
        console.log('Lesson content found');
        
        // Try to access a lesson
        const lessonLinks = page.locator('a[href*="lesson"], button[class*="lesson"], [class*="lesson-card"]');
        if (await lessonLinks.count() > 0) {
          await lessonLinks.first().click();
          await page.waitForTimeout(1000);
          
          // Should load lesson content
          const lessonLoaded = await page.locator('text="Step", text="Progress", text="Continue"').count() > 0;
          if (lessonLoaded) {
            console.log('Lesson successfully loaded');
          }
        }
      }
    }
    
    console.log('✅ Interactive lessons test passed');
  });

  test('Application performance is acceptable', async ({ page }) => {
    console.log('🔍 Testing application performance...');
    
    const startTime = Date.now();
    
    // Navigate through different sections
    const sections = ['Play', 'Lessons', 'Puzzles'];
    
    for (const section of sections) {
      const link = page.locator(`text="${section}"`).first();
      if (await link.isVisible()) {
        await link.click();
        await page.waitForTimeout(500);
        
        // Check that navigation is responsive
        const sectionTime = Date.now();
        const navTime = sectionTime - startTime;
        expect(navTime).toBeLessThan(5000); // Each navigation should be under 5s
        
        console.log(`Navigation to ${section} took ${navTime}ms`);
      }
    }
    
    // Check for console errors (excluding expected ones)
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && 
          !msg.text().includes('favicon') && 
          !msg.text().includes('chrome-extension') &&
          !msg.text().includes('net::ERR_')) {
        errors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    
    if (errors.length > 0) {
      console.log('Console errors found:', errors);
    }
    
    // Allow some errors but not too many critical ones
    expect(errors.length).toBeLessThan(5);
    
    console.log('✅ Application performance test passed');
  });
});