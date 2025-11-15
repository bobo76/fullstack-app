import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReminderService } from './reminder.service';
import { WebSocketService } from './websocket.service';
import { of } from 'rxjs';

describe('ReminderService', () => {
  let service: ReminderService;
  let wsService: jest.Mocked<WebSocketService>;
  let snackBar: jest.Mocked<MatSnackBar>;

  beforeEach(() => {
    const wsServiceMock = {
      getReminders: jest.fn()
    };

    const snackBarMock = {
      open: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        ReminderService,
        { provide: WebSocketService, useValue: wsServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock }
      ]
    });

    service = TestBed.inject(ReminderService);
    wsService = TestBed.inject(WebSocketService) as jest.Mocked<WebSocketService>;
    snackBar = TestBed.inject(MatSnackBar) as jest.Mocked<MatSnackBar>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initialize', () => {
    it('should subscribe to WebSocket reminders', () => {
      const mockReminder = {
        appointmentId: 1,
        title: 'Test Meeting',
        startTime: '2025-11-13T10:00:00',
        minutesBefore: 15
      };

      wsService.getReminders.mockReturnValue(of(mockReminder));

      service.initialize();

      expect(wsService.getReminders).toHaveBeenCalled();
      expect(snackBar.open).toHaveBeenCalled();
    });

    it('should display snackbar with reminder details', () => {
      const mockReminder = {
        appointmentId: 1,
        title: 'Important Meeting',
        startTime: '2025-11-13T10:00:00',
        minutesBefore: 15
      };

      wsService.getReminders.mockReturnValue(of(mockReminder));

      service.initialize();

      expect(snackBar.open).toHaveBeenCalledWith(
        expect.stringContaining('Important Meeting'),
        expect.any(String),
        expect.any(Object)
      );
    });

    it('should include minutes before in reminder message', () => {
      const mockReminder = {
        appointmentId: 1,
        title: 'Meeting',
        startTime: '2025-11-13T10:00:00',
        minutesBefore: 30
      };

      wsService.getReminders.mockReturnValue(of(mockReminder));

      service.initialize();

      const callArgs = snackBar.open.mock.calls[0];
      expect(callArgs[0]).toContain('30');
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete the destroy subject', () => {
      const nextSpy = jest.spyOn(service['destroy$'], 'next');
      const completeSpy = jest.spyOn(service['destroy$'], 'complete');

      service.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });
});
