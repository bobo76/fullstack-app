import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { AppointmentCardComponent } from './appointment-card.component';
import { Appointment } from '../../../models/appointment.model';

describe('AppointmentCardComponent', () => {
  const mockAppointment: Appointment = {
    id: 1,
    title: 'Test Meeting',
    startTime: '2025-11-13T10:00:00',
    endTime: '2025-11-13T11:00:00',
    reminderMinutes: 15,
    appointmentType: {
      id: 1,
      name: 'Personal',
      color: '#3B82F6'
    }
  };

  const setup = async (appointment: Appointment = mockAppointment, position = { top: 0, height: 60 }) => {
    const user = userEvent.setup();
    const result = await render(AppointmentCardComponent, {
      componentInputs: { appointment, position }
    });

    return { ...result, user };
  };

  it('should create', async () => {
    await setup();

    expect(screen.getByText('Test Meeting')).toBeInTheDocument();
  });

  it('should display appointment title', async () => {
    await setup();

    expect(screen.getByText('Test Meeting')).toBeInTheDocument();
  });

  it('should emit click event when clicked', async () => {
    const { user, fixture, container } = await setup();
    const component = fixture.componentInstance;
    const emitSpy = jest.spyOn(component.appointmentClick, 'emit');

    const card = container.querySelector('.appointment-card') as HTMLElement;
    await user.click(card);

    expect(emitSpy).toHaveBeenCalledWith(mockAppointment);
  });

  it('should emit click event on Enter key', async () => {
    const { user, fixture, container } = await setup();
    const component = fixture.componentInstance;
    const emitSpy = jest.spyOn(component.appointmentClick, 'emit');

    const card = container.querySelector('.appointment-card') as HTMLElement;
    card.focus();
    await user.keyboard('{Enter}');

    expect(emitSpy).toHaveBeenCalledWith(mockAppointment);
  });

  it('should emit click event on Space key', async () => {
    const { user, fixture, container } = await setup();
    const component = fixture.componentInstance;
    const emitSpy = jest.spyOn(component.appointmentClick, 'emit');

    const card = container.querySelector('.appointment-card') as HTMLElement;
    card.focus();
    await user.keyboard(' ');

    expect(emitSpy).toHaveBeenCalledWith(mockAppointment);
  });

  it('should apply background color from appointment type', async () => {
    const { container } = await setup();

    const card = container.querySelector('.appointment-card');
    expect(card).toHaveStyle({ backgroundColor: '#3B82F6' });
  });

  it('should use default color when no appointment type', async () => {
    const appointmentWithoutType = { ...mockAppointment, appointmentType: undefined };
    const { container } = await setup(appointmentWithoutType);

    const card = container.querySelector('.appointment-card');
    expect(card).toHaveStyle({ backgroundColor: '#3f51b5' });
  });

  it('should handle resize interaction', async () => {
    const { user, fixture, container } = await setup();
    const component = fixture.componentInstance;
    const resizeEmitSpy = jest.spyOn(component.appointmentResize, 'emit');

    const resizeHandle = container.querySelector('.resize-handle');
    expect(resizeHandle).toBeInTheDocument();

    // Simulate resize start
    await user.pointer({ keys: '[MouseLeft>]', target: resizeHandle! });

    expect(component.isResizing).toBe(true);

    // Simulate resize end
    await user.pointer({ keys: '[/MouseLeft]' });

    expect(resizeEmitSpy).toHaveBeenCalled();
  });

  it('should display formatted times', async () => {
    const { container } = await setup();

    // The component should format and display times
    const card = container.querySelector('.appointment-card');
    expect(card).toBeInTheDocument();

    // Times are displayed in the component
    expect(screen.getByText(/10:00/i)).toBeInTheDocument();
  });
});
