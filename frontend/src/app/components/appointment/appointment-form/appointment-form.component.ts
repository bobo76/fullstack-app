import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  OnDestroy,
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
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Appointment } from '../../../models/appointment.model';
import { AppointmentType } from '../../../models/appointment-type.model';
import { toInstant, parseInstant } from '../../../utils/date.utils';
import { AppointmentService } from '../../../services/appointment.service';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  of,
  tap,
  Subscription,
} from 'rxjs';

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
    MatAutocompleteModule,
  ],
  templateUrl: './appointment-form.component.html',
  styleUrls: ['./appointment-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentFormComponent implements OnInit, OnChanges, OnDestroy {
  @Input() appointment: Appointment | null = null;
  @Input() appointmentTypes: AppointmentType[] = [];
  @Input() isNew = false;
  @Output() save = new EventEmitter<Appointment>();
  @Output() cancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private appointmentService = inject(AppointmentService);
  private autocompleteSubscription?: Subscription;

  form!: FormGroup;
  reminderOptions = [0, 5, 10, 15, 30];
  titleSuggestions: string[] = [];

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Reinitialize form when appointment or appointmentTypes change
    if ((changes['appointment'] || changes['appointmentTypes']) && this.form) {
      this.initForm();
    }
  }

  ngOnDestroy(): void {
    // Cleanup subscription to prevent memory leaks
    this.autocompleteSubscription?.unsubscribe();
  }

  private setupTitleAutocomplete(): void {
    // Unsubscribe from previous subscription if it exists
    this.autocompleteSubscription?.unsubscribe();

    this.autocompleteSubscription = this.form
      .get('title')
      ?.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((value) => {
          console.log('Autocomplete for:', value);
          if (typeof value === 'string' && value.trim().length > 0) {
            return this.appointmentService.titleAutoComplete(value);
          }
          return of([]);
        })
      )
      .subscribe((suggestions) => {
        console.log('Suggestions received:', suggestions);
        this.titleSuggestions = suggestions;
      });
  }

  private initForm(): void {
    const startTime = this.appointment?.startTime
      ? parseInstant(this.appointment.startTime)
      : new Date();
    const endTime = this.appointment?.endTime
      ? parseInstant(this.appointment.endTime)
      : new Date(startTime.getTime() + 3600000);

    // Select first appointment type as default if none is specified
    const defaultTypeId =
      this.appointment?.appointmentTypeId ||
      this.appointment?.appointmentType?.id ||
      (this.appointmentTypes.length > 0 ? this.appointmentTypes[0].id : null);

    // Clear previous autocomplete suggestions
    this.titleSuggestions = [];

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

    // Setup autocomplete after form is created
    this.setupTitleAutocomplete();
  }

  private formatTimeForInput(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formValue = this.form.value;

      const startDate = new Date(formValue.startDate);
      const [startHours, startMinutes] = formValue.startTime.split(':');
      const startHourNum = parseInt(startHours, 10);
      const startMinuteNum = parseInt(startMinutes, 10);

      if (isNaN(startHourNum) || isNaN(startMinuteNum)) {
        console.error('Invalid start time format');
        return;
      }
      startDate.setHours(startHourNum, startMinuteNum, 0, 0);

      const endDate = new Date(formValue.endDate);
      const [endHours, endMinutes] = formValue.endTime.split(':');
      const endHourNum = parseInt(endHours, 10);
      const endMinuteNum = parseInt(endMinutes, 10);

      if (isNaN(endHourNum) || isNaN(endMinuteNum)) {
        console.error('Invalid end time format');
        return;
      }
      endDate.setHours(endHourNum, endMinuteNum, 0, 0);

      const appointment: Appointment = {
        ...this.appointment,
        title: formValue.title,
        description: formValue.description,
        startTime: toInstant(startDate),
        endTime: toInstant(endDate),
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
