import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Appointment } from '../models/appointment.model';
import { Instant } from '../models/instant.type';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/appointments`;

  private appointmentsSignal = signal<Appointment[]>([]);
  appointments = this.appointmentsSignal.asReadonly();

  getAll(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(this.apiUrl).pipe(
      tap(appointments => this.appointmentsSignal.set(appointments)),
      catchError(this.handleError)
    );
  }

  getByDateRange(start: Instant, end: Instant): Observable<Appointment[]> {
    const params = new HttpParams()
      .set('start', start)
      .set('end', end);
    return this.http.get<Appointment[]>(this.apiUrl, { params }).pipe(
      tap(appointments => this.appointmentsSignal.set(appointments)),
      catchError(this.handleError)
    );
  }

  getById(id: number): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  create(appointment: Appointment): Observable<Appointment> {
    return this.http.post<Appointment>(this.apiUrl, appointment).pipe(
      tap(newApp => this.appointmentsSignal.update(apps => [...apps, newApp])),
      catchError(this.handleError)
    );
  }

  update(id: number, updates: Partial<Appointment>): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/${id}`, updates).pipe(
      tap(updatedApp => this.appointmentsSignal.update(apps =>
        apps.map(app => app.id === id ? updatedApp : app)
      )),
      catchError(this.handleError)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.appointmentsSignal.update(apps => apps.filter(app => app.id !== id))),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server error (${error.status}): ${error.message}`;
    }

    console.error('AppointmentService error:', errorMessage);
    return throwError(() => error);
  }

  addAppointment(appointment: Appointment): void {
    this.appointmentsSignal.update(apps => [...apps, appointment]);
  }

  updateAppointment(appointment: Appointment): void {
    this.appointmentsSignal.update(apps =>
      apps.map(app => app.id === appointment.id ? appointment : app)
    );
  }

  removeAppointment(id: number): void {
    this.appointmentsSignal.update(apps => apps.filter(app => app.id !== id));
  }
}
