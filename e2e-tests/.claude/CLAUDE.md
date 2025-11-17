# E2E Tests - Calendar Application

## Project Context

This is the end-to-end testing suite for the Calendar Application using Playwright.

**Goal:** Comprehensive E2E testing for UI interactions, user flows, and integration testing
**Tech Stack:** Playwright, TypeScript, Chromium
**Key Components:** Page Object Models, test fixtures, visual regression tests
**Priorities:** Test reliability > Coverage > Speed > Maintainability

## Coding Preferences

### Playwright Best Practices

- **Page Object Model (POM)**: ALWAYS use POM pattern - no direct page interactions in tests
- **Locator Strategy**: Prefer accessibility selectors in order:
  1. `getByRole()` - best for accessibility
  2. `getByLabel()` - for form fields
  3. `getByText()` - for visible text
  4. `getByTestId()` - last resort, requires adding data-testid attributes
  5. Avoid CSS selectors unless necessary
- **Avoid Flaky Tests**:
  - NO `waitForTimeout()` unless absolutely necessary
  - Use `waitFor()`, `waitForLoadState()`, or element visibility
  - Set up network listeners BEFORE user actions
  - Use `page.route()` for request interception
- **Test Independence**: Each test should run independently (no shared state)
- **Assertions**: Use Playwright's built-in expect with auto-waiting

### TypeScript Standards

- Use strict TypeScript settings
- Type all Page Object methods with return types
- Use async/await for all Playwright operations
- Prefer `const` over `let`
- Use interfaces for test data structures

### Test Organization

```
tests/
├── helpers/
│   ├── page-objects.ts       # Page Object Models
│   ├── fixtures.ts            # Test fixtures and test data
│   └── utils.ts               # Helper functions
├── feature-name.spec.ts       # Feature-specific tests
└── integration/               # Integration test flows
```

### Page Object Pattern

**Required structure:**

```typescript
export class FeaturePage {
  readonly page: Page;
  readonly locator1: Locator;
  readonly locator2: Locator;

  constructor(page: Page) {
    this.page = page;
    this.locator1 = page.getByRole('button', { name: /submit/i });
    this.locator2 = page.getByLabel(/email/i);
  }

  async performAction(): Promise<void> {
    await this.locator1.click();
  }

  async getValue(): Promise<string> {
    return await this.locator2.inputValue();
  }

  async waitForReady(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }
}
```

**Rules:**
- Define locators in constructor, not in methods
- All methods should be async
- Include wait methods for page readiness
- Return typed values (Promise<void>, Promise<string>, etc.)
- No test assertions in Page Objects

### Test Structure

**Required pattern:**

```typescript
import { test, expect } from '@playwright/test';
import { FeaturePage } from './helpers/page-objects';

test.describe('Feature Name', () => {
  let featurePage: FeaturePage;

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    featurePage = new FeaturePage(page);
  });

  test('should do something specific', async ({ page }) => {
    // Arrange
    await featurePage.performSetup();

    // Act
    await featurePage.performAction();

    // Assert
    await expect(featurePage.someLocator).toBeVisible();
  });
});
```

### Naming Conventions

- **Test files**: `feature-name.spec.ts` (kebab-case)
- **Page Objects**: `FeatureNamePage` (PascalCase)
- **Test descriptions**: Start with "should" (e.g., "should display error message")
- **Helper functions**: `camelCase`

## Decision Authority

### Always ask first:

- Adding new browser configurations (Firefox, WebKit)
- Changing global timeout settings
- Adding visual regression testing tools
- Major refactoring of Page Objects affecting 3+ tests
- Adding new test data fixtures that require backend setup
- Changing CI/CD test execution strategy
- Adding performance/load testing capabilities

### Don't ask (just do it):

- Adding new tests for existing features
- Fixing flaky tests
- Improving locator strategies
- Adding helper methods to Page Objects
- Updating test assertions
- Adding test comments/documentation

## Testing & Verification

### Required Workflow:

1. Make code changes (tests or Page Objects)
2. **Run tests locally**: `npm test`
3. **Run specific test**: `npm test -- tests/feature.spec.ts`
4. If tests fail, iterate and fix
5. Only report complete after **ALL tests pass**

### Test Commands:

```bash
# Run all tests (headless)
npm test

# Run with browser visible
npm run test:headed

# Debug mode (step through)
npm run test:debug

# Interactive UI mode
npm run test:ui

# Run specific test file
npm test -- tests/calendar-view.spec.ts

# Run tests matching pattern
npm test -- --grep "autocomplete"

# View last report
npm run report
```

### Before Committing:

- [ ] All tests pass locally
- [ ] No `.only` or `.skip` in committed tests
- [ ] Screenshots/videos in gitignore (not committed)
- [ ] Page Objects follow the established pattern

### CI Requirements:

Tests must pass in CI environment:
- No fixed timeouts (use waits)
- No hardcoded timing assumptions
- Handle flaky network conditions
- Clean up test data if creating any

## Error Handling

### Common Issues:

**Flaky tests:**
- Replace `waitForTimeout()` with proper waits
- Set up network listeners before actions
- Use `page.waitForLoadState('networkidle')`

