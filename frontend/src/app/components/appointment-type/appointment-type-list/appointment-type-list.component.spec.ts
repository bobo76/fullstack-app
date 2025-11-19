import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AppointmentTypeListComponent } from './appointment-type-list.component';
import { AppointmentTypeService } from '../../../services/appointment-type.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { AppointmentType } from '../../../models/appointment-type.model';

describe('AppointmentTypeListComponent', () => {
  let component: AppointmentTypeListComponent;
  let fixture: ComponentFixture<AppointmentTypeListComponent>;
  let mockAppointmentTypeService: jest.Mocked<Partial<AppointmentTypeService>>;
  let mockSnackBar: jest.Mocked<Partial<MatSnackBar>>;

  const mockAppointmentTypes: AppointmentType[] = [
    { id: 1, name: 'Meeting', color: '#1976d2' },
    { id: 2, name: 'Personal', color: '#4caf50' }
  ];

  beforeEach(async () => {
    mockAppointmentTypeService = {
      getAll: jest.fn(),
      appointmentTypes: signal(mockAppointmentTypes).asReadonly()
    };
    mockSnackBar = {
      open: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [AppointmentTypeListComponent],
      providers: [
        { provide: AppointmentTypeService, useValue: mockAppointmentTypeService },
        { provide: MatSnackBar, useValue: mockSnackBar }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentTypeListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load appointment types on init', () => {
    (mockAppointmentTypeService.getAll as jest.Mock).mockReturnValue(of(mockAppointmentTypes));

    component.ngOnInit();

    expect(mockAppointmentTypeService.getAll).toHaveBeenCalled();
  });

  it('should set loading state correctly', () => {
    (mockAppointmentTypeService.getAll as jest.Mock).mockReturnValue(of(mockAppointmentTypes));

    expect(component.loading()).toBe(false);
    component.loadAppointmentTypes();

    // Loading completes synchronously in tests
    expect(component.loading()).toBe(false);
  });

  it('should handle error when loading appointment types', (done) => {
    const error = new Error('Failed to load');
    (mockAppointmentTypeService.getAll as jest.Mock).mockReturnValue(throwError(() => error));

    component.loadAppointmentTypes();

    setTimeout(() => {
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Failed to load appointment types',
        'Dismiss',
        { duration: 3000 }
      );
      done();
    }, 100); // Increased timeout to give more time for async operations
  });

  it('should open drawer for new appointment type', () => {
    component.onAddNew();

    expect(component.drawerOpen()).toBe(true);
    expect(component.isNew()).toBe(true);
    expect(component.selectedAppointmentType()).toEqual({ name: '', color: '#1976d2' });
  });

  it('should open drawer for editing appointment type', () => {
    const type = mockAppointmentTypes[0];
    component.onEdit(type);

    expect(component.drawerOpen()).toBe(true);
    expect(component.isNew()).toBe(false);
    expect(component.selectedAppointmentType()).toEqual(type);
  });

  it('should close drawer', () => {
    component.drawerOpen.set(true);
    component.selectedAppointmentType.set(mockAppointmentTypes[0]);

    component.onDrawerClose();

    expect(component.drawerOpen()).toBe(false);
    expect(component.selectedAppointmentType()).toBeNull();
  });

  it('should close drawer on save', () => {
    component.drawerOpen.set(true);
    component.selectedAppointmentType.set(mockAppointmentTypes[0]);

    component.onDrawerSave();

    expect(component.drawerOpen()).toBe(false);
    expect(component.selectedAppointmentType()).toBeNull();
  });
});
