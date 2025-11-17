import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { AppointmentType } from '../models/appointment-type.model';
import { environment } from '../../environments/environment';
import { devError } from '../utils/environment.utils';

@Injectable({
  providedIn: 'root'
})
export class AppointmentTypeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/appointment-types`;

  private appointmentTypesSignal = signal<AppointmentType[]>([]);
  appointmentTypes = this.appointmentTypesSignal.asReadonly();

  getAll(): Observable<AppointmentType[]> {
    return this.http.get<AppointmentType[]>(this.apiUrl).pipe(
      tap(types => this.appointmentTypesSignal.set(types)),
      catchError(this.handleError)
    );
  }

  getById(id: number): Observable<AppointmentType> {
    return this.http.get<AppointmentType>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  create(appointmentType: AppointmentType): Observable<AppointmentType> {
    return this.http.post<AppointmentType>(this.apiUrl, appointmentType).pipe(
      tap(newType => this.appointmentTypesSignal.update(types => [...types, newType])),
      catchError(this.handleError)
    );
  }

  update(id: number, updates: Partial<AppointmentType>): Observable<AppointmentType> {
    return this.http.patch<AppointmentType>(`${this.apiUrl}/${id}`, updates).pipe(
      tap(updatedType => this.appointmentTypesSignal.update(types =>
        types.map(type => type.id === id ? updatedType : type)
      )),
      catchError(this.handleError)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.appointmentTypesSignal.update(types => types.filter(type => type.id !== id))),
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

    devError('AppointmentTypeService error:', errorMessage);
    return throwError(() => error);
  }
}
