import { Injectable, inject, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { ReminderNotification } from '../models/reminder.model';
import { WebSocketService } from './websocket.service';
import { devError } from '../utils/environment.utils';

@Injectable({
  providedIn: 'root'
})
export class ReminderService implements OnDestroy {
  private snackBar = inject(MatSnackBar);
  private wsService = inject(WebSocketService);
  private destroy$ = new Subject<void>();

  initialize(): void {
    this.wsService.getReminders()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (reminder) => this.showReminder(reminder),
        error: (error) => devError('Error receiving reminder:', error)
      });
  }

  private showReminder(reminder: ReminderNotification): void {
    const message = `Reminder: ${reminder.title} starts in ${reminder.minutesBefore} minutes`;
    this.snackBar.open(message, 'Dismiss', {
      duration: 10000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['reminder-snackbar']
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
