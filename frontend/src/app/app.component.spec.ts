import { render, screen } from '@testing-library/angular';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  it('should create the app', async () => {
    const { container } = await render(AppComponent, {
      providers: [provideHttpClient()]
    });

    expect(container).toBeInTheDocument();
  });

  it('should render calendar view', async () => {
    const { container } = await render(AppComponent, {
      providers: [provideHttpClient()]
    });

    const calendarView = container.querySelector('app-calendar-view');
    expect(calendarView).toBeInTheDocument();
  });
});
