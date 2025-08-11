import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, map, catchError, of } from 'rxjs';
import { inject } from '@angular/core';
import { loginModel, registerModel, registerResponse } from '../models/auth.model';



@Injectable({
  providedIn: 'root'
})
export class AuthServices {
  private apiUrl = environment.apiUrl;
  private router = inject(Router);
  private http = inject(HttpClient);

  login(data: loginModel): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}login`, data).pipe(
      tap(response => {
        localStorage.setItem('token', response.data.token.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      })
    );
  }

  logout(): void {
    this.http.post(`${this.apiUrl}logout`, {}).subscribe({
      next: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.router.navigate(['/auth']);
      },
      error: (error) => {
        console.error('Logout failed', error);
      }
    })
  }

  register(data: registerModel): Observable<registerResponse> {
    return this.http.post<registerResponse>(`${this.apiUrl}register`, data);
  }

  isAuthenticated(): Observable<boolean> {
  return this.http.get(`${this.apiUrl}me`).pipe(
    tap({
      next: (response) => console.log('User is authenticated', response),
      error: (error) => console.error('User is not authenticated', error)
    }),
    // Si la petición es exitosa, retorna true; si falla, retorna false
    map(() => true),
    catchError(() => of(false))
  );
}

}