import { Instant } from './instant.type';

export interface ReminderNotification {
  appointmentId: number;
  title: string;
  startTime: Instant;
  minutesBefore: number;
}
