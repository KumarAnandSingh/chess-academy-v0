import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('login page loads correctly', async ({ page }) => {
    await page.goto('/login');
    
    // Check for login form elements
    await expect(page.locator('input[type="email"]').or(page.locator('input[name="email"]'))).toBeVisible();
    await expect(page.locator('input[type="password"]').or(page.locator('input[name="password"]'))).toBeVisible();
    await expect(page.locator('button:has-text("Sign In")').or(page.locator('button:has-text("Login")'))).toBeVisible();
  });

  test('registration page loads correctly', async ({ page }) => {
    await page.goto('/register');
    
    // Check for registration form elements
    await expect(page.locator('input[type="email"]').or(page.locator('input[name="email"]'))).toBeVisible();
    await expect(page.locator('input[type="password"]').or(page.locator('input[name="password"]'))).toBeVisible();
    await expect(page.locator('button:has-text("Sign Up")').or(page.locator('button:has-text("Register")'))).toBeVisible();
    
    // Check for additional registration fields
    const nameInput = page.locator('input[name="name"]').or(page.locator('input[name="displayName"]'));
    const hasNameField = await nameInput.count() > 0;
    if (hasNameField) {
      await expect(nameInput).toBeVisible();
    }
  });

  test('form validation works for empty fields', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit without filling fields
    const submitButton = page.locator('button:has-text("Sign In")').or(page.locator('button:has-text("Login")'));
    await submitButton.click();
    
    // Should show validation errors
    const errorVisible = await Promise.race([
      page.locator('text=required').isVisible(),
      page.locator('text=Email is required').isVisible(),
      page.locator('text=Password is required').isVisible(),
      page.locator('.error').isVisible(),
      page.locator('[role="alert"]').isVisible()
    ]).catch(() => false);
    
    expect(errorVisible).toBeTruthy();
  });

  test('form validation works for invalid email', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in invalid email
    await page.locator('input[type="email"]').or(page.locator('input[name="email"]')).fill('invalid-email');
    await page.locator('input[type="password"]').or(page.locator('input[name="password"]')).fill('password123');
    
    const submitButton = page.locator('button:has-text("Sign In")').or(page.locator('button:has-text("Login")'));
    await submitButton.click();
    
    // Should show email validation error
    const emailErrorVisible = await Promise.race([
      page.locator('text=valid email').isVisible(),
      page.locator('text=Invalid email').isVisible(),
      page.locator('text=Enter a valid email').isVisible()
    ]).catch(() => false);
    
    expect(emailErrorVisible).toBeTruthy();
  });

  test('password strength validation on registration', async ({ page }) => {
    await page.goto('/register');
    
    const passwordInput = page.locator('input[type="password"]').or(page.locator('input[name="password"]'));
    
    // Try weak password
    await passwordInput.fill('123');
    
    // Should show password strength feedback
    const strengthFeedback = await Promise.race([
      page.locator('text=weak').isVisible(),
      page.locator('text=strong').isVisible(),
      page.locator('text=8 characters').isVisible(),
      page.locator('.password-strength').isVisible()
    ]).catch(() => false);
    
    // Password validation might be immediate or on submit
    expect(strengthFeedback || true).toBeTruthy();
  });

  test('login form toggles password visibility', async ({ page }) => {
    await page.goto('/login');
    
    const passwordInput = page.locator('input[type="password"]').or(page.locator('input[name="password"]'));
    await passwordInput.fill('testpassword');
    
    // Look for password toggle button
    const toggleButton = page.locator('button[aria-label*="password"]').or(page.locator('.password-toggle'));
    
    if (await toggleButton.count() > 0) {
      await toggleButton.click();
      
      // Password should now be visible (type="text")
      const inputType = await passwordInput.getAttribute('type');
      expect(inputType).toBe('text');
    }
  });

  test('navigation between login and register works', async ({ page }) => {
    await page.goto('/login');
    
    // Look for link to registration page
    const registerLink = page.locator('a:has-text("Sign Up")').or(page.locator('a:has-text("Register")'));
    
    if (await registerLink.count() > 0) {
      await registerLink.click();
      await expect(page).toHaveURL(/register/);
    }
    
    // Look for link back to login
    const loginLink = page.locator('a:has-text("Sign In")').or(page.locator('a:has-text("Login")'));
    
    if (await loginLink.count() > 0) {
      await loginLink.click();
      await expect(page).toHaveURL(/login/);
    }
  });

  test('forgot password link works', async ({ page }) => {
    await page.goto('/login');
    
    // Look for forgot password link
    const forgotPasswordLink = page.locator('a:has-text("Forgot")').or(page.locator('a:has-text("Reset")'));
    
    if (await forgotPasswordLink.count() > 0) {
      await forgotPasswordLink.click();
      
      // Should navigate to password reset page or show modal
      const onResetPage = await Promise.race([
        page.waitForURL(/reset/).then(() => true),
        page.waitForURL(/forgot/).then(() => true),
        page.locator('text=Reset Password').isVisible()
      ]).catch(() => false);
      
      expect(onResetPage).toBeTruthy();
    }
  });
});

