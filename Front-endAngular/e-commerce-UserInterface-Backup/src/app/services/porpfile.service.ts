import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private baseUrl = 'http://localhost:5000/api/userInfo/user'
    // 'https://e-commerce-back-end-khaki-two.vercel.app/api/userInfo/user';
  private ordersUrl = 'http://localhost:5000/api/order'
    // 'https://e-commerce-back-end-khaki-two.vercel.app/api/order';

  constructor(private http: HttpClient) {}
  private getUserIdFromToken(): string {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token not found');

    const decoded: any = jwtDecode(token);
    return decoded.userId;
  }
  getUserInfo(): Observable<any> {
    const userId = this.getUserIdFromToken();
    return this.http.get(`${this.baseUrl}/${userId}`);
  }
  updateUser(data: any): Observable<any> {
    const userId = this.getUserIdFromToken();
    return this.http.put(`${this.baseUrl}/${userId}`, data);
  }
  getUserOrders() {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token not found');

    const headers = {
      Authorization: `${token}`,
    };

    return this.http.get(`${this.ordersUrl}/orders`, { headers });
  }
}
