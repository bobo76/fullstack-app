import { Component } from '@angular/core';
import { CalendarViewComponent } from './components/calendar/calendar-view/calendar-view.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CalendarViewComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'calendar-app';
}
