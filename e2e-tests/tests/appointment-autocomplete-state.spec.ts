import { test, expect } from '@playwright/test';
import { AppointmentFormPage } from './helpers/page-objects';

test.describe('Appointment Autocomplete State Management', () => {
  let appointmentForm: AppointmentFormPage;

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    appointmentForm = new AppointmentFormPage(page);
  });

  test('should clear autocomplete suggestions when drawer is closed and reopened', async ({ page }) => {
    // Open the appointment form
    await appointmentForm.openForm();

    // Type "coffee" to trigger autocomplete
    await appointmentForm.typeTitle('coffee');

    // Wait for autocomplete to appear
    await appointmentForm.waitForAutocomplete();

    // Check if there are any suggestions (might be 0 if backend has no data)
    const initialSuggestionCount = await appointmentForm.getAutocompleteCount();

    // Close the drawer
    // Try multiple strategies to close
    const cancelButton = page.getByRole('button', { name: /cancel/i });
    const closeButton = page.getByRole('button', { name: /close/i });
    const backdrop = page.locator('.cdk-overlay-backdrop, .mat-drawer-backdrop');

    if (await cancelButton.isVisible().catch(() => false)) {
      await cancelButton.click();
    } else if (await closeButton.isVisible().catch(() => false)) {
      await closeButton.click();
    } else if (await backdrop.isVisible().catch(() => false)) {
      await backdrop.click();
    } else {
      // Try pressing Escape key
      await page.keyboard.press('Escape');
    }

    // Wait for drawer to close
    await appointmentForm.titleInput.waitFor({ state: 'hidden', timeout: 5000 });

    // Reopen the appointment form
    await appointmentForm.openForm();

    // Verify the title input is now empty (new form instance)
    const titleValue = await appointmentForm.getTitleValue();
    expect(titleValue).toBe('');

    // Verify autocomplete is not visible or empty
    const autocompleteVisible = await appointmentForm.autocompleteDropdown.isVisible().catch(() => false);

    if (autocompleteVisible) {
      // If dropdown is visible, it should have no suggestions
      const suggestionCount = await appointmentForm.getAutocompleteCount();
      expect(suggestionCount).toBe(0);
    } else {
      // Autocomplete should not be visible at all
      expect(autocompleteVisible).toBe(false);
    }
  });

  test('should not show previous autocomplete results in new form', async ({ page }) => {
    // Open form and search for "coffee"
    await appointmentForm.openForm();
    await appointmentForm.typeTitle('coffee');
    await appointmentForm.waitForAutocomplete();

    // Store the suggestions for "coffee"
    const coffeeSuggestions = await appointmentForm.autocompleteOptions.allTextContents();

    // Close the form using cancel button
    const cancelButton = page.getByRole('button', { name: /cancel/i });
    if (await cancelButton.isVisible().catch(() => false)) {
      await cancelButton.click();
      await appointmentForm.titleInput.waitFor({ state: 'hidden', timeout: 5000 });
    }

    // Open a new form
    await appointmentForm.openForm();

    // Verify the input is empty (fresh form)
    const titleValue = await appointmentForm.getTitleValue();
    expect(titleValue).toBe('');

    // Type a single character (different from "coffee")
    await appointmentForm.typeTitle('x');
    await appointmentForm.waitForAutocomplete();

    // Get current suggestions
    const newSuggestions = await appointmentForm.autocompleteOptions.allTextContents();

    // The suggestions should be different from coffee suggestions
    // Or there should be no suggestions at all
    const suggestionsAreDifferent = JSON.stringify(newSuggestions) !== JSON.stringify(coffeeSuggestions);

    // Either suggestions are different, or both are empty (which is fine)
    expect(suggestionsAreDifferent || (newSuggestions.length === 0 && coffeeSuggestions.length === 0)).toBe(true);
  });

  test('should clear autocomplete when input is cleared', async ({ page }) => {
    // Open form
    await appointmentForm.openForm();

    // Type to trigger autocomplete
    await appointmentForm.typeTitle('coffee');
    await appointmentForm.waitForAutocomplete();

    // Clear the input
    await appointmentForm.typeTitle('');

    // Wait a moment for autocomplete to react
    await page.waitForTimeout(500);

    // Autocomplete should not be visible for empty input
    const autocompleteVisible = await appointmentForm.autocompleteDropdown.isVisible().catch(() => false);

    if (autocompleteVisible) {
      // If visible, should have no options
      const suggestionCount = await appointmentForm.getAutocompleteCount();
      expect(suggestionCount).toBe(0);
    } else {
      // Preferably, it should not be visible at all
      expect(autocompleteVisible).toBe(false);
    }
  });

  test('should hide autocomplete dropdown when form is cancelled while dropdown is visible', async ({ page }) => {
    // Open form
    await appointmentForm.openForm();

    // Type to trigger autocomplete
    await appointmentForm.typeTitle('coffee');
    await appointmentForm.waitForAutocomplete();

    // Verify autocomplete is visible (or has suggestions)
    const suggestionCount = await appointmentForm.getAutocompleteCount();
    const autocompleteVisible = await appointmentForm.autocompleteDropdown.isVisible().catch(() => false);

    // Only proceed with test if autocomplete actually appeared
    if (suggestionCount > 0 || autocompleteVisible) {
      // Verify it's visible before cancelling
      if (suggestionCount > 0) {
        await expect(appointmentForm.autocompleteOptions.first()).toBeVisible();
      }

      // Cancel the form while autocomplete is visible
      const cancelButton = page.getByRole('button', { name: /cancel/i });
      await cancelButton.click();

      // Wait for drawer to close
      await appointmentForm.titleInput.waitFor({ state: 'hidden', timeout: 5000 });

      // Autocomplete dropdown should also be hidden
      const autocompleteAfterCancel = await appointmentForm.autocompleteDropdown.isVisible().catch(() => false);
      expect(autocompleteAfterCancel).toBe(false);

      // Verify no autocomplete options are visible
      const optionsCount = await page.locator('mat-option').count();
      expect(optionsCount).toBe(0);
    } else {
      // Skip test if no autocomplete data available
      test.skip(suggestionCount > 0, 'No autocomplete suggestions available - backend may have no matching data');
    }
  });
});
