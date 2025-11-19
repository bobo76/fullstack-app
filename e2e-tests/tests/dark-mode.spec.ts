import { test, expect } from '@playwright/test';

test.describe('Dark Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should apply dark theme to entire app when dark mode is enabled', async ({ page }) => {
    // Verify initial light theme
    const bodyClassBefore = await page.evaluate(() => document.body.className);
    expect(bodyClassBefore).not.toContain('dark-theme');

    // Navigate to Settings
    await page.locator('.nav-item').filter({ hasText: 'Settings' }).click();
    await page.waitForTimeout(1000);

    // Verify settings page is visible
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();

    // Get initial background color of body (light mode)
    const lightModeBodyBg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });

    // Get initial calendar/settings colors before dark mode
    const lightModeCardBg = await page.evaluate(() => {
      const card = document.querySelector('.mat-mdc-card');
      return card ? window.getComputedStyle(card).backgroundColor : null;
    });

    // Enable dark mode - locate toggle by the nearby "Dark Mode" text
    const darkModeToggle = page.locator('mat-slide-toggle').first();
    await darkModeToggle.click();

    // Wait for theme to apply
    await page.waitForTimeout(500);

    // Verify dark-theme class is applied to body
    const bodyClassAfter = await page.evaluate(() => document.body.className);
    expect(bodyClassAfter).toContain('dark-theme');

    // Verify body background changed to dark
    const darkModeBodyBg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    expect(darkModeBodyBg).not.toBe(lightModeBodyBg);

    // Verify card backgrounds are dark
    const darkModeCardBg = await page.evaluate(() => {
      const card = document.querySelector('.mat-mdc-card');
      return card ? window.getComputedStyle(card).backgroundColor : null;
    });
    expect(darkModeCardBg).not.toBe(lightModeCardBg);

    // Verify settings cards have dark background
    const settingsCardBg = await page.evaluate(() => {
      const settingsCard = document.querySelector('.settings-card');
      if (!settingsCard) return null;
      const style = window.getComputedStyle(settingsCard);
      return style.backgroundColor;
    });

    // Dark mode background should be darker (rgb values lower)
    expect(settingsCardBg).toBeTruthy();
    const rgbMatch = settingsCardBg?.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      const [_, r, g, b] = rgbMatch.map(Number);
      // Dark backgrounds typically have low RGB values (< 100)
      expect(r).toBeLessThan(100);
      expect(g).toBeLessThan(100);
      expect(b).toBeLessThan(100);
    }

    // Navigate to Calendar view to verify dark mode applies there too
    await page.locator('.nav-item').filter({ hasText: 'Calendar' }).click();
    await page.waitForTimeout(1000);

    // Verify body still has dark-theme class
    const bodyClassInCalendar = await page.evaluate(() => document.body.className);
    expect(bodyClassInCalendar).toContain('dark-theme');

    // Verify calendar elements have dark styling
    const calendarBg = await page.evaluate(() => {
      const calendar = document.querySelector('app-calendar-view');
      return calendar ? window.getComputedStyle(calendar).backgroundColor : null;
    });

    // Calendar should inherit dark background or be transparent
    if (calendarBg && calendarBg !== 'rgba(0, 0, 0, 0)') {
      const calendarRgbMatch = calendarBg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (calendarRgbMatch) {
        const [_, r, g, b] = calendarRgbMatch.map(Number);
        expect(r).toBeLessThan(100);
        expect(g).toBeLessThan(100);
        expect(b).toBeLessThan(100);
      }
    }

    // Navigate to Appointment Types to verify dark mode there
    await page.locator('.nav-item').filter({ hasText: 'Appointment Types' }).click();
    await page.waitForTimeout(1000);

    // Verify body still has dark-theme class
    const bodyClassInTypes = await page.evaluate(() => document.body.className);
    expect(bodyClassInTypes).toContain('dark-theme');
  });

  test('should persist dark mode across page reloads', async ({ page }) => {
    // Enable dark mode
    await page.locator('.nav-item').filter({ hasText: 'Settings' }).click();
    await page.waitForTimeout(1000);

    const darkModeToggle = page.locator('mat-slide-toggle').first();
    await darkModeToggle.click();
    await page.waitForTimeout(500);

    // Verify dark mode is enabled
    let bodyClass = await page.evaluate(() => document.body.className);
    expect(bodyClass).toContain('dark-theme');

    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify dark mode persisted after reload
    bodyClass = await page.evaluate(() => document.body.className);
    expect(bodyClass).toContain('dark-theme');

    // Go back to settings and verify toggle is still checked
    await page.locator('.nav-item').filter({ hasText: 'Settings' }).click();
    await page.waitForTimeout(1000);

    const toggleAfterReload = page.locator('mat-slide-toggle').first();
    // Verify toggle is checked by checking the mat-slide-toggle-checked class
    await expect(toggleAfterReload).toHaveClass(/mat-mdc-slide-toggle-checked/);
  });

  test('should disable dark mode when toggle is turned off', async ({ page }) => {
    // Enable dark mode first
    await page.locator('.nav-item').filter({ hasText: 'Settings' }).click();
    await page.waitForTimeout(1000);

    const darkModeToggle = page.locator('mat-slide-toggle').first();
    await darkModeToggle.click();
    await page.waitForTimeout(500);

    // Verify dark mode is enabled
    let bodyClass = await page.evaluate(() => document.body.className);
    expect(bodyClass).toContain('dark-theme');

    // Disable dark mode
    await darkModeToggle.click();
    await page.waitForTimeout(500);

    // Verify dark mode is disabled
    bodyClass = await page.evaluate(() => document.body.className);
    expect(bodyClass).not.toContain('dark-theme');

    // Get body background (should be light)
    const lightModeBodyBg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });

    // Light mode backgrounds typically have high RGB values (> 200)
    const rgbMatch = lightModeBodyBg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      const [_, r, g, b] = rgbMatch.map(Number);
      expect(r).toBeGreaterThan(200);
      expect(g).toBeGreaterThan(200);
      expect(b).toBeGreaterThan(200);
    }
  });

  test.afterEach(async ({ page }) => {
    // Clean up: reset to light mode
    try {
      await page.evaluate(() => {
        localStorage.removeItem('calendar-app-settings');
      });
    } catch (error) {
      // Page may have been closed or navigated away
      console.log('Could not clean up localStorage:', error);
    }
  });
});
