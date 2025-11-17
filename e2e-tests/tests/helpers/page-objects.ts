import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for Appointment Form
 */
export class AppointmentFormPage {
  readonly page: Page;
  readonly titleInput: Locator;
  readonly autocompleteDropdown: Locator;
  readonly autocompleteOptions: Locator;

  constructor(page: Page) {
    this.page = page;
    this.titleInput = page.getByRole('combobox', { name: /title/i });
    this.autocompleteDropdown = page.locator('mat-autocomplete');
    this.autocompleteOptions = page.locator('mat-option');
  }

  /**
   * Opens the appointment form by trying multiple strategies
   */
  async openForm(): Promise<void> {
    const timeSlot = this.page.locator('.time-slot, .calendar-slot, [data-testid="time-slot"]').first();
    const createButton = this.page.getByRole('button', { name: /create|new|add/i }).first();

    // Try create button first
    const isCreateButtonVisible = await createButton.isVisible().catch(() => false);
    if (isCreateButtonVisible) {
      await createButton.click();
      await this.waitForFormVisible();
      return;
    }

    // Try time slot
    const isTimeSlotVisible = await timeSlot.isVisible().catch(() => false);
    if (isTimeSlotVisible) {
      await timeSlot.click();
      await this.waitForFormVisible();
      return;
    }

    // Fallback: click calendar
    await this.page.locator('app-week-view, app-day-view, .calendar-container').first().click();
    await this.waitForFormVisible();
  }

  /**
   * Wait for the form to be visible
   */
  async waitForFormVisible(): Promise<void> {
    await this.titleInput.waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Type in the title field
   */
  async typeTitle(text: string): Promise<void> {
    await this.titleInput.fill(text);
  }

  /**
   * Type character by character (for testing debounce)
   */
  async typeSlowly(text: string, delay: number = 50): Promise<void> {
    await this.titleInput.pressSequentially(text, { delay });
  }

  /**
   * Wait for autocomplete to appear
   */
  async waitForAutocomplete(): Promise<void> {
    // Wait for debounce (300ms) + network request + render
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get autocomplete suggestion count
   */
  async getAutocompleteCount(): Promise<number> {
    return await this.autocompleteOptions.count();
  }

  /**
   * Select first autocomplete suggestion
   */
  async selectFirstSuggestion(): Promise<void> {
    await this.autocompleteOptions.first().click();
  }

  /**
   * Get current title value
   */
  async getTitleValue(): Promise<string> {
    return await this.titleInput.inputValue();
  }
}

/**
 * Page Object Model for Calendar View
 */
export class CalendarPage {
  readonly page: Page;
  readonly calendarView: Locator;

  constructor(page: Page) {
    this.page = page;
    this.calendarView = page.locator('app-calendar-view').first();
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async isCalendarVisible(): Promise<boolean> {
    return await this.calendarView.isVisible();
  }
}
