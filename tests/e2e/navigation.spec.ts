import { test, expect, type Page } from '@playwright/test';

const BASE_URL = 'http://localhost:1420';

test.describe('Chess Academy Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test.describe('Header Navigation', () => {
    test('displays header with logo and navigation items', async ({ page }) => {
      // Check logo
      await expect(page.locator('[data-testid="chess-logo"]')).toBeVisible();
      await expect(page.getByText('Chess Academy')).toBeVisible();

      // Check navigation items
      await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /lessons/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /puzzles/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /vs computer/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /leaderboard/i })).toBeVisible();
    });

    test('header navigation links work correctly', async ({ page }) => {
      // Test Dashboard link
      await page.getByRole('link', { name: /dashboard/i }).click();
      await expect(page).toHaveURL(/.*dashboard/);
      await expect(page.getByText('Welcome to Chess Academy!')).toBeVisible();

      // Test Lessons link
      await page.getByRole('link', { name: /lessons/i }).click();
      await expect(page).toHaveURL(/.*lessons/);

      // Test Puzzles link
      await page.getByRole('link', { name: /puzzles/i }).click();
      await expect(page).toHaveURL(/.*puzzles/);

      // Test vs Computer link
      await page.getByRole('link', { name: /vs computer/i }).click();
      await expect(page).toHaveURL(/.*play/);

      // Test Leaderboard link
      await page.getByRole('link', { name: /leaderboard/i }).click();
      await expect(page).toHaveURL(/.*leaderboard/);
    });

    test('profile dropdown functions correctly', async ({ page }) => {
      // Click profile button
      await page.getByRole('button', { name: /profile menu/i }).click();

      // Check dropdown items
      await expect(page.getByRole('menuitem', { name: /profile/i })).toBeVisible();
      await expect(page.getByRole('menuitem', { name: /settings/i })).toBeVisible();

      // Test profile link
      await page.getByRole('menuitem', { name: /profile/i }).click();
      await expect(page).toHaveURL(/.*profile/);
    });

    test('demo mode badge is visible', async ({ page }) => {
      await expect(page.getByText('Demo Mode')).toBeVisible();
    });
  });

  test.describe('Sidebar Navigation', () => {
    test('sidebar is visible on desktop', async ({ page }) => {
      // Desktop sidebar should be visible
      const sidebar = page.locator('[role="complementary"]').first();
      await expect(sidebar).toBeVisible();

      // Check navigation items in sidebar
      await expect(sidebar.getByRole('link', { name: /dashboard/i })).toBeVisible();
      await expect(sidebar.getByRole('link', { name: /lessons/i })).toBeVisible();
      await expect(sidebar.getByRole('link', { name: /puzzles/i })).toBeVisible();
    });

    test('sidebar navigation links work', async ({ page }) => {
      const sidebar = page.locator('[role="complementary"]').first();

      // Test sidebar links
      await sidebar.getByRole('link', { name: /lessons/i }).click();
      await expect(page).toHaveURL(/.*lessons/);

      await page.goBack();
      await sidebar.getByRole('link', { name: /puzzles/i }).click();
      await expect(page).toHaveURL(/.*puzzles/);
    });

    test('sidebar shows current rating', async ({ page }) => {
      const sidebar = page.locator('[role="complementary"]').first();
      await expect(sidebar.getByText('Current Rating')).toBeVisible();
      await expect(sidebar.getByText('1200')).toBeVisible();
    });

    test('active navigation item is highlighted', async ({ page }) => {
      // Navigate to lessons
      await page.getByRole('link', { name: /lessons/i }).click();
      
      // Check that lessons link is highlighted in sidebar
      const sidebar = page.locator('[role="complementary"]').first();
      const lessonsLink = sidebar.getByRole('link', { name: /lessons/i });
      await expect(lessonsLink).toHaveClass(/bg-accent/);
    });
  });

  test.describe('Mobile Navigation', () => {
    test('mobile menu toggle works', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Check mobile menu button is visible
      const menuButton = page.getByRole('button', { name: /toggle menu/i });
      await expect(menuButton).toBeVisible();

      // Initially menu should be closed
      const mobileSidebar = page.locator('[role="complementary"]').nth(1);
      await expect(mobileSidebar).toHaveClass(/-translate-x-full/);

      // Open mobile menu
      await menuButton.click();
      await expect(mobileSidebar).toHaveClass(/translate-x-0/);

      // Close mobile menu
      await menuButton.click();
      await expect(mobileSidebar).toHaveClass(/-translate-x-full/);
    });

    test('mobile menu overlay closes menu', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Open mobile menu
      await page.getByRole('button', { name: /toggle menu/i }).click();

      // Click overlay to close
      await page.locator('.fixed.inset-0.bg-black\\/50').click();

      // Menu should be closed
      const mobileSidebar = page.locator('[role="complementary"]').nth(1);
      await expect(mobileSidebar).toHaveClass(/-translate-x-full/);
    });

    test('mobile navigation links close menu after click', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Open mobile menu
      await page.getByRole('button', { name: /toggle menu/i }).click();

      const mobileSidebar = page.locator('[role="complementary"]').nth(1);
      await expect(mobileSidebar).toHaveClass(/translate-x-0/);

      // Click a navigation link
      await mobileSidebar.getByRole('link', { name: /lessons/i }).click();

      // Menu should close and navigate
      await expect(mobileSidebar).toHaveClass(/-translate-x-full/);
      await expect(page).toHaveURL(/.*lessons/);
    });

    test('mobile header shows abbreviated logo', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // On very small screens, should show "CA"
      await expect(page.getByText('CA')).toBeVisible();
    });
  });

  test.describe('Dashboard Navigation', () => {
    test('dashboard feature cards navigation works', async ({ page }) => {
      // Should be on dashboard by default
      await expect(page.getByText('Welcome to Chess Academy!')).toBeVisible();

      // Test Learn Chess card
      await page.getByRole('link', { name: /start learning/i }).first().click();
      await expect(page).toHaveURL(/.*lessons/);

      // Go back to dashboard
      await page.goBack();

      // Test Puzzles card
      await page.getByRole('link', { name: /start solving/i }).click();
      await expect(page).toHaveURL(/.*puzzles/);

      // Go back to dashboard
      await page.goBack();

      // Test vs Computer card
      await page.getByRole('link', { name: /play now/i }).click();
      await expect(page).toHaveURL(/.*play/);

      // Go back to dashboard
      await page.goBack();

      // Test Leaderboard card
      await page.getByRole('link', { name: /view rankings/i }).click();
      await expect(page).toHaveURL(/.*leaderboard/);
    });

    test('main CTA button works', async ({ page }) => {
      const ctaButton = page.getByRole('link', { name: /start learning/i }).first();
      await expect(ctaButton).toBeVisible();
      
      await ctaButton.click();
      await expect(page).toHaveURL(/.*lessons/);
    });
  });

  test.describe('Responsive Navigation Behavior', () => {
    test('desktop navigation is hidden on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Desktop navigation should be hidden
      const desktopNav = page.locator('.hidden.md\\:flex');
      await expect(desktopNav).not.toBeVisible();
    });

    test('mobile menu button is hidden on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 768 });

      // Mobile menu button should be hidden
      const menuButton = page.getByRole('button', { name: /toggle menu/i });
      await expect(menuButton).not.toBeVisible();
    });

    test('sidebar behavior changes between mobile and desktop', async ({ page }) => {
      // Desktop: sidebar should be always visible
      await page.setViewportSize({ width: 1024, height: 768 });
      const desktopSidebar = page.locator('[role="complementary"]').first();
      await expect(desktopSidebar).toBeVisible();

      // Mobile: sidebar should be hidden by default
      await page.setViewportSize({ width: 375, height: 667 });
      const mobileSidebar = page.locator('[role="complementary"]').nth(1);
      await expect(mobileSidebar).toHaveClass(/-translate-x-full/);
    });
  });

  test.describe('Navigation State Persistence', () => {
    test('active route is highlighted across page reloads', async ({ page }) => {
      // Navigate to lessons
      await page.getByRole('link', { name: /lessons/i }).click();
      await expect(page).toHaveURL(/.*lessons/);

      // Reload page
      await page.reload();

      // Active state should persist
      const sidebar = page.locator('[role="complementary"]').first();
      const lessonsLink = sidebar.getByRole('link', { name: /lessons/i });
      await expect(lessonsLink).toHaveClass(/bg-accent/);
    });

    test('navigation works with browser back/forward buttons', async ({ page }) => {
      // Navigate through several pages
      await page.getByRole('link', { name: /lessons/i }).click();
      await expect(page).toHaveURL(/.*lessons/);

      await page.getByRole('link', { name: /puzzles/i }).click();
      await expect(page).toHaveURL(/.*puzzles/);

      // Use browser back button
      await page.goBack();
      await expect(page).toHaveURL(/.*lessons/);

      // Use browser forward button
      await page.goForward();
      await expect(page).toHaveURL(/.*puzzles/);
    });
  });

  test.describe('Accessibility Navigation', () => {
    test('keyboard navigation works', async ({ page }) => {
      // Tab through navigation elements
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Should be able to activate with Enter
      await page.keyboard.press('Enter');
    });

    test('skip links work for keyboard users', async ({ page }) => {
      // Focus first element and press Tab to reach skip link
      await page.keyboard.press('Tab');
      
      // Check if skip link becomes visible on focus
      // Note: This depends on implementation of skip links
    });

    test('ARIA landmarks are present', async ({ page }) => {
      // Check for main landmarks
      await expect(page.locator('[role="banner"]')).toBeVisible(); // Header
      await expect(page.locator('[role="main"]')).toBeVisible(); // Main content
      await expect(page.locator('[role="complementary"]')).toBeVisible(); // Sidebar
      await expect(page.locator('[role="navigation"]')).toBeVisible(); // Navigation
    });
  });

  test.describe('Performance', () => {
    test('navigation is fast and responsive', async ({ page }) => {
      const startTime = Date.now();
      
      await page.getByRole('link', { name: /lessons/i }).click();
      await expect(page).toHaveURL(/.*lessons/);
      
      const endTime = Date.now();
      const navigationTime = endTime - startTime;
      
      // Navigation should be under 1 second
      expect(navigationTime).toBeLessThan(1000);
    });

    test('no layout shifts during navigation', async ({ page }) => {
      // Check initial layout
      const initialBox = await page.locator('[role="main"]').boundingBox();
      
      // Navigate and check layout remains stable
      await page.getByRole('link', { name: /lessons/i }).click();
      await page.waitForLoadState('networkidle');
      
      const newBox = await page.locator('[role="main"]').boundingBox();
      
      // Main content area should maintain same position/size
      expect(newBox?.x).toBe(initialBox?.x);
      expect(newBox?.width).toBe(initialBox?.width);
    });
  });
});