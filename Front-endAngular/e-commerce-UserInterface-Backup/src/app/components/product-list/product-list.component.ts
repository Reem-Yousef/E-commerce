import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product, SearchParams, SearchResponse } from '../../models/product.model';
import { CartService } from '../../services/cart.service';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';
import * as AOS from 'aos';


@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  loading = true;
  error = '';
  brands: string[] = [];

  // Search functionality
  searchQuery = '';
  searchSuggestions: string[] = [];
  showSuggestions = false;
  searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalResults = 0;
  itemsPerPage = 12;

  // Filters
  selectedBrand = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  inStockOnly = false;
  minRating: number | null = null;
  priceRange = { min: 0, max: 1000 };

  sortOptions = [
    { value: 'relevance', label: 'Sort' },
    { value: 'newest', label: 'Sort by latest' },
    { value: 'rating', label: 'Sort by average rating' },
    { value: 'price', label: 'Sort by price: low to high' },
    { value: 'price-high', label: 'Sort by price: high to low' },
    { value: 'name', label: 'Sort by name' }
  ];

  selectedSort = 'relevance';
  sortOrder: 'asc' | 'desc' = 'desc';
  resultsCount = 0;
  addingToCartIds: Set<string> = new Set();

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initializeSearchSuggestions();
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeSearchSuggestions(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => this.productService.getSearchSuggestions(query)),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (suggestions) => {
        this.searchSuggestions = suggestions;
        this.showSuggestions = suggestions.length > 0 && this.searchQuery.length > 1;
      },
      error: (error) => {
        console.error('Error getting suggestions:', error);
        this.searchSuggestions = [];
        this.showSuggestions = false;
      }
    });
  }

  private loadInitialData(): void {
    // Load initial products and filters
    this.performSearch();
    this.loadAvailableBrands();
    this.loadPriceRange();
  }

  private loadAvailableBrands(): void {
    this.productService.getAvailableBrands().subscribe({
      next: (brands: string[]) => {
        this.brands = brands;
      },
      error: (error: any) => {
        console.error('Error loading brands:', error);
      }
    });
  }

  private loadPriceRange(): void {
    this.productService.getPriceRange().subscribe({
      next: (range) => {
        this.priceRange = range;
      },
      error: (error) => {
        console.error('Error loading price range:', error);
      }
    });
  }

  // Search functionality
  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery = target.value;

    if (this.searchQuery.length > 1) {
      this.searchSubject.next(this.searchQuery);
    } else {
      this.searchSuggestions = [];
      this.showSuggestions = false;
    }
  }

  onSearchSubmit(): void {
    this.hideSuggestions();
    this.currentPage = 1;
    this.performSearch();
  }

  selectSuggestion(suggestion: string): void {
    this.searchQuery = suggestion;
    this.hideSuggestions();
    this.currentPage = 1;
    this.performSearch();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.hideSuggestions();
    this.currentPage = 1;
    this.performSearch();
  }

  hideSuggestions(): void {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  // Main search method
  private performSearch(): void {
    this.loading = true;
    this.error = '';

    const searchParams: SearchParams = {
      q: this.searchQuery || undefined,
      brand: this.selectedBrand || undefined,
      minPrice: this.minPrice || undefined,
      maxPrice: this.maxPrice || undefined,
      inStock: this.inStockOnly || undefined,
      minRating: this.minRating || undefined,
      sortBy: this.getSortBy(),
      order: this.sortOrder,
      page: this.currentPage,
      limit: this.itemsPerPage
    };

    this.productService.searchProducts(searchParams).subscribe({
      next: (response: SearchResponse) => {
        this.filteredProducts = response.products;
        this.totalResults = response.total;
        this.totalPages = response.totalPages;
        this.resultsCount = response.results;
        this.loading = false;

        // Update available brands if not already loaded
        if (this.brands.length === 0) {
          this.brands = response.filters.brands;
        }

        // Update price range if not already loaded
        if (this.priceRange.min === 0 && this.priceRange.max === 1000) {
          this.priceRange = response.filters.priceRange;
        }

        if (response.products.length === 0) {
          this.error = this.searchQuery ?
            `No products found for "${this.searchQuery}"` :
            'No products found';
        }
      },
      error: (error: any) => {
        this.error = 'Failed to load products';
        this.loading = false;
        console.error('Error searching products:', error);
      }
    });
  }

  private getSortBy(): 'relevance' | 'price' | 'rating' | 'newest' | 'oldest' | 'name' {
    if (this.selectedSort === 'price-high') {
      this.sortOrder = 'desc';
      return 'price';
    }
    return this.selectedSort as 'relevance' | 'price' | 'rating' | 'newest' | 'oldest' | 'name';
  }

  // Filter methods
  onSortChange(sortValue: string): void {
    this.selectedSort = sortValue;
    if (sortValue === 'price-high') {
      this.sortOrder = 'desc';
    } else if (sortValue === 'price') {
      this.sortOrder = 'asc';
    } else {
      this.sortOrder = 'desc';
    }
    this.currentPage = 1;
    this.performSearch();
  }

  onBrandChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedBrand = target.value;
    this.currentPage = 1;
    this.performSearch();
  }

  onPriceRangeChange(): void {
    this.currentPage = 1;
    this.performSearch();
  }

  onInStockChange(): void {
    this.currentPage = 1;
    this.performSearch();
  }

  onRatingChange(): void {
    this.currentPage = 1;
    this.performSearch();
  }

  clearFilters(): void {
    this.selectedBrand = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.inStockOnly = false;
    this.minRating = null;
    this.currentPage = 1;
    this.performSearch();
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.performSearch();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.performSearch();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.performSearch();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  loadProducts(): void {
    this.performSearch();
  }

  filterByBrand(brand: string): void {
    this.selectedBrand = brand;
    this.currentPage = 1;
    this.performSearch();
  }

  // Cart functionality
  addToCart(product: Product): void {
    const token = localStorage.getItem('token');
    if (!token) {
      Swal.fire({
        title: 'Login Required',
        text: 'Please login to add items to cart',
        icon: 'warning',
        confirmButtonText: 'Login'
      }).then(() => {
        this.router.navigate(['/login']);
      });
      return;
    }

    const productId = product._id || product.id;
    if (!productId) {
      console.error('Product ID is missing:', product);
      return;
    }

    if (!this.addingToCartIds.has(productId)) {
      this.addingToCartIds.add(productId);

      this.cartService.addToCart(productId, 1).subscribe({
        next: () => {
          console.log('Added to cart:', product.name);
          this.addingToCartIds.delete(productId);

          Swal.fire({
            title: `${product.name} added to cart ✅`,
            text: 'Do you want to view your cart?',
            icon: 'success',
            showCancelButton: true,
            confirmButtonText: 'Yes, go to cart',
            cancelButtonText: 'No, stay here',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#aaa'
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigate(['/cart']);
            }
          });
        },
        error: (err) => {
          console.error('Failed to add to cart:', err);
          this.addingToCartIds.delete(productId);

          if (err.status === 401 || err.status === 403) {
            Swal.fire({
              title: 'Session Expired',
              text: 'Please login again to continue',
              icon: 'warning',
              confirmButtonText: 'Login'
            }).then(() => {
              localStorage.removeItem('token');
              this.router.navigate(['/login']);
            });
          } else {
            Swal.fire({
              title: 'Error!',
              text: 'Failed to add product to cart. Try again later.',
              icon: 'error'
            });
          }
        }
      });
    }
  }

  isAddingToCart(productId: string): boolean {
    return this.addingToCartIds.has(productId);
  }

  trackByProductId(index: number, product: Product): string {
    return product._id;
  }

  ngAfterViewInit(): void {
      AOS.init();
    }
}

