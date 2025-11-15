import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-time-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './time-grid.component.html',
  styleUrls: ['./time-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimeGridComponent {
  @Input() date!: Date;
  @Output() timeSlotClick = new EventEmitter<Date>();

  hours = Array.from({ length: 24 }, (_, i) => i);

  onSlotClick(hour: number): void {
    const slotDate = new Date(this.date);
    slotDate.setHours(hour, 0, 0, 0);
    this.timeSlotClick.emit(slotDate);
  }

  formatHour(hour: number): string {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  }
}
