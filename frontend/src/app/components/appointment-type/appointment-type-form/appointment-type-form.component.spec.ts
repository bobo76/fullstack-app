import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentTypeFormComponent } from './appointment-type-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AppointmentType } from '../../../models/appointment-type.model';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('AppointmentTypeFormComponent', () => {
  let component: AppointmentTypeFormComponent;
  let fixture: ComponentFixture<AppointmentTypeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentTypeFormComponent, ReactiveFormsModule, BrowserAnimationsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentTypeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.form.get('name')?.value).toBe('');
    expect(component.form.get('color')?.value).toBe('#1976d2');
  });

  it('should require name field', () => {
    const nameControl = component.form.get('name');
    nameControl?.setValue('');
    expect(nameControl?.hasError('required')).toBe(true);
  });

  it('should require minimum 2 characters for name', () => {
    const nameControl = component.form.get('name');
    nameControl?.setValue('A');
    expect(nameControl?.hasError('minlength')).toBe(true);

    nameControl?.setValue('AB');
    expect(nameControl?.hasError('minlength')).toBe(false);
  });

  it('should validate color format', () => {
    const colorControl = component.form.get('color');

    colorControl?.setValue('invalid');
    expect(colorControl?.hasError('pattern')).toBe(true);

    colorControl?.setValue('#1976d2');
    expect(colorControl?.hasError('pattern')).toBe(false);
  });

  it('should populate form when appointmentType input changes', () => {
    const type: AppointmentType = { id: 1, name: 'Meeting', color: '#ff5722' };

    fixture.componentRef.setInput('appointmentType', type);
    fixture.detectChanges();

    expect(component.form.get('name')?.value).toBe('Meeting');
    expect(component.form.get('color')?.value).toBe('#ff5722');
  });

  it('should emit save event with form values on submit', (done) => {
    component.form.patchValue({ name: 'Test', color: '#000000' });

    component.save.subscribe((emittedType) => {
      expect(emittedType.name).toBe('Test');
      expect(emittedType.color).toBe('#000000');
      done();
    });

    component.onSubmit();
  });

  it('should not emit save event if form is invalid', () => {
    let emitted = false;
    component.save.subscribe(() => emitted = true);

    component.form.patchValue({ name: '', color: '#000000' });
    component.onSubmit();

    expect(emitted).toBe(false);
  });

  it('should emit cancel event', (done) => {
    component.cancel.subscribe(() => {
      expect(true).toBe(true);
      done();
    });

    component.onCancel();
  });
});
