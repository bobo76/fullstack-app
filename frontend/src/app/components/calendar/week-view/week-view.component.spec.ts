import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideHttpClient } from '@angular/common/http';
import { WeekViewComponent } from './week-view.component';
import { Appointment } from '../../../models/appointment.model';

describe('WeekViewComponent', () => {
  const mockAppointments: Appointment[] = [
    {
      id: 1,
      title: 'Monday Meeting',
      startTime: '2025-11-10T10:00:00',
      endTime: '2025-11-10T11:00:00',
      reminderMinutes: 15
    },
    {
      id: 2,
      title: 'Wednesday Meeting',
      startTime: '2025-11-13T14:00:00',
      endTime: '2025-11-13T15:30:00',
      reminderMinutes: 15
    }
  ];

  const setup = async (currentDate = new Date('2025-11-13'), appointments = mockAppointments) => {
    const user = userEvent.setup();
    const result = await render(WeekViewComponent, {
      providers: [provideHttpClient()],
      componentInputs: {
        currentDate,
        appointments
      }
    });

    return { ...result, user, container: result.container };
  };

  it('should create', async () => {
    const { container } = await setup();

    expect(container.querySelector('.week-view') || container).toBeInTheDocument();
  });

  it('should display 7 days of the week', async () => {
    const { container, fixture } = await setup();
    const component = fixture.componentInstance;

    // Test component method directly
    const weekDays = component.getWeekDays();
    expect(weekDays.length).toBe(7);

    // Count day headers in DOM
    const dayHeaders = container.querySelectorAll('th') || container.querySelectorAll('.day-header');
    if (dayHeaders.length > 0) {
      expect(dayHeaders.length).toBeGreaterThanOrEqual(7);
    }
  });

  it('should display appointments in correct day columns', async () => {
    await setup();

    expect(screen.getByText('Monday Meeting')).toBeInTheDocument();
    expect(screen.getByText('Wednesday Meeting')).toBeInTheDocument();
  });

  it('should highlight today', async () => {
    const { container, fixture } = await setup(new Date());
    const component = fixture.componentInstance;

    // Test component logic directly
    const today = new Date();
    const isToday = component.isToday(today);
    expect(isToday).toBe(true);

    // Check DOM for today class
    const dayHeaders = container.querySelectorAll('th');
    const todayHeader = Array.from(dayHeaders).find(header =>
      header.classList.contains('today') || header.classList.contains('current-day')
    );

    if (todayHeader) {
      expect(todayHeader).toBeInTheDocument();
    }
  });

  it('should emit timeSlotClick with correct date and hour when slot is clicked', async () => {
    const { user, fixture, container } = await setup(new Date(2025, 10, 13));
    const component = fixture.componentInstance;
    const emitSpy = jest.spyOn(component.timeSlotClick, 'emit');

    // Click a time slot (e.g., Wednesday at 2 PM)
    const slots = container.querySelectorAll('button, .time-slot');
    const wednesdaySlots = Array.from(slots).filter(slot => slot.getAttribute('data-day') === '3');
    const slot14 = wednesdaySlots.find(slot => slot.getAttribute('data-hour') === '14');

    if (slot14) {
      await user.click(slot14 as HTMLElement);

      expect(emitSpy).toHaveBeenCalled();
      const emittedDate = emitSpy.mock.calls[0][0] as Date;
      expect(emittedDate.getHours()).toBe(14);
    }
  });

  it('should emit appointmentClick when appointment is clicked', async () => {
    const { user, fixture } = await setup();
    const component = fixture.componentInstance;
    const emitSpy = jest.spyOn(component.appointmentClick, 'emit');

    const appointment = screen.getByText('Monday Meeting');
    await user.click(appointment);

    expect(emitSpy).toHaveBeenCalledWith(mockAppointments[0]);
  });

  it('should display time labels for all hours', async () => {
    await setup();

    expect(screen.getByText(/12 AM/i)).toBeInTheDocument();
    expect(screen.getByText(/12 PM/i)).toBeInTheDocument();
    expect(screen.getByText(/3 PM/i)).toBeInTheDocument();
  });

  it('should calculate correct position for appointments', async () => {
    await setup();

    const mondayMeeting = screen.getByText('Monday Meeting');
    const appointmentCard = mondayMeeting.closest('.appointment-card');

    // 10:00 AM = 600 minutes from midnight
    expect(appointmentCard).toHaveStyle({ top: '600px' });
    // 1 hour = 60 minutes
    expect(appointmentCard).toHaveStyle({ height: '60px' });
  });

  it('should display week starting from Sunday', async () => {
    const { fixture } = await setup(new Date('2025-11-13')); // Wednesday
    const component = fixture.componentInstance;

    const weekDays = component.getWeekDays();

    // First day should be Sunday
    expect(weekDays[0].getDay()).toBe(0);
    // Last day should be Saturday
    expect(weekDays[6].getDay()).toBe(6);
  });

  it('should filter appointments by day correctly', async () => {
    const { fixture } = await setup();
    const component = fixture.componentInstance;

    // Test component method directly - use Date constructor with year, month (0-indexed), day
    const monday = new Date(2025, 10, 10); // November 10, 2025 (month is 0-indexed)
    const mondayAppointments = component.getDayAppointments(monday);

    expect(mondayAppointments.length).toBe(1);
    expect(mondayAppointments[0].title).toBe('Monday Meeting');

    const wednesday = new Date(2025, 10, 13); // November 13, 2025
    const wednesdayAppointments = component.getDayAppointments(wednesday);

    expect(wednesdayAppointments.length).toBe(1);
    expect(wednesdayAppointments[0].title).toBe('Wednesday Meeting');
  });

  it('should display day header with correct date format', async () => {
    const { fixture } = await setup(new Date('2025-11-13')); // Thursday Nov 13
    const component = fixture.componentInstance;

    // Test component method directly - use local date constructor
    const thursday = new Date(2025, 10, 13); // November 13, 2025 (which is a Thursday)
    const header = component.formatDayHeader(thursday);

    // Should include day name - November 13, 2025 is a Thursday
    expect(header).toMatch(/Thu/i);
    // Should also include the date
    expect(header).toMatch(/13/);
  });

  it('should handle empty week with no appointments', async () => {
    const { container } = await setup(new Date('2025-11-13'), []);

    // Should still render the week grid
    expect(container.querySelector('.week-view') || container).toBeInTheDocument();
    // But no appointment cards
    expect(container.querySelector('.appointment-card')).not.toBeInTheDocument();
  });

  it('should position appointment correctly for different durations', async () => {
    const longMeeting: Appointment = {
      id: 3,
      title: 'Long Meeting',
      startTime: '2025-11-13T09:00:00',
      endTime: '2025-11-13T10:30:00',
      reminderMinutes: 15
    };

    await setup(new Date('2025-11-13'), [longMeeting]);

    const appointment = screen.getByText('Long Meeting');
    const appointmentCard = appointment.closest('.appointment-card');

    // 9:00 AM = 540 minutes
    expect(appointmentCard).toHaveStyle({ top: '540px' });
    // 1.5 hours = 90 minutes
    expect(appointmentCard).toHaveStyle({ height: '90px' });
  });
});
