import { Instant } from '../models/instant.type';

/**
 * Converts a Date object to ISO 8601 UTC timestamp (Instant format).
 * Output format: "2025-11-13T18:35:00Z"
 */
export function toInstant(date: Date): Instant {
  return date.toISOString().split('.')[0] + 'Z';
}

/**
 * Parses an ISO 8601 UTC timestamp (Instant) to a Date object.
 * Instant format: "2025-11-13T23:35:00Z" or "2025-11-13T23:35:00.000Z"
 */
export function parseInstant(instantStr: Instant): Date {
  return new Date(instantStr);
}
