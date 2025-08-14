import { Component, OnInit } from '@angular/core';
import { WishlistService } from '../../services/wishlist.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css'],
})
export class WishlistComponent implements OnInit {
  wishlist: any[] = [];
  loading = false;

  constructor(private wishlistService: WishlistService) {}

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist() {
    this.loading = true;
    this.wishlistService.getWishlist().subscribe({
      next: (res) => {
        this.wishlist = res.products;
        this.loading = false;
        // Update the wishlist service state
        this.wishlistService.loadWishlistItems();
      },
      error: (err) => {
        console.error('Error loading wishlist:', err);
        this.loading = false;
      },
    });
  }

  removeItem(productId: string) {
    this.wishlistService.removeFromWishlist(productId).subscribe({
      next: () => {
        // Update local state immediately for better UX
        this.wishlist = this.wishlist.filter(item => item._id !== productId);
        // Update the service state
        this.wishlistService.updateWishlistState(productId, false);
        // Optionally reload to ensure consistency
        // this.loadWishlist();
      },
      error: (err) => {
        console.error('Remove failed', err);
        this.loadWishlist();
      },
    });
  }
}