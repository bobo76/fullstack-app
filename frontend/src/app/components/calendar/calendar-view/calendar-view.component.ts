import { Component, OnInit, OnDestroy, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WeekViewComponent } from '../week-view/week-view.component';
import { DayViewComponent } from '../day-view/day-view.component';
import { AppointmentDrawerComponent } from '../../appointment/appointment-drawer/appointment-drawer.component';
import { AppointmentService } from '../../../services/appointment.service';
import { AppointmentTypeService } from '../../../services/appointment-type.service';
import { WebSocketService } from '../../../services/websocket.service';
import { ReminderService } from '../../../services/reminder.service';
import { Appointment } from '../../../models/appointment.model';
import { AppointmentType } from '../../../models/appointment-type.model';

type ViewMode = 'week' | 'day';

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatSidenavModule,
    WeekViewComponent,
    DayViewComponent,
    AppointmentDrawerComponent
  ],
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarViewComponent implements OnInit, OnDestroy {
  appointmentService = inject(AppointmentService);
  private appointmentTypeService = inject(AppointmentTypeService);
  private wsService = inject(WebSocketService);
  private reminderService = inject(ReminderService);
  private snackBar = inject(MatSnackBar);

  viewMode = signal<ViewMode>('week');
  currentDate = signal<Date>(new Date());
  drawerOpen = signal<boolean>(false);
  selectedAppointment = signal<Appointment | null>(null);
  appointmentTypes = signal<AppointmentType[]>([]);
  isNewAppointment = signal<boolean>(false);

  ngOnInit(): void {
    this.loadAppointments();
    this.loadAppointmentTypes();
    this.wsService.connect();
    this.reminderService.initialize();
  }

  private loadAppointments(): void {
    this.appointmentService.getAll().subscribe({
      next: () => {},
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.snackBar.open('Failed to load appointments', 'Dismiss', { duration: 3000 });
      }
    });
  }

  private loadAppointmentTypes(): void {
    this.appointmentTypeService.getAll().subscribe({
      next: (types) => this.appointmentTypes.set(types),
      error: (error) => {
        console.error('Error loading appointment types:', error);
        this.snackBar.open('Failed to load appointment types', 'Dismiss', { duration: 3000 });
      }
    });
  }

  onViewModeChange(mode: ViewMode): void {
    this.viewMode.set(mode);
  }

  previousPeriod(): void {
    const current = this.currentDate();
    const newDate = new Date(current);
    if (this.viewMode() === 'week') {
      newDate.setDate(current.getDate() - 7);
    } else {
      newDate.setDate(current.getDate() - 1);
    }
    this.currentDate.set(newDate);
  }

  nextPeriod(): void {
    const current = this.currentDate();
    const newDate = new Date(current);
    if (this.viewMode() === 'week') {
      newDate.setDate(current.getDate() + 7);
    } else {
      newDate.setDate(current.getDate() + 1);
    }
    this.currentDate.set(newDate);
  }

  today(): void {
    this.currentDate.set(new Date());
  }

  onTimeSlotClick(startTime: Date): void {
    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + 1);

    const newAppointment: Appointment = {
      title: '',
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      reminderMinutes: 15
    };

    this.selectedAppointment.set(newAppointment);
    this.isNewAppointment.set(true);
    this.drawerOpen.set(true);
  }

  onAppointmentClick(appointment: Appointment): void {
    this.selectedAppointment.set(appointment);
    this.isNewAppointment.set(false);
    this.drawerOpen.set(true);
  }

  onDrawerClose(): void {
    this.drawerOpen.set(false);
    this.selectedAppointment.set(null);
    this.isNewAppointment.set(false);
  }

  onAppointmentSaved(): void {
    this.drawerOpen.set(false);
    this.selectedAppointment.set(null);
    this.isNewAppointment.set(false);
    this.loadAppointments();
  }

  getCurrentPeriodLabel(): string {
    const date = this.currentDate();
    if (this.viewMode() === 'week') {
      const weekStart = this.getWeekStart(date);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return `${this.formatDate(weekStart)} - ${this.formatDate(weekEnd)}`;
    } else {
      return this.formatDate(date);
    }
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  ngOnDestroy(): void {
    this.wsService.disconnect();
  }
}