**Strict mode violations:**
- Use `.first()` or `.last()` when multiple elements match
- Make selectors more specific
- Use better role-based selectors

**Timeouts:**
- Increase timeout for specific assertion: `expect(locator).toBeVisible({ timeout: 10000 })`
- Check if page is still loading
- Verify element actually appears in UI

## Technology Stack

**Core:**
- Playwright v1.56+
- TypeScript 5.x
- Node.js (latest LTS)

**Browsers:**
- Chromium (default)
- Firefox (optional)
- WebKit (optional)

**CI/CD:**
- GitHub Actions (or similar)
- Parallel execution
- HTML report generation

## Commands Reference

```bash
# Installation
npm install
npx playwright install chromium

# Running Tests
npm test                          # All tests (headless)
npm run test:headed               # With browser visible
npm run test:debug                # Debug mode
npm run test:ui                   # Interactive UI

# Specific Tests
npm test -- tests/file.spec.ts    # Single file
npm test -- --grep "pattern"      # Matching pattern
npm test -- --project=chromium    # Specific browser

# Reporting
npm run report                    # Open HTML report
npx playwright show-report        # Same as above

# Development
npm test -- --update-snapshots    # Update visual snapshots (if using)
```

## Application Under Test

**Base URL:** `http://localhost:4200` (Angular frontend)
**Backend API:** `http://localhost:8080` (Spring Boot)

**Auto-start:** Frontend dev server starts automatically before tests

**Prerequisites:**
- Backend must be running manually on port 8080
- Backend should have test data for meaningful assertions

## Page Object Models

### Current Page Objects:

**CalendarPage** (`helpers/page-objects.ts`)
- Navigate to calendar
- Check calendar visibility

**AppointmentFormPage** (`helpers/page-objects.ts`)
- Open appointment form (multiple strategies)
- Type in title field
- Handle autocomplete
- Wait for form visibility

### Creating New Page Objects:

1. Add to `helpers/page-objects.ts` or create new file
2. Follow the pattern: constructor with locators, async methods
3. Include wait methods (`waitForReady()`, `waitForFormVisible()`)
4. Return typed values
5. No test assertions in Page Objects
6. Document complex methods

## Test Patterns

### Good Test Example:

```typescript
test('should filter appointments by type', async ({ page }) => {
  // Arrange
  const calendarPage = new CalendarPage(page);
  await calendarPage.goto();

  // Act
  await calendarPage.selectFilter('Meeting');

  // Assert
  const visibleCount = await calendarPage.getVisibleAppointmentCount();
  expect(visibleCount).toBeGreaterThan(0);

  const appointments = await calendarPage.getVisibleAppointments();
  appointments.forEach(apt => {
    expect(apt.type).toBe('Meeting');
  });
});
```

### Bad Test Example (Don't do this):

```typescript
test('should work', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(5000); // ❌ Fixed timeout
  await page.locator('.button').click(); // ❌ CSS selector
  await page.waitForTimeout(1000); // ❌ Another fixed timeout
  expect(page.locator('.error')).toBeVisible(); // ❌ Missing await
});
```

## Debugging Tests

### When tests fail:

1. **Check screenshot** in `test-results/` folder
2. **Watch video** in `test-results/` folder
3. **Run in headed mode**: `npm run test:headed`
4. **Run in debug mode**: `npm run test:debug`
5. **Check error context**: `test-results/[test-name]/error-context.md`
6. **Add console.logs** temporarily (remove before committing)

### Debug Checklist:

- [ ] Is the element actually in the DOM?
- [ ] Is it visible (not `display: none` or `visibility: hidden`)?
- [ ] Is the selector correct?
- [ ] Did the page finish loading?
- [ ] Are there multiple elements matching the selector?
- [ ] Is there a race condition?

## Coverage Goals

### Critical Paths (Must be tested):

- [ ] User can create appointment
- [ ] User can edit appointment
- [ ] User can delete appointment
- [ ] Autocomplete works for title
- [ ] Calendar displays appointments
- [ ] Date range filtering works
- [ ] Appointment types are displayed correctly

### Nice to Have:

- [ ] Drag and drop appointments
- [ ] Resize appointments
- [ ] Real-time updates via WebSocket
- [ ] Reminder notifications
- [ ] Error handling (network failures)
- [ ] Accessibility (keyboard navigation)

## Performance Considerations

- Tests should complete in < 30 seconds each
- Use `fullyParallel: true` for speed
- Avoid unnecessary waits
- Mock network requests for deterministic tests (optional)
- Clean up test data after tests

## Accessibility Testing

When adding new tests, consider:
- Can feature be accessed via keyboard?
- Are proper ARIA labels present?
- Do screen readers work correctly?

Use Playwright's accessibility assertions:
```typescript
await expect(page.getByRole('button')).toBeVisible();
await expect(page.getByLabel('Email')).toBeFocused();
```

## Notes

- This is a UI testing suite - integration with real backend
- Backend must be running for full E2E tests
- No unit tests here - those are in frontend/backend projects
- Visual regression tests not yet implemented (future)
- Tests run against development build (not production)
