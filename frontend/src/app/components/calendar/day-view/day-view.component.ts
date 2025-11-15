import { Component, Input, Output, EventEmitter, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDropList, CdkDragDrop } from '@angular/cdk/drag-drop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TimeGridComponent } from '../time-grid/time-grid.component';
import { AppointmentCardComponent } from '../appointment-card/appointment-card.component';
import { Appointment } from '../../../models/appointment.model';
import { Instant } from '../../../models/instant.type';
import { AppointmentService } from '../../../services/appointment.service';

@Component({
  selector: 'app-day-view',
  standalone: true,
  imports: [CommonModule, CdkDropList, TimeGridComponent, AppointmentCardComponent],
  templateUrl: './day-view.component.html',
  styleUrls: ['./day-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DayViewComponent {
  @Input() currentDate!: Date;
  @Input() appointments: Appointment[] = [];
  @Output() timeSlotClick = new EventEmitter<Date>();
  @Output() appointmentClick = new EventEmitter<Appointment>();

  private appointmentService = inject(AppointmentService);
  private snackBar = inject(MatSnackBar);

  getDayAppointments(): Appointment[] {
    return this.appointments.filter(apt => {
      const aptDate = new Date(apt.startTime);
      return this.isSameDay(aptDate, this.currentDate);
    });
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  getAppointmentPosition(appointment: Appointment): { top: number; height: number } {
    const start = new Date(appointment.startTime);
    const end = new Date(appointment.endTime);

    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();
    const duration = endMinutes - startMinutes;

    return {
      top: startMinutes,
      height: duration
    };
  }

  onTimeSlotClick(time: Date): void {
    this.timeSlotClick.emit(time);
  }

  onAppointmentClick(appointment: Appointment): void {
    this.appointmentClick.emit(appointment);
  }

  onAppointmentDrop(event: CdkDragDrop<Appointment[]>): void {
    // Calculate new time based on drop position
    const dropY = event.dropPoint.y;
    const containerTop = event.container.element.nativeElement.getBoundingClientRect().top;
    const relativeY = dropY - containerTop;
    const minutes = Math.round(relativeY);

    const newStartTime = new Date(this.currentDate);
    newStartTime.setHours(0, minutes, 0, 0);

    const appointment = event.item.data;
    const startDate = new Date(appointment.startTime);
    const endDate = new Date(appointment.endTime);
    const duration = endDate.getTime() - startDate.getTime();
    const newEndTime = new Date(newStartTime.getTime() + duration);

    if (appointment.id) {
      this.appointmentService.update(appointment.id, {
        startTime: this.toInstant(newStartTime),
        endTime: this.toInstant(newEndTime)
      }).subscribe({
        error: (error) => {
          console.error('Error updating appointment:', error);
          this.snackBar.open('Failed to move appointment', 'Dismiss', { duration: 3000 });
        }
      });
    }
  }

  onAppointmentResize(event: { appointment: Appointment; newEndTime: Date }): void {
    if (event.appointment.id) {
      this.appointmentService.update(event.appointment.id, {
        endTime: this.toInstant(event.newEndTime)
      }).subscribe({
        error: (error) => {
          console.error('Error resizing appointment:', error);
          this.snackBar.open('Failed to resize appointment', 'Dismiss', { duration: 3000 });
        }
      });
    }
  }

  private toInstant(date: Date): Instant {
    // Format Date to ISO 8601 UTC timestamp (Instant)
    // Output format: "2025-11-13T18:35:00Z"
    return date.toISOString().split('.')[0] + 'Z';
  }

  formatDayHeader(): string {
    return this.currentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }
}
