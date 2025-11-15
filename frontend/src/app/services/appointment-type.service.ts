import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AppointmentType } from '../models/appointment-type.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppointmentTypeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/appointment-types`;

  getAll(): Observable<AppointmentType[]> {
    return this.http.get<AppointmentType[]>(this.apiUrl).pipe(
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
      catchError(this.handleError)
    );
  }

  update(id: number, updates: Partial<AppointmentType>): Observable<AppointmentType> {
    return this.http.patch<AppointmentType>(`${this.apiUrl}/${id}`, updates).pipe(
      catchError(this.handleError)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
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

    console.error('AppointmentTypeService error:', errorMessage);
    return throwError(() => error);
  }
}
