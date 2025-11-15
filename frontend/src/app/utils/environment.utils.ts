/**
 * Check if running in test environment (Jest)
 */
export function isTestEnvironment(): boolean {
  return typeof globalThis !== 'undefined' && (globalThis as any).IS_TEST_ENV === true;
}

/**
 * Conditionally log only in non-test environments
 */
export function devLog(...args: any[]): void {
  if (!isTestEnvironment()) {
    console.log(...args);
  }
}

/**
 * Conditionally error only in non-test environments
 */
export function devError(...args: any[]): void {
  if (!isTestEnvironment()) {
    console.error(...args);
  }
}
