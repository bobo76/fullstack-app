import { Component, signal, inject } from '@angular/core';
import { CalendarViewComponent } from './components/calendar/calendar-view/calendar-view.component';
import { SidebarComponent, ViewType } from './components/navigation/sidebar/sidebar.component';
import { AppointmentTypeListComponent } from './components/appointment-type/appointment-type-list/appointment-type-list.component';
import { SettingsViewComponent } from './components/settings/settings-view/settings-view.component';
import { SettingsService } from './services/settings.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CalendarViewComponent, SidebarComponent, AppointmentTypeListComponent, SettingsViewComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'calendar-app';
  currentView = signal<ViewType>('calendar');

  // Initialize settings service to apply theme globally
  private settingsService = inject(SettingsService);

  onViewChange(view: ViewType): void {
    this.currentView.set(view);
  }
}
