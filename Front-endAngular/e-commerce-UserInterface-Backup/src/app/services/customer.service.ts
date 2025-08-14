import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from '../models/product.model';
import { User } from '../models/user.model';
import { Order } from '../models/order.model';
import { environment } from '../enviroments/enviroment';


@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private apiUrl = 'http://localhost:5000/api/';
  // private apiUrl = 'https://e-commerce-back-end-khaki-two.vercel.app/api';
  private readonly PRODUCT_URL = `${this.apiUrl}/products`;
  private readonly USER_URL = `${this.apiUrl}/userInfo`;
  private readonly ORDER_URL = `${this.apiUrl}/order`;

  private currentProductSubject = new BehaviorSubject<number | null>(null);
  currentProduct = this.currentProductSubject.asObservable();

 


  constructor(private http: HttpClient) {}


  testConnection(): Observable<any> {
    return this.http.get(`${this.ORDER_URL}`);
  }

  setCurrentProduct(productId: number): void {
    this.currentProductSubject.next(productId);
  }

  
  individualProduct(productId: number): Observable<Product> {
    return this.http.get<Product>(`${this.PRODUCT_URL}/${productId}`);
  }


  userDetail(userId: number): Observable<User> {
    return this.http.get<User>(`${this.USER_URL}/${userId}`);
  }



  
  getAllOrders(): Observable<Order[]> {
    return this.http
      .get<{ orders: Order[] }>(`${this.ORDER_URL}/all`)
      .pipe(map((res) => res.orders));
  }

  
  getOrdersByUser(userId: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.ORDER_URL}/user/${userId}`);
  }

 
  insertNewOrder(orderData: Order): Observable<{ message: string; orderId: string }> {
    return this.http.post<{ message: string; orderId: string }>(`${this.ORDER_URL}`, orderData);
  }

 
  createStripeCheckoutSession(order: any): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(`${this.ORDER_URL}/create-checkout-session`, order);
  }

  
  updateOrderStatus(orderId: string, status: string): Observable<any> {
    return this.http.patch(`${this.ORDER_URL}/${orderId}/status`, { status });
  }

}
