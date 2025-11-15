import { Instant } from './instant.type';

export interface AppointmentType {
  id?: number;
  name: string;
  color: string;
  createdAt?: Instant;
}
