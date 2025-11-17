import { test, expect } from '@playwright/test';
import { CalendarPage } from './helpers/page-objects';

test.describe('Calendar Application', () => {
  let calendarPage: CalendarPage;

  test.beforeEach(async ({ page }) => {
    calendarPage = new CalendarPage(page);
    await calendarPage.goto();
  });

  test('should load the homepage', async ({ page }) => {
    // Wait for the app to load
    await expect(page).toHaveTitle(/Calendar/i);
  });

  test('should display the calendar view', async () => {
    // Check if calendar is visible
    const isVisible = await calendarPage.isCalendarVisible();
    expect(isVisible).toBeTruthy();
  });
});
