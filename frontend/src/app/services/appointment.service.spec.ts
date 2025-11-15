import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AppointmentService } from './appointment.service';
import { Appointment } from '../models/appointment.model';

describe('AppointmentService', () => {
  let service: AppointmentService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8080/api/appointments';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AppointmentService]
    });
    service = TestBed.inject(AppointmentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should fetch all appointments and update signal', () => {
      const mockAppointments: Appointment[] = [
        {
          id: 1,
          title: 'Test Appointment',
          startTime: '2025-11-13T10:00:00',
          endTime: '2025-11-13T11:00:00',
          reminderMinutes: 15
        }
      ];

      service.getAll().subscribe();

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockAppointments);

      expect(service.appointments().length).toBe(1);
      expect(service.appointments()[0].title).toBe('Test Appointment');
    });

    it('should handle errors gracefully', () => {
      const errorSpy = jest.fn();

      service.getAll().subscribe({
        error: errorSpy
      });

      const req = httpMock.expectOne(apiUrl);
      req.error(new ProgressEvent('Network error'));

      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should fetch appointment by id', (done) => {
      const mockAppointment: Appointment = {
        id: 1,
        title: 'Test Appointment',
        startTime: '2025-11-13T10:00:00',
        endTime: '2025-11-13T11:00:00',
        reminderMinutes: 15
      };

      service.getById(1).subscribe(appointment => {
        expect(appointment.id).toBe(1);
        expect(appointment.title).toBe('Test Appointment');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAppointment);
    });
  });

  describe('create', () => {
    it('should create an appointment and update signal', (done) => {
      const newAppointment: Appointment = {
        title: 'New Appointment',
        startTime: '2025-11-13T10:00:00',
        endTime: '2025-11-13T11:00:00',
        reminderMinutes: 15
      };

      const createdAppointment = { ...newAppointment, id: 1 };

      service.create(newAppointment).subscribe(appointment => {
        expect(appointment.id).toBe(1);
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newAppointment);
      req.flush(createdAppointment);

      expect(service.appointments().length).toBe(1);
    });
  });

  describe('update', () => {
    it('should update an appointment with PATCH', (done) => {
      const updates = { title: 'Updated Title' };

      service.update(1, updates).subscribe(appointment => {
        expect(appointment.title).toBe('Updated Title');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updates);
      req.flush({ id: 1, ...updates });
    });
  });

  describe('delete', () => {
    it('should delete an appointment and update signal', () => {
      // Add an appointment first
      service['appointmentsSignal'].set([
        {
          id: 1,
          title: 'Test',
          startTime: '2025-11-13T10:00:00',
          endTime: '2025-11-13T11:00:00',
          reminderMinutes: 15
        }
      ]);

      expect(service.appointments().length).toBe(1);

      service.delete(1).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);

      expect(service.appointments().length).toBe(0);
    });
  });

  describe('getByDateRange', () => {
    it('should fetch appointments by date range with query params', (done) => {
      const start = '2025-11-13T00:00:00';
      const end = '2025-11-13T23:59:59';
      const mockAppointments: Appointment[] = [
        {
          id: 1,
          title: 'Test',
          startTime: '2025-11-13T10:00:00',
          endTime: '2025-11-13T11:00:00',
          reminderMinutes: 15
        }
      ];

      service.getByDateRange(start, end).subscribe(appointments => {
        expect(appointments.length).toBe(1);
        done();
      });

      const req = httpMock.expectOne((request) => {
        return request.url === apiUrl &&
               request.params.get('start') === start &&
               request.params.get('end') === end;
      });
      expect(req.request.method).toBe('GET');
      req.flush(mockAppointments);
    });
  });
});
