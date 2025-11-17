import { Component, signal } from '@angular/core';
import { CalendarViewComponent } from './components/calendar/calendar-view/calendar-view.component';
import { SidebarComponent, ViewType } from './components/navigation/sidebar/sidebar.component';
import { AppointmentTypeListComponent } from './components/appointment-type/appointment-type-list/appointment-type-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CalendarViewComponent, SidebarComponent, AppointmentTypeListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'calendar-app';
  currentView = signal<ViewType>('calendar');

  onViewChange(view: ViewType): void {
    this.currentView.set(view);
  }
}
