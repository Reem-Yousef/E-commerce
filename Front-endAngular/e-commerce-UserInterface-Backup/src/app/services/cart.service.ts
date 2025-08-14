import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';

export interface CartItem {
  product: {
title: any;
    id: String;
    _id: string;
    name: string;
    price: number;
    image?: string;
    description?: string;
  };
  quantity: number;
  _id: string;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:5000/api/cart';
  // private apiUrl = 'https://e-commerce-back-end-khaki-two.vercel.app/api/cart';
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  public cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {
    if (this.isAuthenticated()) {
      this.loadCart().subscribe({
        next: () => console.log(''),
        error: (err) => console.error('Failed to load cart on init:', err)
      });
    }
  }

  public isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token && token.length > 10;
  }

  private getHeaders(): HttpHeaders | null {
    const token = localStorage.getItem('token');
    if (!this.isAuthenticated()) {
      console.warn('Invalid or missing token');
      return null;
    }

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `${token}`
    });
  }

  private handleError = (error: HttpErrorResponse) => {
  console.error('Cart service error:', {
    url: error.url,
    status: error.status,
    message: error.message,
    error: error.error
  });

  if (error.status === 401) {
    const errorMessage = error.error?.message || '';
    const isTokenExpired = errorMessage.includes('token') || 
                          errorMessage.includes('expired') || 
                          errorMessage.includes('invalid') ||
                          errorMessage.includes('unauthorized');
    
    if (isTokenExpired) {
      console.warn('Authentication expired, clearing token');
      localStorage.removeItem('token');
      this.cartSubject.next(null);
    } else {
      console.warn('401 error but not token related:', errorMessage);
    }
  }

  return throwError(() => ({
    status: error.status,
    message: error.error?.message || 'An error occurred',
    error: error.error
  }));
};


  loadCart(): Observable<Cart> {
    const headers = this.getHeaders();
    if (!headers) {
      return throwError(() => ({ 
        status: 401, 
        message: 'Authentication required' 
      }));
    }

    return this.http.get<Cart>(this.apiUrl, { headers }).pipe(
      tap(cart => {
        this.cartSubject.next(cart);
      }),
      catchError(this.handleError)
    );
  }

  addToCart(productId: string, quantity: number): Observable<Cart> {
    const headers = this.getHeaders();
    if (!headers) {
      return throwError(() => ({ 
        status: 401,
        message: 'Authentication required'
      }));
    }

    return this.http.post<Cart>(
      `${this.apiUrl}/add`,
      { productId, quantity },
      { headers }
    ).pipe(
      tap(updatedCart => {
        this.cartSubject.next(updatedCart);
      }),
      catchError(this.handleError)
    );
  }

  updateQuantity(productId: string, quantity: number): Observable<Cart> {
    const headers = this.getHeaders();
    if (!headers) {
      return throwError(() => ({ 
        status: 401,
        message: 'Authentication required'
      }));
    }

    return this.http.put<Cart>(
      `${this.apiUrl}/update`,
      { productId, quantity },
      { headers }
    ).pipe(
      tap(updatedCart => this.cartSubject.next(updatedCart)),
      catchError(this.handleError)
    );
  }

  removeFromCart(productId: string): Observable<Cart> {
    const headers = this.getHeaders();
    if (!headers) {
      return throwError(() => ({ 
        status: 401,
        message: 'Authentication required'
      }));
    }

    return this.http.request<Cart>(
      'delete',
      `${this.apiUrl}/remove`,
      {
        headers,
        body: { productId }
      }
    ).pipe(
      tap(updatedCart => this.cartSubject.next(updatedCart)),
      catchError(this.handleError)
    );
  }

  clearCart(): Observable<void> {
    const headers = this.getHeaders();
    if (!headers) {
      return throwError(() => ({ 
        status: 401,
        message: 'Authentication required'
      }));
    }

    return this.http.delete<void>(
      `${this.apiUrl}/clear`,
      { headers }
    ).pipe(
      tap(() => this.cartSubject.next(null)),
      catchError(this.handleError)
    );
  }

  getCartTotal(): number {
    const cart = this.cartSubject.value;
    return cart?.items?.reduce((total, item) => total + (item.product.price * item.quantity), 0) || 0;
  }

  getCartItemCount(): number {
    const cart = this.cartSubject.value;
    return cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;
  }

  isCartEmpty(): boolean {
    const cart = this.cartSubject.value;
    return !cart?.items || cart.items.length === 0;
  }

  getCurrentCart(): Cart | null {
    return this.cartSubject.value;
  }
}