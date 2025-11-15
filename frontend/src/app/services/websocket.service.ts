import { Injectable, inject, OnDestroy } from '@angular/core';
import { Client, StompSubscription } from '@stomp/stompjs';
import { Subject, Observable } from 'rxjs';
import { AppointmentEvent } from '../models/appointment.model';
import { ReminderNotification } from '../models/reminder.model';
import { environment } from '../../environments/environment';
import { AppointmentService } from './appointment.service';
import { devLog, devError, isTestEnvironment } from '../utils/environment.utils';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService implements OnDestroy {
  private appointmentService = inject(AppointmentService);
  private stompClient: Client | null = null;
  private appointmentEventsSubject = new Subject<AppointmentEvent>();
  private reminderSubject = new Subject<ReminderNotification>();
  private connected = false;
  private appointmentSubscription: StompSubscription | null = null;
  private reminderSubscription: StompSubscription | null = null;

  connect(): void {
    if (this.connected) {
      devLog('WebSocket already connected');
      return;
    }

    devLog('Connecting to WebSocket at', environment.wsUrl);

    this.stompClient = new Client({
      brokerURL: environment.wsUrl,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (environment.production || isTestEnvironment()) ? undefined : (str) => {
        devLog('STOMP Debug:', str);
      },
      onConnect: () => {
        devLog('WebSocket connected successfully');
        this.connected = true;
        this.subscribeToTopics();
      },
      onDisconnect: () => {
        devLog('WebSocket disconnected');
        this.connected = false;
      },
      onStompError: (frame) => {
        devError('STOMP error:', frame.headers['message']);
        devError('Error details:', frame.body);
      },
      onWebSocketError: (event) => {
        devError('WebSocket error:', event);
      },
      onWebSocketClose: (event) => {
        devLog('WebSocket closed:', event.code, event.reason);
      },
    });

    this.stompClient.activate();
  }

  private subscribeToTopics(): void {
    if (!this.stompClient) {
      devError('Cannot subscribe: STOMP client is null');
      return;
    }

    devLog('Subscribing to WebSocket topics...');

    // Subscribe to appointment updates
    this.appointmentSubscription = this.stompClient.subscribe(
      '/topic/appointments',
      (message) => {
        devLog('Received appointment event:', message.body);
        try {
          const event: AppointmentEvent = JSON.parse(message.body);
          this.appointmentEventsSubject.next(event);
          this.handleAppointmentEvent(event);
        } catch (error) {
          devError('Error parsing appointment event:', error);
        }
      }
    );
    devLog('Subscribed to /topic/appointments');

    // Subscribe to user-specific reminders
    this.reminderSubscription = this.stompClient.subscribe(
      '/user/queue/reminders',
      (message) => {
        devLog('Received reminder:', message.body);
        try {
          const reminder: ReminderNotification = JSON.parse(message.body);
          this.reminderSubject.next(reminder);
        } catch (error) {
          devError('Error parsing reminder:', error);
        }
      }
    );
    devLog('Subscribed to /user/queue/reminders');
  }

  private handleAppointmentEvent(event: AppointmentEvent): void {
    switch (event.eventType) {
      case 'CREATED':
        this.appointmentService.addAppointment(event.appointment);
        break;
      case 'UPDATED':
        this.appointmentService.updateAppointment(event.appointment);
        break;
      case 'DELETED':
        if (event.appointment.id) {
          this.appointmentService.removeAppointment(event.appointment.id);
        }
        break;
    }
  }

  getAppointmentEvents(): Observable<AppointmentEvent> {
    return this.appointmentEventsSubject.asObservable();
  }

  getReminders(): Observable<ReminderNotification> {
    return this.reminderSubject.asObservable();
  }

  disconnect(): void {
    if (this.appointmentSubscription) {
      this.appointmentSubscription.unsubscribe();
      this.appointmentSubscription = null;
    }

    if (this.reminderSubscription) {
      this.reminderSubscription.unsubscribe();
      this.reminderSubscription = null;
    }

    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
      this.connected = false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.appointmentEventsSubject.complete();
    this.reminderSubject.complete();
  }
}
