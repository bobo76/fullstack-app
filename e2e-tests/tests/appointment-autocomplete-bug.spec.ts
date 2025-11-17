import { test, expect } from '@playwright/test';
import { AppointmentFormPage } from './helpers/page-objects';

test.describe('Appointment Autocomplete Bug - Persistent Suggestions', () => {
  let appointmentForm: AppointmentFormPage;

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    appointmentForm = new AppointmentFormPage(page);
  });

  test('should NOT show previous autocomplete results when clicking in empty title field', async ({ page }) => {
    // Step 1: Open form and search for "coffee"
    await appointmentForm.openForm();
    await appointmentForm.typeTitle('coffee');
    await appointmentForm.waitForAutocomplete();

    // Store the suggestions count
    const coffeeSuggestionsCount = await appointmentForm.getAutocompleteCount();

    // Step 2: Cancel the form
    const cancelButton = page.getByRole('button', { name: /cancel/i });
    await cancelButton.click();
    await appointmentForm.titleInput.waitFor({ state: 'hidden', timeout: 5000 });

    // Step 3: Open a new appointment form
    await appointmentForm.openForm();

    // Step 4: Click in the title field WITHOUT typing anything
    await appointmentForm.titleInput.click();

    // Wait a bit for any potential autocomplete to appear
    await page.waitForTimeout(500);

    // Step 5: Verify NO autocomplete suggestions appear
    const autocompleteVisible = await appointmentForm.autocompleteDropdown.isVisible().catch(() => false);
    const suggestionCount = await appointmentForm.getAutocompleteCount();

    // The autocomplete should either not be visible, or have 0 suggestions
    if (autocompleteVisible) {
      // BUG: This is currently failing - the dropdown shows with old "coffee" suggestions
      expect(suggestionCount).toBe(0);
    } else {
      // Expected behavior: autocomplete is not visible for empty input
      expect(autocompleteVisible).toBe(false);
    }

    // Additional verification: title should be empty
    const titleValue = await appointmentForm.getTitleValue();
    expect(titleValue).toBe('');
  });

  test('should NOT show stale autocomplete when focusing empty title field after cancel', async ({ page }) => {
    // Open form, search, cancel, reopen, focus
    await appointmentForm.openForm();
    await appointmentForm.typeTitle('coffee');
    await appointmentForm.waitForAutocomplete();

    // Get suggestions text to verify they don't reappear
    const originalSuggestions = await appointmentForm.autocompleteOptions.allTextContents();

    // Cancel
    const cancelButton = page.getByRole('button', { name: /cancel/i });
    await cancelButton.click();
    await appointmentForm.titleInput.waitFor({ state: 'hidden', timeout: 5000 });

    // Reopen
    await appointmentForm.openForm();

    // Focus the title input (simulates clicking in the field)
    await appointmentForm.titleInput.focus();
    await page.waitForTimeout(500);

    // Check if old suggestions appear
    const currentSuggestions = await appointmentForm.autocompleteOptions.allTextContents();

    // Current suggestions should be empty (no search has been performed)
    expect(currentSuggestions.length).toBe(0);

    // If there are suggestions, they should NOT be the same as the coffee suggestions
    if (currentSuggestions.length > 0 && originalSuggestions.length > 0) {
      const staleDataPresent = JSON.stringify(currentSuggestions) === JSON.stringify(originalSuggestions);
      expect(staleDataPresent).toBe(false);
    }
  });

  test('should only show autocomplete after user types in new form', async ({ page }) => {
    // Scenario: Previous search for "coffee", cancel, reopen, only show autocomplete after typing

    // First form: search for "coffee"
    await appointmentForm.openForm();
    await appointmentForm.typeTitle('coffee');
    await appointmentForm.waitForAutocomplete();

    // Cancel
    await page.keyboard.press('Escape');
    await appointmentForm.titleInput.waitFor({ state: 'hidden', timeout: 5000 });

    // Open new form
    await appointmentForm.openForm();

    // Before typing: no autocomplete should be visible
    await appointmentForm.titleInput.click();
    await page.waitForTimeout(300);

    let suggestionsBeforeTyping = await appointmentForm.getAutocompleteCount();
    expect(suggestionsBeforeTyping).toBe(0);

    // After typing: autocomplete should appear
    await appointmentForm.typeTitle('m');
    await appointmentForm.waitForAutocomplete();

    // Now suggestions may appear (if backend has matching data)
    // The key is they should be for "m", not for "coffee"
    const titleValue = await appointmentForm.getTitleValue();
    expect(titleValue).toBe('m');
  });
});
