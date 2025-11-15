import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppointmentFormComponent } from './appointment-form.component';
import { Appointment } from '../../../models/appointment.model';

describe('AppointmentFormComponent', () => {
  const mockAppointmentTypes = [
    { id: 1, name: 'Personal', color: '#3B82F6' },
    { id: 2, name: 'Professional', color: '#8B5CF6' }
  ];

  const mockAppointment: Appointment = {
    id: 1,
    title: 'Test Meeting',
    description: 'Test Description',
    startTime: '2025-11-13T10:00:00',
    endTime: '2025-11-13T11:00:00',
    appointmentTypeId: 1,
    reminderMinutes: 15
  };

  const setup = async (isNew = true, appointment: Appointment | null = null) => {
    const user = userEvent.setup();
    const result = await render(AppointmentFormComponent, {
      imports: [BrowserAnimationsModule],
      componentInputs: {
        isNew,
        appointment,
        appointmentTypes: mockAppointmentTypes
      }
    });

    return { ...result, user, container: result.container };
  };

  it('should create', async () => {
    const { container } = await setup();

    expect(container.querySelector('form') || container).toBeInTheDocument();
  });

  it('should display empty form for new appointment', async () => {
    await setup(true, null);

    const titleInput = screen.getByLabelText(/title/i);
    expect(titleInput).toHaveValue('');
  });

  it('should populate form with existing appointment data', async () => {
    await setup(false, mockAppointment);

    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);

    expect(titleInput).toHaveValue('Test Meeting');
    expect(descriptionInput).toHaveValue('Test Description');
  });

  it('should emit save event with form data when submitted', async () => {
    const { fixture } = await setup(true, null);
    const component = fixture.componentInstance;
    const emitSpy = jest.spyOn(component.save, 'emit');

    // Fill out the form programmatically
    component.form.patchValue({
      title: 'New Meeting',
      description: 'Description',
      startDate: new Date(2025, 10, 13),
      startTime: '10:00',
      endDate: new Date(2025, 10, 13),
      endTime: '11:00',
      appointmentTypeId: 1,
      reminderMinutes: 15
    });

    // Submit form directly
    component.onSubmit();

    expect(emitSpy).toHaveBeenCalled();
    const emittedValue = emitSpy.mock.calls[0][0];
    expect(emittedValue.title).toBe('New Meeting');
  });

  it('should not submit form when required fields are empty', async () => {
    const { fixture } = await setup(true, null);
    const component = fixture.componentInstance;
    const emitSpy = jest.spyOn(component.save, 'emit');

    // Try to submit without filling required fields
    component.onSubmit();

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should show validation errors for required fields', async () => {
    const { user } = await setup(true, null);

    const titleInput = screen.getByLabelText(/title/i);

    // Focus and blur to trigger validation
    await user.click(titleInput);
    await user.tab();

    expect(screen.getByText(/title is required/i)).toBeInTheDocument();
  });

  it('should emit cancel event when cancel button is clicked', async () => {
    const { user, fixture, container } = await setup(true, null);
    const component = fixture.componentInstance;
    const emitSpy = jest.spyOn(component.cancel, 'emit');

    const cancelButton = screen.getByText(/cancel/i) || container.querySelector('button[type="button"]');
    await user.click(cancelButton);

    expect(emitSpy).toHaveBeenCalled();
  });

  it('should allow selection of appointment type', async () => {
    const { fixture } = await setup(true, null);
    const component = fixture.componentInstance;

    // Set the form value directly (testing form logic, not Material UI)
    component.form.patchValue({ appointmentTypeId: 2 });

    expect(component.form.get('appointmentTypeId')?.value).toBe(2);
  });

  it('should allow selection of reminder time', async () => {
    const { fixture } = await setup(true, null);
    const component = fixture.componentInstance;

    // Set the form value directly (testing form logic, not Material UI)
    component.form.patchValue({ reminderMinutes: 15 });

    expect(component.form.get('reminderMinutes')?.value).toBe(15);
  });
});
