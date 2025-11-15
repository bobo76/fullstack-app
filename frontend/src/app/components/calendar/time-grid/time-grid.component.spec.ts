import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { TimeGridComponent } from './time-grid.component';

describe('TimeGridComponent', () => {
  const setup = async (date: Date = new Date(2025, 10, 13)) => {
    const user = userEvent.setup();
    const result = await render(TimeGridComponent, {
      componentInputs: { date }
    });

    return { ...result, user };
  };

  it('should create', async () => {
    const { container } = await setup();

    expect(container).toBeInTheDocument();
  });

  it('should display 24 hour slots', async () => {
    await setup();

    // Check for some specific hours
    expect(screen.getByText('12:00 AM')).toBeInTheDocument();
    expect(screen.getByText('12:00 PM')).toBeInTheDocument();
    expect(screen.getByText('11:00 PM')).toBeInTheDocument();
  });

  it('should emit timeSlotClick event when slot is clicked', async () => {
    const { user, fixture, container } = await setup(new Date(2025, 10, 13));
    const component = fixture.componentInstance;
    const emitSpy = jest.spyOn(component.timeSlotClick, 'emit');

    // Find the 10 AM slot
    const slot10AM = screen.getByText('10:00 AM').closest('.time-slot') as HTMLElement ||
                     screen.getByText('10:00 AM').parentElement as HTMLElement;
    await user.click(slot10AM);

    expect(emitSpy).toHaveBeenCalled();
    const emittedDate = emitSpy.mock.calls[0][0] as Date;
    expect(emittedDate.getHours()).toBe(10);
    expect(emittedDate.getMinutes()).toBe(0);
    expect(emittedDate.getDate()).toBe(13);
  });

  it('should format hours correctly for AM times', async () => {
    await setup();

    expect(screen.getByText('12:00 AM')).toBeInTheDocument();
    expect(screen.getByText('1:00 AM')).toBeInTheDocument();
    expect(screen.getByText('11:00 AM')).toBeInTheDocument();
  });

  it('should format hours correctly for PM times', async () => {
    await setup();

    expect(screen.getByText('12:00 PM')).toBeInTheDocument();
    expect(screen.getByText('1:00 PM')).toBeInTheDocument();
    expect(screen.getByText('11:00 PM')).toBeInTheDocument();
  });
});
