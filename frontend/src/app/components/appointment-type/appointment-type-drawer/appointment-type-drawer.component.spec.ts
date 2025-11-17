import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentTypeDrawerComponent } from './appointment-type-drawer.component';
import { AppointmentTypeService } from '../../../services/appointment-type.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { AppointmentType } from '../../../models/appointment-type.model';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('AppointmentTypeDrawerComponent', () => {
  let component: AppointmentTypeDrawerComponent;
  let fixture: ComponentFixture<AppointmentTypeDrawerComponent>;
  let mockAppointmentTypeService: jest.Mocked<Partial<AppointmentTypeService>>;
  let mockSnackBar: jest.Mocked<Partial<MatSnackBar>>;

  const mockAppointmentType: AppointmentType = {
    id: 1,
    name: 'Meeting',
    color: '#1976d2'
  };

  beforeEach(async () => {
    mockAppointmentTypeService = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };
    mockSnackBar = {
      open: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [AppointmentTypeDrawerComponent, BrowserAnimationsModule],
      providers: [
        { provide: AppointmentTypeService, useValue: mockAppointmentTypeService },
        { provide: MatSnackBar, useValue: mockSnackBar }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentTypeDrawerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('appointmentType', mockAppointmentType);
    fixture.componentRef.setInput('isNew', false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create new appointment type', (done) => {
    fixture.componentRef.setInput('isNew', true);
    (mockAppointmentTypeService.create as jest.Mock).mockReturnValue(of(mockAppointmentType));

    component.save.subscribe(() => {
      expect(mockAppointmentTypeService.create).toHaveBeenCalled();
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Appointment type created successfully',
        'Dismiss',
        { duration: 3000 }
      );
      done();
    });

    component.onSave(mockAppointmentType);
  });

  it('should update existing appointment type', (done) => {
    (mockAppointmentTypeService.update as jest.Mock).mockReturnValue(of(mockAppointmentType));

    component.save.subscribe(() => {
      expect(mockAppointmentTypeService.update).toHaveBeenCalledWith(1, {
        name: 'Meeting',
        color: '#1976d2'
      });
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Appointment type updated successfully',
        'Dismiss',
        { duration: 3000 }
      );
      done();
    });

    component.onSave(mockAppointmentType);
  });

  it('should handle create error', (done) => {
    fixture.componentRef.setInput('isNew', true);
    const error = new Error('Create failed');
    (mockAppointmentTypeService.create as jest.Mock).mockReturnValue(throwError(() => error));

    component.onSave(mockAppointmentType);

    setTimeout(() => {
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Failed to create appointment type',
        'Dismiss',
        { duration: 3000 }
      );
      done();
    }, 0);
  });

  it('should handle update error', (done) => {
    const error = new Error('Update failed');
    (mockAppointmentTypeService.update as jest.Mock).mockReturnValue(throwError(() => error));

    component.onSave(mockAppointmentType);

    setTimeout(() => {
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Failed to update appointment type',
        'Dismiss',
        { duration: 3000 }
      );
      done();
    }, 0);
  });

  it('should emit close event on cancel', (done) => {
    component.close.subscribe(() => {
      expect(true).toBe(true);
      done();
    });

    component.onCancel();
  });

  it('should delete appointment type with confirmation', (done) => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    (mockAppointmentTypeService.delete as jest.Mock).mockReturnValue(of(void 0));

    let saveEmitted = false;
    component.save.subscribe(() => {
      saveEmitted = true;
    });

    component.onDelete();

    setTimeout(() => {
      expect(mockAppointmentTypeService.delete).toHaveBeenCalledWith(1);
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Appointment type deleted successfully',
        'Dismiss',
        { duration: 3000 }
      );
      expect(saveEmitted).toBe(true);
      done();
    }, 0);
  });

  it('should not delete if confirmation is cancelled', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(false);

    component.onDelete();

    expect(mockAppointmentTypeService.delete).not.toHaveBeenCalled();
  });

  it('should handle delete error', (done) => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    const error = new Error('Delete failed');
    (mockAppointmentTypeService.delete as jest.Mock).mockReturnValue(throwError(() => error));

    component.onDelete();

    setTimeout(() => {
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Failed to delete appointment type',
        'Dismiss',
        { duration: 3000 }
      );
      done();
    }, 0);
  });
});
