import { test, expect } from '@playwright/test';

test.describe('Authentication and Navigation Flow', () => {
  test('should redirect to login when accessing protected routes without auth', async ({ page }) => {
    // Navigate to dashboard - should redirect to login
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForURL('**/login');
    expect(page.url()).toContain('/login');
  });

  test('should redirect to login when accessing POS without auth', async ({ page }) => {
    // Navigate to POS - should redirect to login
    await page.goto('http://localhost:3000/pos');
    await page.waitForURL('**/login');
    expect(page.url()).toContain('/login');
  });

  test('should handle organization selection flow', async ({ page }) => {
    // This test would require actual authentication
    // For now, we'll test that the organization guard works
    await page.goto('http://localhost:3000/select-organization');

    // Should redirect to login if not authenticated
    await page.waitForURL('**/login');
    expect(page.url()).toContain('/login');
  });

  test('should load login page properly', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    // Check that login form elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should load register page properly', async ({ page }) => {
    await page.goto('http://localhost:3000/register');

    // Check that register form elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});