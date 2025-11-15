import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { WebSocketService } from './websocket.service';

describe('WebSocketService', () => {
  let service: WebSocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WebSocketService, provideHttpClient()]
    });
    service = TestBed.inject(WebSocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAppointmentEvents', () => {
    it('should return an observable', (done) => {
      service.getAppointmentEvents().subscribe({
        next: (event) => {
          expect(event).toBeTruthy();
          expect(event.eventType).toBe('CREATED');
          done();
        }
      });

      // Trigger a next value
      setTimeout(() => {
        service['appointmentEventsSubject'].next({
          eventType: 'CREATED',
          appointment: {
            id: 1,
            title: 'Test',
            startTime: '2025-11-13T10:00:00',
            endTime: '2025-11-13T11:00:00',
            reminderMinutes: 15
          },
          timestamp: '2025-11-13T10:00:00'
        });
      }, 10);
    });

    it('should handle UPDATED events', (done) => {
      service.getAppointmentEvents().subscribe({
        next: (event) => {
          expect(event.eventType).toBe('UPDATED');
          expect(event.appointment.title).toBe('Updated Meeting');
          done();
        }
      });

      setTimeout(() => {
        service['appointmentEventsSubject'].next({
          eventType: 'UPDATED',
          appointment: {
            id: 1,
            title: 'Updated Meeting',
            startTime: '2025-11-13T10:00:00',
            endTime: '2025-11-13T11:00:00',
            reminderMinutes: 15
          },
          timestamp: '2025-11-13T10:00:00'
        });
      }, 10);
    });

    it('should handle DELETED events', (done) => {
      service.getAppointmentEvents().subscribe({
        next: (event) => {
          expect(event.eventType).toBe('DELETED');
          expect(event.appointment.id).toBe(1);
          done();
        }
      });

      setTimeout(() => {
        service['appointmentEventsSubject'].next({
          eventType: 'DELETED',
          appointment: {
            id: 1,
            title: 'Deleted Meeting',
            startTime: '2025-11-13T10:00:00',
            endTime: '2025-11-13T11:00:00',
            reminderMinutes: 15
          },
          timestamp: '2025-11-13T10:00:00'
        });
      }, 10);
    });
  });

  describe('getReminders', () => {
    it('should return an observable', (done) => {
      service.getReminders().subscribe({
        next: (reminder) => {
          expect(reminder).toBeTruthy();
          expect(reminder.appointmentId).toBe(1);
          done();
        }
      });

      // Trigger a next value
      setTimeout(() => {
        service['reminderSubject'].next({
          appointmentId: 1,
          title: 'Test Meeting',
          startTime: '2025-11-13T10:00:00',
          minutesBefore: 15
        });
      }, 10);
    });

    it('should emit reminders with correct structure', (done) => {
      service.getReminders().subscribe({
        next: (reminder) => {
          expect(reminder.appointmentId).toBeDefined();
          expect(reminder.title).toBeDefined();
          expect(reminder.startTime).toBeDefined();
          expect(reminder.minutesBefore).toBeDefined();
          done();
        }
      });

      setTimeout(() => {
        service['reminderSubject'].next({
          appointmentId: 2,
          title: 'Important Meeting',
          startTime: '2025-11-13T14:00:00',
          minutesBefore: 30
        });
      }, 10);
    });
  });

  describe('isConnected', () => {
    it('should return false initially', () => {
      expect(service.isConnected()).toBe(false);
    });

    it('should return true when connected', () => {
      service['connected'] = true;
      expect(service.isConnected()).toBe(true);
    });

    it('should return false when disconnected', () => {
      service['connected'] = false;
      expect(service.isConnected()).toBe(false);
    });
  });

  describe('disconnect', () => {
    it('should disconnect the STOMP client when connected', () => {
      const mockClient = {
        deactivate: jest.fn()
      };
      service['stompClient'] = mockClient as any;

      service.disconnect();

      expect(mockClient.deactivate).toHaveBeenCalled();
      expect(service['stompClient']).toBeNull();
    });

    it('should not throw error when client is not initialized', () => {
      service['stompClient'] = null;

      expect(() => service.disconnect()).not.toThrow();
    });

    it('should set client to null after disconnect', () => {
      const mockClient = {
        deactivate: jest.fn()
      };
      service['stompClient'] = mockClient as any;

      service.disconnect();

      expect(service['stompClient']).toBeNull();
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete subjects on destroy', () => {
      const appointmentEventsSpy = jest.spyOn(service['appointmentEventsSubject'], 'complete');
      const reminderSpy = jest.spyOn(service['reminderSubject'], 'complete');

      service.ngOnDestroy();

      expect(appointmentEventsSpy).toHaveBeenCalled();
      expect(reminderSpy).toHaveBeenCalled();
    });

    it('should disconnect when destroyed', () => {
      const mockClient = {
        deactivate: jest.fn()
      };
      service['stompClient'] = mockClient as any;
      const disconnectSpy = jest.spyOn(service, 'disconnect');

      service.ngOnDestroy();

      expect(disconnectSpy).toHaveBeenCalled();
    });
  });
});
