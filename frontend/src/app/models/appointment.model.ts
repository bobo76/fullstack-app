import { AppointmentType } from './appointment-type.model';
import { Instant } from './instant.type';

export interface Appointment {
  id?: number;
  title: string;
  description?: string;
  startTime: Instant;
  endTime: Instant;
  appointmentType?: AppointmentType;
  appointmentTypeId?: number;
  reminderMinutes?: number;
  createdAt?: Instant;
  updatedAt?: Instant;
}

export type AppointmentEventType = 'CREATED' | 'UPDATED' | 'DELETED';

export interface AppointmentEvent {
  eventType: AppointmentEventType;
  appointment: Appointment;
  timestamp: Instant;
}