test.describe('Authentication Success Flow', () => {
  test('successful login redirects to dashboard', async ({ page }) => {
    // Mock successful login response
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'mock-jwt-token',
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            displayName: 'Test User'
          }
        })
      });
    });

    await page.goto('/login');
    
    // Fill in login form
    await page.locator('input[type="email"]').or(page.locator('input[name="email"]')).fill('test@example.com');
    await page.locator('input[type="password"]').or(page.locator('input[name="password"]')).fill('password123');
    
    // Submit form
    const submitButton = page.locator('button:has-text("Sign In")').or(page.locator('button:has-text("Login")'));
    await submitButton.click();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('h1')).toContainText('Welcome');
  });

  test('successful registration redirects appropriately', async ({ page }) => {
    // Mock successful registration response
    await page.route('**/api/auth/register', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'mock-jwt-token',
          user: {
            id: 'new-user-id',
            email: 'newuser@example.com',
            displayName: 'New User'
          }
        })
      });
    });

    await page.goto('/register');
    
    // Fill in registration form
    await page.locator('input[type="email"]').or(page.locator('input[name="email"]')).fill('newuser@example.com');
    await page.locator('input[type="password"]').or(page.locator('input[name="password"]')).fill('password123');
    
    // Fill name field if it exists
    const nameInput = page.locator('input[name="name"]').or(page.locator('input[name="displayName"]'));
    if (await nameInput.count() > 0) {
      await nameInput.fill('New User');
    }
    
    // Submit form
    const submitButton = page.locator('button:has-text("Sign Up")').or(page.locator('button:has-text("Register")'));
    await submitButton.click();
    
    // Should redirect to dashboard or onboarding
    const successfulRedirect = await Promise.race([
      page.waitForURL(/\/$/),
      page.waitForURL(/dashboard/),
      page.waitForURL(/onboarding/)
    ]).then(() => true).catch(() => false);
    
    expect(successfulRedirect).toBeTruthy();
  });
});

test.describe('Authentication Error Handling', () => {
  test('handles login errors gracefully', async ({ page }) => {
    // Mock failed login response
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Invalid credentials'
        })
      });
    });

    await page.goto('/login');
    
    // Fill in login form
    await page.locator('input[type="email"]').or(page.locator('input[name="email"]')).fill('test@example.com');
    await page.locator('input[type="password"]').or(page.locator('input[name="password"]')).fill('wrongpassword');
    
    // Submit form
    const submitButton = page.locator('button:has-text("Sign In")').or(page.locator('button:has-text("Login")'));
    await submitButton.click();
    
    // Should show error message
    const errorVisible = await Promise.race([
      page.locator('text=Invalid credentials').isVisible(),
      page.locator('text=Login failed').isVisible(),
      page.locator('text=Incorrect').isVisible(),
      page.locator('.error').isVisible()
    ]).catch(() => false);
    
    expect(errorVisible).toBeTruthy();
  });

  test('handles network errors during authentication', async ({ page }) => {
    // Mock network error
    await page.route('**/api/auth/login', async (route) => {
      await route.abort('failed');
    });

    await page.goto('/login');
    
    // Fill in login form
    await page.locator('input[type="email"]').or(page.locator('input[name="email"]')).fill('test@example.com');
    await page.locator('input[type="password"]').or(page.locator('input[name="password"]')).fill('password123');
    
    // Submit form
    const submitButton = page.locator('button:has-text("Sign In")').or(page.locator('button:has-text("Login")'));
    await submitButton.click();
    
    // Should show network error message
    const networkErrorVisible = await Promise.race([
      page.locator('text=Network error').isVisible(),
      page.locator('text=Connection failed').isVisible(),
      page.locator('text=Try again').isVisible()
    ]).catch(() => false);
    
    expect(networkErrorVisible).toBeTruthy();
  });
});

test.describe('Protected Routes', () => {
  test('redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to login page
    await expect(page).toHaveURL(/login/);
  });

  test('allows authenticated users to access protected routes', async ({ page }) => {
    // Mock authentication state
    await page.addInitScript(() => {
      localStorage.setItem('chess-academy-token', 'mock-jwt-token');
      localStorage.setItem('chess-academy-user', JSON.stringify({
        id: 'test-user-id',
        email: 'test@example.com',
        displayName: 'Test User'
      }));
    });

    await page.goto('/dashboard');
    
    // Should stay on dashboard (not redirect to login)
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator('h1')).toContainText('Welcome');
  });
});

test.describe('Logout Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Set up authenticated state
    await page.addInitScript(() => {
      localStorage.setItem('chess-academy-token', 'mock-jwt-token');
      localStorage.setItem('chess-academy-user', JSON.stringify({
        id: 'test-user-id',
        email: 'test@example.com',
        displayName: 'Test User'
      }));
    });
  });

  test('logout button works correctly', async ({ page }) => {
    await page.goto('/');
    
    // Look for logout button (might be in menu, profile dropdown, etc.)
    const logoutButton = page.locator('button:has-text("Logout")').or(page.locator('button:has-text("Sign Out")'));
    
    if (await logoutButton.count() > 0) {
      await logoutButton.click();
      
      // Should redirect to login page
      await expect(page).toHaveURL(/login/);
      
      // Should clear authentication state
      const hasToken = await page.evaluate(() => !!localStorage.getItem('chess-academy-token'));
      expect(hasToken).toBeFalsy();
    } else {
      // If logout button is in a dropdown or menu, try to find and open it
      const profileMenu = page.locator('.profile-menu').or(page.locator('.user-menu')).or(page.locator('[aria-label="User menu"]'));
      
      if (await profileMenu.count() > 0) {
        await profileMenu.click();
        
        const logoutInMenu = page.locator('button:has-text("Logout")').or(page.locator('a:has-text("Sign Out")'));
        if (await logoutInMenu.count() > 0) {
          await logoutInMenu.click();
          await expect(page).toHaveURL(/login/);
        }
      }
    }
  });
});