import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AppointmentTypeFormComponent } from '../appointment-type-form/appointment-type-form.component';
import { AppointmentTypeService } from '../../../services/appointment-type.service';
import { AppointmentType } from '../../../models/appointment-type.model';
import { devError } from '../../../utils/environment.utils';

@Component({
  selector: 'app-appointment-type-drawer',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    AppointmentTypeFormComponent,
  ],
  templateUrl: './appointment-type-drawer.component.html',
  styleUrl: './appointment-type-drawer.component.scss',
})
export class AppointmentTypeDrawerComponent {
  private appointmentTypeService = inject(AppointmentTypeService);
  private snackBar = inject(MatSnackBar);

  appointmentType = input.required<AppointmentType>();
  isNew = input.required<boolean>();

  close = output<void>();
  save = output<void>();

  onSave(appointmentType: AppointmentType): void {
    if (this.isNew()) {
      this.appointmentTypeService.create(appointmentType).subscribe({
        next: () => {
          this.snackBar.open(
            'Appointment type created successfully',
            'Dismiss',
            { duration: 3000 }
          );
          this.save.emit();
        },
        error: (error) => {
          devError('Error creating appointment type:', error);
          this.snackBar.open('Failed to create appointment type', 'Dismiss', {
            duration: 3000,
          });
        },
      });
    } else if (appointmentType.id) {
      const updates: Partial<AppointmentType> = {
        name: appointmentType.name,
        color: appointmentType.color,
      };

      this.appointmentTypeService
        .update(appointmentType.id, updates)
        .subscribe({
          next: () => {
            this.snackBar.open(
              'Appointment type updated successfully',
              'Dismiss',
              { duration: 3000 }
            );
            this.save.emit();
          },
          error: (error) => {
            devError('Error updating appointment type:', error);
            this.snackBar.open('Failed to update appointment type', 'Dismiss', {
              duration: 3000,
            });
          },
        });
    }
  }

  onCancel(): void {
    this.close.emit();
  }

  onDelete(): void {
    if (this.appointmentType().id === undefined) {
      return;
    }
    if (
      confirm(
        `Are you sure you want to delete "${this.appointmentType().name}"?`
      )
    ) {
      this.appointmentTypeService
        .delete(this.appointmentType().id || 0)
        .subscribe({
          next: () => {
            this.snackBar.open(
              'Appointment type deleted successfully',
              'Dismiss',
              { duration: 3000 }
            );
            this.save.emit();
          },
          error: (error) => {
            devError('Error deleting appointment type:', error);
            this.snackBar.open('Failed to delete appointment type', 'Dismiss', {
              duration: 3000,
            });
          },
        });
    }
  }
}
