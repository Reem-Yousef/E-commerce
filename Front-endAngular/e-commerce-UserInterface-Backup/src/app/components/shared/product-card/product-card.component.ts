import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Product } from '../../../models/product.model';
import { CartService } from '../../../services/cart.service';
import { WishlistService } from '../../../services/wishlist.service';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css'],
})
export class ProductCardComponent implements OnInit, OnDestroy {
  addingToCart: { [productId: string]: boolean } = {};
  addingToWishlist: { [productId: string]: boolean } = {};
  isInWishlist = false;
  @Input() product!: Product;
  
  private wishlistSubscription?: Subscription;

  constructor(
    private cartService: CartService,
    private wishlistService: WishlistService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to wishlist changes
    this.wishlistSubscription = this.wishlistService.wishlistItems$.subscribe(
      (wishlistItems) => {
        this.isInWishlist = wishlistItems.includes(this.product._id);
      }
    );
  }

  ngOnDestroy(): void {
    if (this.wishlistSubscription) {
      this.wishlistSubscription.unsubscribe();
    }
  }

  navigateToProduct(): void {
    this.router.navigate(['/product', this.product._id]);
  }

  isAddingToCart(productId: string): boolean {
    return !!this.addingToCart[productId];
  }

  isAddingToWishlist(productId: string): boolean {
    return !!this.addingToWishlist[productId];
  }

  addToCart(): void {
    const productId = this.product._id;
    this.addingToCart[productId] = true;

    this.cartService.addToCart(productId, 1).subscribe({
      next: () => {
        this.addingToCart[productId] = false;
        this.cartService.loadCart().subscribe();
        Swal.fire({
          icon: 'success',
          title: 'Added!',
          text: 'The product has been added to your cart successfully.',
          confirmButtonText: 'OK',
        });
      },
      error: (err) => {
        this.addingToCart[productId] = false;
        if (err.status === 401 || err.status === 403) {
          Swal.fire({
            icon: 'error',
            title: 'Session Expired',
            text: 'Your session has expired. Please login again.',
            confirmButtonText: 'Login',
          }).then(() => {
            localStorage.removeItem('token');
            this.router.navigate(['/signin']);
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Something went wrong. Please try again.',
            confirmButtonText: 'OK',
          });
        }
      },
    });
  }

  toggleWishlist(productId: string): void {
    if (!this.authService.isAuthenticated()) {
      Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please login to use the wishlist feature.',
        confirmButtonText: 'Login',
      }).then(() => {
        this.router.navigate(['/signin']);
      });
      return;
    }

    // Prevent multiple clicks
    if (this.addingToWishlist[productId]) {
      return;
    }

    this.addingToWishlist[productId] = true;
    const wasInWishlist = this.isInWishlist;

    this.wishlistService.toggleWishlist(productId).subscribe({
      next: (response) => {
        this.addingToWishlist[productId] = false;
        
        // Update the wishlist state based on backend response
        const isAdded = response.status === 'added';
        this.wishlistService.updateWishlistState(productId, isAdded);
        
        // Show appropriate success message based on backend response
        if (response.status === 'added') {
          Swal.fire({
            icon: 'success',
            title: 'Added to Wishlist!',
            text: response.message || 'This product was added to your wishlist.',
            confirmButtonText: 'OK',
          });
        } else if (response.status === 'removed') {
          Swal.fire({
            icon: 'success',
            title: 'Removed from Wishlist!',
            text: response.message || 'This product was removed from your wishlist.',
            confirmButtonText: 'OK',
          });
        }
      },
      error: (err) => {
        this.addingToWishlist[productId] = false;
        console.error('Wishlist operation failed:', err);
        
        if (err.status === 401 || err.status === 403) {
          Swal.fire({
            icon: 'error',
            title: 'Session Expired',
            text: 'Your session has expired. Please login again.',
            confirmButtonText: 'Login',
          }).then(() => {
            localStorage.removeItem('token');
            this.router.navigate(['/login']);
          });
        } else if (err.status === 400 && err.error?.message?.includes('Maximum wishlist limit')) {
          Swal.fire({
            icon: 'warning',
            title: 'Wishlist Full',
            text: 'You have reached the maximum wishlist limit of 20 items.',
            confirmButtonText: 'OK',
          });
        } else {
          const errorMessage = err.error?.message || 'Something went wrong. Please try again.';
          Swal.fire({
            icon: 'error',
            title: 'Oops!',
            text: errorMessage,
            confirmButtonText: 'OK',
          });
        }
      },
    });
  }
}