import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:1420';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    // Wait for fonts and animations to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test.describe('Desktop Layout', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
    });

    test('dashboard layout matches design', async ({ page }) => {
      await expect(page).toHaveScreenshot('desktop-dashboard.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('header component renders correctly', async ({ page }) => {
      await expect(page.locator('header')).toHaveScreenshot('desktop-header.png', {
        animations: 'disabled'
      });
    });

    test('sidebar component renders correctly', async ({ page }) => {
      await expect(page.locator('[role="complementary"]').first()).toHaveScreenshot('desktop-sidebar.png', {
        animations: 'disabled'
      });
    });

    test('dashboard feature cards layout', async ({ page }) => {
      const featureGrid = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4').first();
      await expect(featureGrid).toHaveScreenshot('desktop-feature-cards.png', {
        animations: 'disabled'
      });
    });

    test('dashboard stats section layout', async ({ page }) => {
      const statsGrid = page.locator('.grid.grid-cols-1.md\\:grid-cols-3').first();
      await expect(statsGrid).toHaveScreenshot('desktop-stats-section.png', {
        animations: 'disabled'
      });
    });

    test('profile dropdown renders correctly', async ({ page }) => {
      await page.getByRole('button', { name: /profile menu/i }).click();
      await page.waitForTimeout(200); // Wait for dropdown animation
      
      await expect(page.locator('[role="menu"]')).toHaveScreenshot('desktop-profile-dropdown.png', {
        animations: 'disabled'
      });
    });
  });

  test.describe('Tablet Layout', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
    });

    test('dashboard layout adapts to tablet', async ({ page }) => {
      await expect(page).toHaveScreenshot('tablet-dashboard.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('feature cards show 2-column layout', async ({ page }) => {
      const featureGrid = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4').first();
      await expect(featureGrid).toHaveScreenshot('tablet-feature-cards.png', {
        animations: 'disabled'
      });
    });

    test('header adapts to tablet viewport', async ({ page }) => {
      await expect(page.locator('header')).toHaveScreenshot('tablet-header.png', {
        animations: 'disabled'
      });
    });
  });

  test.describe('Mobile Layout', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
    });

    test('dashboard layout adapts to mobile', async ({ page }) => {
      await expect(page).toHaveScreenshot('mobile-dashboard.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('mobile header shows hamburger menu', async ({ page }) => {
      await expect(page.locator('header')).toHaveScreenshot('mobile-header.png', {
        animations: 'disabled'
      });
    });

    test('mobile sidebar is hidden by default', async ({ page }) => {
      const mobileSidebar = page.locator('[role="complementary"]').nth(1);
      await expect(mobileSidebar).toHaveScreenshot('mobile-sidebar-closed.png', {
        animations: 'disabled'
      });
    });

    test('mobile sidebar opens correctly', async ({ page }) => {
      await page.getByRole('button', { name: /toggle menu/i }).click();
      await page.waitForTimeout(300); // Wait for animation
      
      await expect(page).toHaveScreenshot('mobile-sidebar-open.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('feature cards stack in single column', async ({ page }) => {
      const featureGrid = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4').first();
      await expect(featureGrid).toHaveScreenshot('mobile-feature-cards.png', {
        animations: 'disabled'
      });
    });

    test('mobile header shows abbreviated logo', async ({ page }) => {
      // Test very small screen
      await page.setViewportSize({ width: 320, height: 568 });
      await expect(page.locator('header')).toHaveScreenshot('mobile-header-small.png', {
        animations: 'disabled'
      });
    });
  });

  test.describe('Component States', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
    });

    test('button hover states', async ({ page }) => {
      const button = page.getByRole('link', { name: /start learning/i }).first();
      await button.hover();
      await page.waitForTimeout(100);
      
      await expect(button).toHaveScreenshot('button-hover-state.png', {
        animations: 'disabled'
      });
    });

    test('card hover states', async ({ page }) => {
      const card = page.locator('[class*="group hover:shadow-lg"]').first();
      await card.hover();
      await page.waitForTimeout(100);
      
      await expect(card).toHaveScreenshot('card-hover-state.png', {
        animations: 'disabled'
      });
    });

    test('navigation active states', async ({ page }) => {
      await page.getByRole('link', { name: /lessons/i }).click();
      await page.waitForLoadState('networkidle');
      
      const sidebar = page.locator('[role="complementary"]').first();
      await expect(sidebar).toHaveScreenshot('navigation-active-state.png', {
        animations: 'disabled'
      });
    });

    test('focus states on interactive elements', async ({ page }) => {
      const button = page.getByRole('button', { name: /profile menu/i });
      await button.focus();
      await page.waitForTimeout(100);
      
      await expect(button).toHaveScreenshot('button-focus-state.png', {
        animations: 'disabled'
      });
    });
  });

  test.describe('Dark Mode (if implemented)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      // Add dark mode toggle if available
      // await page.locator('[data-theme-toggle]').click();
    });

    test.skip('dashboard in dark mode', async ({ page }) => {
      await expect(page).toHaveScreenshot('dark-mode-dashboard.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });
  });

  test.describe('Loading States', () => {
    test('dashboard loading skeleton', async ({ page }) => {
      // Intercept API calls to simulate loading
      await page.route('**/api/**', route => {
        // Delay response to show loading state
        setTimeout(() => route.continue(), 2000);
      });
      
      await page.goto(BASE_URL);
      
      // Capture loading state if implemented
      await expect(page).toHaveScreenshot('dashboard-loading.png', {
        animations: 'disabled'
      });
    });
  });

  test.describe('Error States', () => {
    test.skip('dashboard error state', async ({ page }) => {
      // Intercept API calls to simulate error
      await page.route('**/api/**', route => {
        route.abort('failed');
      });
      
      await page.goto(BASE_URL);
      
      // Capture error state if implemented
      await expect(page).toHaveScreenshot('dashboard-error.png', {
        animations: 'disabled'
      });
    });
  });

  test.describe('Cross-browser Consistency', () => {
    test('consistent rendering across browsers', async ({ page, browserName }) => {
      await expect(page).toHaveScreenshot(`${browserName}-dashboard.png`, {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('typography consistency', async ({ page, browserName }) => {
      const mainHeading = page.getByText('Welcome to Chess Academy!');
      await expect(mainHeading).toHaveScreenshot(`${browserName}-typography.png`, {
        animations: 'disabled'
      });
    });

    test('button styling consistency', async ({ page, browserName }) => {
      const buttonGroup = page.locator('.space-y-4').filter({ hasText: 'Start Learning' }).first();
      await expect(buttonGroup).toHaveScreenshot(`${browserName}-buttons.png`, {
        animations: 'disabled'
      });
    });
  });

  test.describe('Responsive Breakpoint Transitions', () => {
    test('layout transitions smoothly between breakpoints', async ({ page }) => {
      // Start at desktop
      await page.setViewportSize({ width: 1280, height: 720 });
      await expect(page).toHaveScreenshot('breakpoint-desktop.png', { 
        fullPage: true, 
        animations: 'disabled' 
      });

      // Transition to tablet
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(200);
      await expect(page).toHaveScreenshot('breakpoint-tablet.png', { 
        fullPage: true, 
        animations: 'disabled' 
      });

      // Transition to mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(200);
      await expect(page).toHaveScreenshot('breakpoint-mobile.png', { 
        fullPage: true, 
        animations: 'disabled' 
      });
    });
  });
});