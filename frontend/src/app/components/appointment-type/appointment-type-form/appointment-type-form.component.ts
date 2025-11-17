import { Component, input, output, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AppointmentType } from '../../../models/appointment-type.model';

@Component({
  selector: 'app-appointment-type-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './appointment-type-form.component.html',
  styleUrl: './appointment-type-form.component.scss'
})
export class AppointmentTypeFormComponent implements OnChanges {
  private fb = inject(FormBuilder);

  appointmentType = input<AppointmentType | null>(null);
  isNew = input<boolean>(false);

  save = output<AppointmentType>();
  cancel = output<void>();

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      color: ['#1976d2', [Validators.required, Validators.pattern(/^#[0-9A-Fa-f]{6}$/)]]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appointmentType'] && this.appointmentType()) {
      this.initForm();
    }
  }

  private initForm(): void {
    const type = this.appointmentType();
    this.form.patchValue({
      name: type?.name || '',
      color: type?.color || '#1976d2'
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formValue = this.form.value;
      const appointmentType: AppointmentType = {
        ...(this.appointmentType() || {}),
        name: formValue.name,
        color: formValue.color
      };
      this.save.emit(appointmentType);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
