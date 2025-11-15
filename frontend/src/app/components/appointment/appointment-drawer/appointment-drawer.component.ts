import { Component, Input, Output, EventEmitter, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppointmentFormComponent } from '../appointment-form/appointment-form.component';
import { Appointment } from '../../../models/appointment.model';
import { AppointmentType } from '../../../models/appointment-type.model';
import { AppointmentService } from '../../../services/appointment.service';

@Component({
  selector: 'app-appointment-drawer',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    AppointmentFormComponent
  ],
  templateUrl: './appointment-drawer.component.html',
  styleUrls: ['./appointment-drawer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppointmentDrawerComponent {
  @Input() appointment: Appointment | null = null;
  @Input() appointmentTypes: AppointmentType[] = [];
  @Input() isNew = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();

  private appointmentService = inject(AppointmentService);
  private snackBar = inject(MatSnackBar);

  onClose(): void {
    this.close.emit();
  }

  onSave(appointment: Appointment): void {
    if (this.isNew) {
      this.appointmentService.create(appointment).subscribe({
        next: () => {
          this.snackBar.open('Appointment created successfully', 'Dismiss', { duration: 3000 });
          this.save.emit();
        },
        error: (error) => {
          console.error('Error creating appointment:', error);
          this.snackBar.open('Failed to create appointment', 'Dismiss', { duration: 3000 });
        }
      });
    } else if (appointment.id) {
      const updates: Partial<Appointment> = {
        title: appointment.title,
        description: appointment.description,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        appointmentTypeId: appointment.appointmentTypeId,
        reminderMinutes: appointment.reminderMinutes
      };

      this.appointmentService.update(appointment.id, updates).subscribe({
        next: () => {
          this.snackBar.open('Appointment updated successfully', 'Dismiss', { duration: 3000 });
          this.save.emit();
        },
        error: (error) => {
          console.error('Error updating appointment:', error);
          this.snackBar.open('Failed to update appointment', 'Dismiss', { duration: 3000 });
        }
      });
    }
  }

  onDelete(): void {
    if (!this.isNew && this.appointment?.id) {
      if (confirm('Are you sure you want to delete this appointment?')) {
        this.appointmentService.delete(this.appointment.id).subscribe({
          next: () => {
            this.snackBar.open('Appointment deleted successfully', 'Dismiss', { duration: 3000 });
            this.save.emit();
          },
          error: (error) => {
            console.error('Error deleting appointment:', error);
            this.snackBar.open('Failed to delete appointment', 'Dismiss', { duration: 3000 });
          }
        });
      }
    }
  }

  onCancel(): void {
    this.close.emit();
  }
}
