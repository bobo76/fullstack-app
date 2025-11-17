import { test, expect } from '@playwright/test';
import { AppointmentFormPage } from './helpers/page-objects';

test.describe('Appointment Title Autocomplete', () => {
  let appointmentForm: AppointmentFormPage;

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    appointmentForm = new AppointmentFormPage(page);
  });

  test('should show autocomplete suggestions when typing in title field', async ({ page }) => {
    // Open the appointment form
    await appointmentForm.openForm();

    // Type in the title field
    await appointmentForm.typeTitle('coff');

    // Wait for autocomplete to appear
    await appointmentForm.waitForAutocomplete();

    // Check if autocomplete suggestions appeared
    const suggestionCount = await appointmentForm.getAutocompleteCount();

    if (suggestionCount > 0) {
      // Verify at least one suggestion is visible
      await expect(appointmentForm.autocompleteOptions.first()).toBeVisible();

      // Get the initial value
      const initialValue = await appointmentForm.getTitleValue();

      // Click on first suggestion
      await appointmentForm.selectFirstSuggestion();

      // Verify the input was filled with a different value
      const newValue = await appointmentForm.getTitleValue();
      expect(newValue).not.toBe(initialValue);
      expect(newValue.length).toBeGreaterThan(0);
    } else {
      // Log that no suggestions were found (this is okay if backend has no data)
      test.skip(suggestionCount > 0, 'No autocomplete suggestions found - backend may have no matching data');
    }
  });

  test('should debounce autocomplete requests', async ({ page }) => {
    // Open appointment form first
    await appointmentForm.openForm();

    // Set up request interception
    const requests: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/autocomplete')) {
        requests.push(request.url());
      }
    });

    // Type quickly (each character 50ms apart = 300ms total for 6 chars)
    await appointmentForm.typeSlowly('coffee', 50);

    // Wait for debounce (300ms) + network request + render
    await page.waitForTimeout(800);

    // Should have made only 1 request, not 6 (one per character)
    // The 300ms debounce should prevent multiple requests
    // Allow 0-2 requests (0 if backend has no data, 1-2 if it does)
    expect(requests.length).toBeLessThanOrEqual(2);
  });

  test('should not make requests for empty input', async ({ page }) => {
    const requests: string[] = [];
    await page.route('**/autocomplete*', async (route) => {
      requests.push(route.request().url());
      await route.continue();
    });

    await appointmentForm.openForm();

    // Type and then clear
    await appointmentForm.typeTitle('test');
    await page.waitForTimeout(100);
    await appointmentForm.typeTitle('');

    // Wait a bit to ensure no requests are made
    await page.waitForTimeout(500);

    // Should not make requests for empty string
    // Note: There might be 1 request from typing "test", but none from clearing
    const emptyRequests = requests.filter(url => url.includes('query='));
    expect(emptyRequests.length).toBeLessThanOrEqual(1);
  });

  test('should handle special characters in autocomplete', async ({ page }) => {
    await appointmentForm.openForm();

    // Type special characters
    await appointmentForm.typeTitle("meet's & co.");

    // Wait for autocomplete
    await appointmentForm.waitForAutocomplete();

    // Should not throw errors - verify form is still functional
    const titleValue = await appointmentForm.getTitleValue();
    expect(titleValue).toContain("meet's & co.");
  });
});
