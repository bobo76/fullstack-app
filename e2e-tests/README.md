# E2E Tests - Calendar Application

End-to-end tests for the Calendar Application using Playwright.

## Prerequisites

- Node.js installed
- Frontend app running on `http://localhost:4200` (or will auto-start)
- Backend API running on `http://localhost:8080`

## Installation

```bash
npm install
npx playwright install chromium
```

## Running Tests

```bash
# Run all tests (headless)
npm test

# Run tests with browser visible
npm run test:headed

# Run tests in debug mode (step through)
npm run test:debug

# Run tests with Playwright UI (interactive)
npm run test:ui

# View last test report
npm run report
```

## Test Structure

```
e2e-tests/
├── tests/
│   ├── example.spec.ts                    # Basic smoke tests
│   └── appointment-autocomplete.spec.ts   # Autocomplete feature tests
├── playwright.config.ts                   # Playwright configuration
└── package.json
```

## Writing Tests

Tests use Playwright's API. Example:

```typescript
import { test, expect } from '@playwright/test';

test('should do something', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: /create/i })).toBeVisible();
});
```

## Configuration

- **Base URL**: `http://localhost:4200` (configured in `playwright.config.ts`)
- **Browser**: Chromium only (can add Firefox/WebKit if needed)
- **Auto-start**: Frontend dev server starts automatically if not running
- **Screenshots**: Captured on failure
- **Videos**: Captured on failure
- **Trace**: Captured on retry

## CI/CD

Tests are configured to run with:
- 2 retries on CI
- Sequential execution on CI
- Parallel execution locally

Set `CI=true` environment variable in your CI pipeline.

## Troubleshooting

**Tests timeout waiting for app:**
- Ensure frontend builds successfully: `cd ../frontend && yarn build`
- Check if port 4200 is available

**Autocomplete tests fail:**
- Backend must be running on port 8080
- Backend needs sample appointment data for suggestions

**Selectors not found:**
- Update selectors in test files to match your actual components
- Use `npm run test:debug` to inspect page during test
