import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private baseUrl ='http://localhost:5000/api/wishlist'
    // 'https://e-commerce-back-end-khaki-two.vercel.app/api/wishlist';
  
  // Add BehaviorSubject to track wishlist items
  private wishlistItemsSubject = new BehaviorSubject<string[]>([]);
  public wishlistItems$ = this.wishlistItemsSubject.asObservable();

  constructor(private http: HttpClient) {
    // Load wishlist on service initialization only if user is authenticated
    this.initializeWishlist();
  }

  private initializeWishlist(): void {
    // Check if user is authenticated before loading wishlist
    const token = localStorage.getItem('token');
    if (token) {
      this.loadWishlistItems();
    }
  }

  private getHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        "Authorization": `${token}`,
        'Content-Type': 'application/json',
      }),
    };
  }

  getWishlist(): Observable<any> {
    return this.http.get(this.baseUrl, this.getHeaders());
  }

  addToWishlist(productId: string): Observable<any> {
    return this.http.post(this.baseUrl, { productId }, this.getHeaders());
  }

  removeFromWishlist(productId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${productId}`, this.getHeaders());
  }

  // Method to check if product is in wishlist
  isInWishlist(productId: string): boolean {
    return this.wishlistItemsSubject.value.includes(productId);
  }

  // Method to load and update wishlist items
  loadWishlistItems(): void {
    // Don't make API call if user is not authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      this.wishlistItemsSubject.next([]);
      return;
    }

    this.getWishlist().subscribe({
      next: (res) => {
        const productIds = res.products?.map((product: any) => product._id || product.productId) || [];
        this.wishlistItemsSubject.next(productIds);
      },
      error: (err) => {
        console.error('Error loading wishlist items:', err);
        // Don't clear wishlist on error unless it's authentication error
        if (err.status === 401 || err.status === 403) {
          this.wishlistItemsSubject.next([]);
        }
      }
    });
  }

  // Method to toggle wishlist status using the backend toggle endpoint
  toggleWishlist(productId: string): Observable<any> {
    return this.http.post(this.baseUrl, { productId }, this.getHeaders());
  }

  // Method to update local wishlist state
  updateWishlistState(productId: string, isAdded: boolean): void {
    const currentItems = this.wishlistItemsSubject.value;
    if (isAdded && !currentItems.includes(productId)) {
      this.wishlistItemsSubject.next([...currentItems, productId]);
    } else if (!isAdded && currentItems.includes(productId)) {
      this.wishlistItemsSubject.next(currentItems.filter(id => id !== productId));
    }
  }

  // Method to refresh wishlist data (call this when user logs in)
  refreshWishlist(): void {
    this.loadWishlistItems();
  }

  // Method to clear wishlist data (call this when user logs out)
  clearWishlist(): void {
    this.wishlistItemsSubject.next([]);
  }
}