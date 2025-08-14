import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://127.0.0.1:5000/api/auth'
  // 'https://e-commerce-back-end-khaki-two.vercel.app/api/auth';

  constructor(private http: HttpClient) {}
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, data).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
      })
    );
  }
  logout() {
    return this.http.post(
      `${this.baseUrl}/logout`,
      {},
      {
        headers: {
          Authorization: `${localStorage.getItem('token')}`,
        },
      }
    );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}