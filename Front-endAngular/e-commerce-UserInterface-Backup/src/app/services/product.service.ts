import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import {
  Product,
  ProductFilter,
  ProductReview,
  SearchParams,
  SearchResponse,
  SearchSuggestionsResponse
} from '../models/product.model';
import { HttpHeaders } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:5000/api';
  // private apiUrl = 'https://e-commerce-back-end-khaki-two.vercel.app/api';

  constructor(private http: HttpClient) { }

  private mapProduct(backendProduct: any): Product {
    return {
      ...backendProduct,
      id: backendProduct._id,
      name: backendProduct.title,
      category: backendProduct.brand,
      inStock: backendProduct.stock > 0,
      rating: backendProduct.ratings ? backendProduct.ratings.average : 0,
      reviewCount: backendProduct.ratings ? backendProduct.ratings.count : 0
    };
  }

  private mapReview(backendReview: any): ProductReview {
    return {
      ...backendReview,
      id: backendReview._id,
      userName: backendReview.userId ? backendReview.userId.name : 'Anonymous',
      date: new Date(backendReview.createdAt)
    };
  }


getProducts(filter?: ProductFilter): Observable<Product[]> {
  let params = new HttpParams();

  if (filter) {
    if (filter.brand) {
      params = params.set('brand', filter.brand);
    }
    if (filter.minPrice !== undefined) {
      params = params.set('minPrice', filter.minPrice.toString());
    }
    if (filter.maxPrice !== undefined) {
      params = params.set('maxPrice', filter.maxPrice.toString());
    }
    if (filter.sortBy) {
      params = params.set('sortBy', filter.sortBy);
    }
    if (filter.sortOrder) {
      params = params.set('sortOrder', filter.sortOrder);
    }
  }

  return this.http.get<{ allProducts: any[] }>(`${this.apiUrl}/products`, { params }).pipe(
    map(response => response.allProducts.map(p => this.mapProduct(p))),
    catchError(this.handleError<Product[]>('getProducts', []))
  );
}

  // New search method
  searchProducts(searchParams: SearchParams): Observable<SearchResponse> {
    let params = new HttpParams();

    // Add search parameters
    if (searchParams.q) {
      params = params.set('q', searchParams.q);
    }
    if (searchParams.brand) {
      params = params.set('brand', searchParams.brand);
    }
    if (searchParams.minPrice !== undefined) {
      params = params.set('minPrice', searchParams.minPrice.toString());
    }
    if (searchParams.maxPrice !== undefined) {
      params = params.set('maxPrice', searchParams.maxPrice.toString());
    }
    if (searchParams.inStock !== undefined) {
      params = params.set('inStock', searchParams.inStock.toString());
    }
    if (searchParams.minRating !== undefined) {
      params = params.set('minRating', searchParams.minRating.toString());
    }
    if (searchParams.sortBy) {
      params = params.set('sortBy', searchParams.sortBy);
    }
    if (searchParams.order) {
      params = params.set('order', searchParams.order);
    }
    if (searchParams.page) {
      params = params.set('page', searchParams.page.toString());
    }
    if (searchParams.limit) {
      params = params.set('limit', searchParams.limit.toString());
    }

    return this.http.get<any>(`${this.apiUrl}/products/search`, { params }).pipe(
      map(response => ({
        ...response,
        products: response.products.map((p: any) => this.mapProduct(p))
      })),
      catchError(this.handleError<SearchResponse>('searchProducts', {
        message: 'Search failed',
        query: searchParams.q || '',
        total: 0,
        page: 1,
        limit: 12,
        totalPages: 0,
        results: 0,
        products: [],
        suggestions: [],
        filters: { brands: [], priceRange: { min: 0, max: 1000 }, maxRating: 5 }
      }))
    );
  }

  // Get search suggestions for auto-complete
  getSearchSuggestions(query: string): Observable<string[]> {
    if (!query || query.trim().length < 2) {
      return of([]);
    }

    const params = new HttpParams().set('q', query.trim());

    return this.http.get<SearchSuggestionsResponse>(`${this.apiUrl}/products/search/suggestions`, { params }).pipe(
      map(response => response.suggestions),
      debounceTime(300), // Wait 300ms after user stops typing
      distinctUntilChanged(), // Only emit when the query changes
      catchError(this.handleError<string[]>('getSearchSuggestions', []))
    );
  }

  // Get available brands for filter dropdown
  getAvailableBrands(): Observable<string[]> {
    return this.searchProducts({}).pipe(
      map(response => response.filters.brands),
      catchError(this.handleError<string[]>('getAvailableBrands', []))
    );
  }

  // Get price range for filter sliders
  getPriceRange(): Observable<{ min: number; max: number }> {
    return this.searchProducts({}).pipe(
      map(response => response.filters.priceRange),
      catchError(this.handleError<{ min: number; max: number }>('getPriceRange', { min: 0, max: 1000 }))
    );
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<any>(`${this.apiUrl}/products/${id}`)
      .pipe(
        map(p => this.mapProduct(p)),
        catchError(this.handleError<Product>('getProduct'))
      );
  }

  getProductsByCategory(brand: string): Observable<Product[]> {
  let params = new HttpParams().set('brand', brand);
  return this.http.get<any>(`${this.apiUrl}/products`, { params })
    .pipe(
      map(response => response.allProducts.map((p: any) => this.mapProduct(p))),
      catchError(this.handleError<Product[]>('getProductsByCategory', []))
    );
}


  getProductReviews(productId: string): Observable<{ count: number, reviews: ProductReview[] }> {
  return this.http.get<any>(`${this.apiUrl}/reviews/product/${productId}`)
    .pipe(
      map(response => ({
        count: response.count,
        reviews: response.reviews.map((r: any) => this.mapReview(r))
      })),
      catchError(this.handleError<{ count: number, reviews: ProductReview[] }>('getProductReviews', { count: 0, reviews: [] }))
    );
}

  submitReview(reviewData: { productId: string, rating: number, comment: string }): Observable<any> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders({
    'Authorization': ` ${token}`
  });

  return this.http.post(`${this.apiUrl}/reviews`, reviewData, { headers })
    .pipe(
      catchError(this.handleError<any>('submitReview'))
    );
}

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return of(result as T);
    };
  }
}

