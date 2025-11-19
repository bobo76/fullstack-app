import { Injectable, signal, effect } from '@angular/core';

export type ThemeMode = 'light' | 'dark';
export type WeekStartDay = 'sunday' | 'monday';
export type TimeFormat = '12h' | '24h';
export type DefaultView = 'week' | 'month' | 'day';

export interface AppSettings {
  // Display Settings
  themeMode: ThemeMode;
  weekStartDay: WeekStartDay;
  timeFormat: TimeFormat;
  defaultView: DefaultView;

  // Appointment Defaults
  defaultDuration: number; // in minutes
  defaultReminderMinutes: number;
  workHoursStart: string; // HH:mm format
  workHoursEnd: string; // HH:mm format
}

const DEFAULT_SETTINGS: AppSettings = {
  themeMode: 'light',
  weekStartDay: 'monday',
  timeFormat: '24h',
  defaultView: 'week',
  defaultDuration: 60,
  defaultReminderMinutes: 15,
  workHoursStart: '09:00',
  workHoursEnd: '17:00'
};

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly STORAGE_KEY = 'calendar-app-settings';
  private isLoading = false;

  // Signals for reactive settings
  themeMode = signal<ThemeMode>('light');
  weekStartDay = signal<WeekStartDay>('monday');
  timeFormat = signal<TimeFormat>('24h');
  defaultView = signal<DefaultView>('week');
  defaultDuration = signal<number>(60);
  defaultReminderMinutes = signal<number>(15);
  workHoursStart = signal<string>('09:00');
  workHoursEnd = signal<string>('17:00');

  constructor() {
    this.isLoading = true;
    this.loadSettings();
    this.isLoading = false;

    // Apply theme reactively
    effect(() => {
      const theme = this.themeMode();
      if (theme === 'dark') {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
    });

    // Auto-save settings when they change (skip during initial load)
    effect(() => {
      // Explicitly track all settings signals for auto-save
      const settings = {
        themeMode: this.themeMode(),
        weekStartDay: this.weekStartDay(),
        timeFormat: this.timeFormat(),
        defaultView: this.defaultView(),
        defaultDuration: this.defaultDuration(),
        defaultReminderMinutes: this.defaultReminderMinutes(),
        workHoursStart: this.workHoursStart(),
        workHoursEnd: this.workHoursEnd()
      };

      if (!this.isLoading) {
        this.saveSettings();
      }
    });
  }

  private loadSettings(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const settings: AppSettings = JSON.parse(stored);
        this.themeMode.set(settings.themeMode || DEFAULT_SETTINGS.themeMode);
        this.weekStartDay.set(settings.weekStartDay || DEFAULT_SETTINGS.weekStartDay);
        this.timeFormat.set(settings.timeFormat || DEFAULT_SETTINGS.timeFormat);
        this.defaultView.set(settings.defaultView || DEFAULT_SETTINGS.defaultView);
        this.defaultDuration.set(settings.defaultDuration || DEFAULT_SETTINGS.defaultDuration);
        this.defaultReminderMinutes.set(settings.defaultReminderMinutes || DEFAULT_SETTINGS.defaultReminderMinutes);
        this.workHoursStart.set(settings.workHoursStart || DEFAULT_SETTINGS.workHoursStart);
        this.workHoursEnd.set(settings.workHoursEnd || DEFAULT_SETTINGS.workHoursEnd);
      } catch (error) {
        console.error('Failed to load settings:', error);
        this.resetToDefaults();
      }
    }
  }

  private saveSettings(): void {
    const settings: AppSettings = {
      themeMode: this.themeMode(),
      weekStartDay: this.weekStartDay(),
      timeFormat: this.timeFormat(),
      defaultView: this.defaultView(),
      defaultDuration: this.defaultDuration(),
      defaultReminderMinutes: this.defaultReminderMinutes(),
      workHoursStart: this.workHoursStart(),
      workHoursEnd: this.workHoursEnd()
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
  }

  updateThemeMode(mode: ThemeMode): void {
    this.themeMode.set(mode);
  }

  updateWeekStartDay(day: WeekStartDay): void {
    this.weekStartDay.set(day);
  }

  updateTimeFormat(format: TimeFormat): void {
    this.timeFormat.set(format);
  }

  updateDefaultView(view: DefaultView): void {
    this.defaultView.set(view);
  }

  updateDefaultDuration(duration: number): void {
    this.defaultDuration.set(duration);
  }

  updateDefaultReminderMinutes(minutes: number): void {
    this.defaultReminderMinutes.set(minutes);
  }

  updateWorkHoursStart(time: string): void {
    // Validate that start time is before end time
    if (time && this.workHoursEnd() && time >= this.workHoursEnd()) {
      console.warn('Work hours start must be before end time');
      return;
    }
    this.workHoursStart.set(time);
  }

  updateWorkHoursEnd(time: string): void {
    // Validate that end time is after start time
    if (time && this.workHoursStart() && time <= this.workHoursStart()) {
      console.warn('Work hours end must be after start time');
      return;
    }
    this.workHoursEnd.set(time);
  }

  resetToDefaults(): void {
    this.themeMode.set(DEFAULT_SETTINGS.themeMode);
    this.weekStartDay.set(DEFAULT_SETTINGS.weekStartDay);
    this.timeFormat.set(DEFAULT_SETTINGS.timeFormat);
    this.defaultView.set(DEFAULT_SETTINGS.defaultView);
    this.defaultDuration.set(DEFAULT_SETTINGS.defaultDuration);
    this.defaultReminderMinutes.set(DEFAULT_SETTINGS.defaultReminderMinutes);
    this.workHoursStart.set(DEFAULT_SETTINGS.workHoursStart);
    this.workHoursEnd.set(DEFAULT_SETTINGS.workHoursEnd);
  }
}
