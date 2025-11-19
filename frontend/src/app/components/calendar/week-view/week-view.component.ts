import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDropList, CdkDragDrop } from '@angular/cdk/drag-drop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppointmentCardComponent } from '../appointment-card/appointment-card.component';
import { Appointment } from '../../../models/appointment.model';
import { AppointmentService } from '../../../services/appointment.service';
import { toInstant } from '../../../utils/date.utils';
import { devError } from '../../../utils/environment.utils';

@Component({
  selector: 'app-week-view',
  standalone: true,
  imports: [CommonModule, CdkDropList, AppointmentCardComponent],
  templateUrl: './week-view.component.html',
  styleUrls: ['./week-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeekViewComponent {
  @Input() currentDate!: Date;
  @Input() appointments: Appointment[] = [];
  @Output() timeSlotClick = new EventEmitter<Date>();
  @Output() appointmentClick = new EventEmitter<Appointment>();

  private appointmentService = inject(AppointmentService);
  private snackBar = inject(MatSnackBar);
  hours = Array.from({ length: 24 }, (_, i) => i);

  getWeekDays(): Date[] {
    const days: Date[] = [];
    const startOfWeek = this.getWeekStart(this.currentDate);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }

    return days;
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  getDayAppointments(day: Date): Appointment[] {
    return this.appointments.filter((apt) => {
      const aptDate = new Date(apt.startTime);
      return this.isSameDay(aptDate, day);
    });
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  getAppointmentPosition(appointment: Appointment): {
    top: number;
    height: number;
  } {
    const start = new Date(appointment.startTime);
    const end = new Date(appointment.endTime);

    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();
    const duration = endMinutes - startMinutes;

    return {
      top: startMinutes,
      height: duration,
    };
  }

  onTimeSlotClick(day: Date, hour: number): void {
    const slotDate = new Date(day);
    slotDate.setHours(hour, 0, 0, 0);
    this.timeSlotClick.emit(slotDate);
  }

  onAppointmentClick(appointment: Appointment): void {
    this.appointmentClick.emit(appointment);
  }

  onAppointmentDrop(event: CdkDragDrop<Appointment[]>, day: Date): void {
    const dropY = event.dropPoint.y;
    const containerTop =
      event.container.element.nativeElement.getBoundingClientRect().top;
    const relativeY = dropY - containerTop;
    const minutes = Math.round(relativeY);

    const newStartTime = new Date(day);
    newStartTime.setHours(0, minutes, 0, 0);

    const appointment = event.item.data;
    const startDate = new Date(appointment.startTime);
    const endDate = new Date(appointment.endTime);
    const duration = endDate.getTime() - startDate.getTime();
    const newEndTime = new Date(newStartTime.getTime() + duration);

    if (appointment.id) {
      this.appointmentService
        .update(appointment.id, {
          startTime: toInstant(newStartTime),
          endTime: toInstant(newEndTime),
        })
        .subscribe({
          error: (error) => {
            devError('Error updating appointment:', error);
            this.snackBar.open('Failed to move appointment', 'Dismiss', {
              duration: 3000,
            });
          },
        });
    }
  }

  onAppointmentResize(event: {
    appointment: Appointment;
    newEndTime: Date;
  }): void {
    if (event.appointment.id) {
      this.appointmentService
        .update(event.appointment.id, {
          endTime: toInstant(event.newEndTime),
        })
        .subscribe({
          error: (error) => {
            devError('Error resizing appointment:', error);
            this.snackBar.open('Failed to resize appointment', 'Dismiss', {
              duration: 3000,
            });
          },
        });
    }
  }

  formatHour(hour: number): string {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour} ${period}`;
  }

  formatDayHeader(day: Date): string {
    return day.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'numeric',
      day: 'numeric',
    });
  }

  isToday(day: Date): boolean {
    return this.isSameDay(day, new Date());
  }
}
