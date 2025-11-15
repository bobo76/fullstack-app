import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AppointmentTypeService } from './appointment-type.service';
import { AppointmentType } from '../models/appointment-type.model';

describe('AppointmentTypeService', () => {
  let service: AppointmentTypeService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8080/api/appointment-types';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AppointmentTypeService]
    });
    service = TestBed.inject(AppointmentTypeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should fetch all appointment types', (done) => {
      const mockTypes: AppointmentType[] = [
        { id: 1, name: 'Personal', color: '#3B82F6' },
        { id: 2, name: 'Professional', color: '#8B5CF6' }
      ];

      service.getAll().subscribe(types => {
        expect(types.length).toBe(2);
        expect(types[0].name).toBe('Personal');
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockTypes);
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
    it('should fetch appointment type by id', (done) => {
      const mockType: AppointmentType = {
        id: 1,
        name: 'Personal',
        color: '#3B82F6'
      };

      service.getById(1).subscribe(type => {
        expect(type.id).toBe(1);
        expect(type.name).toBe('Personal');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockType);
    });
  });

  describe('create', () => {
    it('should create an appointment type', (done) => {
      const newType: AppointmentType = {
        name: 'Meeting',
        color: '#F59E0B'
      };

      const createdType = { ...newType, id: 1 };

      service.create(newType).subscribe(type => {
        expect(type.id).toBe(1);
        expect(type.name).toBe('Meeting');
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newType);
      req.flush(createdType);
    });
  });

  describe('update', () => {
    it('should update an appointment type with PATCH', (done) => {
      const updates = { color: '#FF0000' };

      service.update(1, updates).subscribe(type => {
        expect(type.color).toBe('#FF0000');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updates);
      req.flush({ id: 1, name: 'Personal', ...updates });
    });
  });

  describe('delete', () => {
    it('should delete an appointment type', (done) => {
      service.delete(1).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });
});
