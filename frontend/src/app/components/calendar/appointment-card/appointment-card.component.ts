import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { Appointment } from '../../../models/appointment.model';
import { Instant } from '../../../models/instant.type';

@Component({
  selector: 'app-appointment-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, CdkDrag],
  templateUrl: './appointment-card.component.html',
  styleUrls: ['./appointment-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppointmentCardComponent implements OnDestroy {
  @Input() appointment!: Appointment;
  @Input() position: { top: number; height: number } = { top: 0, height: 0 };
  @Output() appointmentClick = new EventEmitter<Appointment>();
  @Output() appointmentDrop = new EventEmitter<{ appointment: Appointment; newStartTime: Date }>();
  @Output() appointmentResize = new EventEmitter<{ appointment: Appointment; newEndTime: Date }>();

  isResizing = false;
  resizeStartY = 0;
  originalHeight = 0;

  onClick(event: Event | KeyboardEvent): void {
    event.stopPropagation();

    // Handle keyboard events
    if (event instanceof KeyboardEvent) {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }
      event.preventDefault();
    }

    this.appointmentClick.emit(this.appointment);
  }

  onResizeStart(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    this.isResizing = true;
    this.resizeStartY = event.clientY;
    this.originalHeight = this.position.height;

    document.addEventListener('mousemove', this.onResizeMove);
    document.addEventListener('mouseup', this.onResizeEnd);
  }

  private onResizeMove = (event: MouseEvent): void => {
    if (!this.isResizing) return;

    const deltaY = event.clientY - this.resizeStartY;
    const newHeight = Math.max(30, this.originalHeight + deltaY);
    this.position.height = newHeight;
  };

  private onResizeEnd = (event: MouseEvent): void => {
    if (!this.isResizing) return;

    this.isResizing = false;
    this.cleanupEventListeners();

    const heightDiff = this.position.height - this.originalHeight;
    const minutesDiff = Math.round((heightDiff / 60) * 60);

    const endTime = new Date(this.appointment.endTime);
    endTime.setMinutes(endTime.getMinutes() + minutesDiff);

    this.appointmentResize.emit({
      appointment: this.appointment,
      newEndTime: endTime
    });
  };

  private cleanupEventListeners(): void {
    document.removeEventListener('mousemove', this.onResizeMove);
    document.removeEventListener('mouseup', this.onResizeEnd);
  }

  getBackgroundColor(): string {
    return this.appointment.appointmentType?.color || '#3f51b5';
  }

  formatTime(instant: Instant): string {
    // Parse ISO 8601 UTC timestamp (Instant) and display in local time
    const date = new Date(instant);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  ngOnDestroy(): void {
    this.cleanupEventListeners();
  }
}
