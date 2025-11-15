import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Appointment } from '../../../models/appointment.model';
import { AppointmentType } from '../../../models/appointment-type.model';
import { Instant } from '../../../models/instant.type';

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './appointment-form.component.html',
  styleUrls: ['./appointment-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentFormComponent implements OnInit, OnChanges {
  @Input() appointment: Appointment | null = null;
  @Input() appointmentTypes: AppointmentType[] = [];
  @Input() isNew = false;
  @Output() save = new EventEmitter<Appointment>();
  @Output() cancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);

  form!: FormGroup;
  reminderOptions = [0, 5, 10, 15, 30];

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Reinitialize form when appointment or appointmentTypes change
    if ((changes['appointment'] || changes['appointmentTypes']) && this.form) {
      this.initForm();
    }
  }

  private initForm(): void {
    const startTime = this.appointment?.startTime
      ? this.parseInstant(this.appointment.startTime)
      : new Date();
    const endTime = this.appointment?.endTime
      ? this.parseInstant(this.appointment.endTime)
      : new Date(startTime.getTime() + 3600000);

    // Select first appointment type as default if none is specified
    const defaultTypeId = this.appointment?.appointmentTypeId ||
      this.appointment?.appointmentType?.id ||
      (this.appointmentTypes.length > 0 ? this.appointmentTypes[0].id : null);

    this.form = this.fb.group({
      title: [this.appointment?.title || '', Validators.required],
      description: [this.appointment?.description || ''],
      startDate: [startTime, Validators.required],
      startTime: [this.formatTimeForInput(startTime), Validators.required],
      endDate: [endTime, Validators.required],
      endTime: [this.formatTimeForInput(endTime), Validators.required],
      appointmentTypeId: [defaultTypeId, Validators.required],
      reminderMinutes: [
        this.appointment?.reminderMinutes ?? 15,
        Validators.required,
      ],
    });
  }

  private parseInstant(instantStr: Instant): Date {
    // Parse ISO 8601 UTC timestamp (Instant) to local Date object
    // Instant format: "2025-11-13T23:35:00Z" or "2025-11-13T23:35:00.000Z"
    return new Date(instantStr);
  }

  private formatTimeForInput(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private toInstant(date: Date): Instant {
    // Format Date to ISO 8601 UTC timestamp (Instant)
    // Output format: "2025-11-13T18:35:00Z"
    return date.toISOString().split('.')[0] + 'Z';
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formValue = this.form.value;

      const startDate = new Date(formValue.startDate);
      const [startHours, startMinutes] = formValue.startTime.split(':');
      startDate.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);

      const endDate = new Date(formValue.endDate);
      const [endHours, endMinutes] = formValue.endTime.split(':');
      endDate.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

      const appointment: Appointment = {
        ...this.appointment,
        title: formValue.title,
        description: formValue.description,
        startTime: this.toInstant(startDate),
        endTime: this.toInstant(endDate),
        appointmentTypeId: formValue.appointmentTypeId,
        reminderMinutes: formValue.reminderMinutes,
      };

      this.save.emit(appointment);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
