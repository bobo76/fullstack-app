import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';
import '@testing-library/jest-dom';

setupZoneTestEnv();

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Suppress CSS parsing errors from jsdom (Angular Material CSS with @layer)
const originalConsoleError = console.error;
global.console.error = (...args: any[]) => {
  const firstArg = args[0];
  const errorString = String(firstArg);

  // Suppress jsdom CSS parsing errors (check multiple ways)
  if (
    (typeof firstArg === 'string' && firstArg.includes('Could not parse CSS stylesheet')) ||
    errorString.includes('Could not parse CSS stylesheet') ||
    (firstArg instanceof Error &&
      (firstArg.message.includes('Could not parse CSS stylesheet') ||
       (firstArg as any).type === 'css parsing'))
  ) {
    return;
  }

  // Suppress other common test noise
  if (
    typeof firstArg === 'string' &&
    (firstArg.includes('Not implemented: HTMLFormElement.prototype.requestSubmit') ||
     firstArg.includes('Error: Uncaught [Error: Could not parse CSS stylesheet]'))
  ) {
    return;
  }

  originalConsoleError.apply(console, args);
};

// Optionally suppress warnings
const originalConsoleWarn = console.warn;
global.console.warn = (...args: any[]) => {
  // Keep warnings for now, but could filter specific ones here
  originalConsoleWarn.apply(console, args);
};
