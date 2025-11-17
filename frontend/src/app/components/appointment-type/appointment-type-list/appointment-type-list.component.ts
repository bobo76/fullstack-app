import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AppointmentTypeService } from '../../../services/appointment-type.service';
import { AppointmentType } from '../../../models/appointment-type.model';
import { AppointmentTypeDrawerComponent } from '../appointment-type-drawer/appointment-type-drawer.component';
import { devError } from '../../../utils/environment.utils';

@Component({
  selector: 'app-appointment-type-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    AppointmentTypeDrawerComponent
  ],
  templateUrl: './appointment-type-list.component.html',
  styleUrl: './appointment-type-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppointmentTypeListComponent implements OnInit {
  private appointmentTypeService = inject(AppointmentTypeService);
  private snackBar = inject(MatSnackBar);

  appointmentTypes = this.appointmentTypeService.appointmentTypes;
  drawerOpen = signal(false);
  selectedAppointmentType = signal<AppointmentType | null>(null);
  isNew = signal(false);
  loading = signal(false);

  displayedColumns: string[] = ['color', 'name', 'actions'];

  ngOnInit(): void {
    this.loadAppointmentTypes();
  }

  loadAppointmentTypes(): void {
    this.loading.set(true);
    this.appointmentTypeService.getAll().subscribe({
      next: () => this.loading.set(false),
      error: (error) => {
        this.loading.set(false);
        devError('Error loading appointment types:', error);
        this.snackBar.open('Failed to load appointment types', 'Dismiss', { duration: 3000 });
      }
    });
  }

  onAddNew(): void {
    this.selectedAppointmentType.set({ name: '', color: '#1976d2' });
    this.isNew.set(true);
    this.drawerOpen.set(true);
  }

  onEdit(appointmentType: AppointmentType): void {
    this.selectedAppointmentType.set({ ...appointmentType });
    this.isNew.set(false);
    this.drawerOpen.set(true);
  }


  onDrawerClose(): void {
    this.drawerOpen.set(false);
    this.selectedAppointmentType.set(null);
  }

  onDrawerSave(): void {
    this.drawerOpen.set(false);
    this.selectedAppointmentType.set(null);
  }
}
