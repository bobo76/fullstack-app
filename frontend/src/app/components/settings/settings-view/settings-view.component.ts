import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { SettingsService, ThemeMode, WeekStartDay, TimeFormat, DefaultView } from '../../../services/settings.service';

@Component({
  selector: 'app-settings-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './settings-view.component.html',
  styleUrl: './settings-view.component.scss'
})
export class SettingsViewComponent {
  settingsService = inject(SettingsService);

  // Duration options in minutes
  durationOptions = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' }
  ];

  // Reminder options in minutes
  reminderOptions = [
    { value: 0, label: 'No reminder' },
    { value: 5, label: '5 minutes before' },
    { value: 10, label: '10 minutes before' },
    { value: 15, label: '15 minutes before' },
    { value: 30, label: '30 minutes before' },
    { value: 60, label: '1 hour before' },
    { value: 1440, label: '1 day before' }
  ];

  onThemeToggle(isDark: boolean): void {
    this.settingsService.updateThemeMode(isDark ? 'dark' : 'light');
  }

  onWeekStartDayChange(day: WeekStartDay): void {
    this.settingsService.updateWeekStartDay(day);
  }

  onTimeFormatChange(format: TimeFormat): void {
    this.settingsService.updateTimeFormat(format);
  }

  onDefaultViewChange(view: DefaultView): void {
    this.settingsService.updateDefaultView(view);
  }

  onDefaultDurationChange(duration: number): void {
    this.settingsService.updateDefaultDuration(duration);
  }

  onDefaultReminderChange(minutes: number): void {
    this.settingsService.updateDefaultReminderMinutes(minutes);
  }

  onWorkHoursStartChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.settingsService.updateWorkHoursStart(input.value);
  }

  onWorkHoursEndChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.settingsService.updateWorkHoursEnd(input.value);
  }

  resetToDefaults(): void {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      this.settingsService.resetToDefaults();
    }
  }
}
