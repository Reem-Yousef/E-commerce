import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { CartService, Cart, CartItem } from '../../../services/cart.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { OrderService, SelectedProduct } from '../../../services/order.service';

@Component({
  selector: 'app-cart-icon',
  templateUrl: './cart-icon.component.html',
  styleUrls: ['./cart-icon.component.css']
})
export class CartIconComponent implements OnInit, OnDestroy {
  cart: Cart = {
    items: [],
    _id: '',
    user: ''
  };
  
  itemCount = 0;
  cartTotal = 0;
  showMiniCart = false;
  private cartSubscription: Subscription | undefined;
  
  constructor(
    public cartService: CartService,
    private router: Router,
    private el: ElementRef,
    private orderService: OrderService
  ) {}
  
  closeNavbar() {
    const navbar = this.el.nativeElement.querySelector('#mainMenu');
    if (navbar.classList.contains('show')) {
      navbar.classList.remove('show');
    }
  }

  ngOnInit(): void {
    this.cartSubscription = this.cartService.cart$.subscribe(cart => {
      this.cart = cart || {
        items: [],
        _id: '',
        user: ''
      };
      this.updateCartStats();
    });

    this.loadCart();
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  private updateCartStats(): void {
    this.itemCount = this.cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;
    this.cartTotal = this.cart?.items?.reduce((total, item) => total + (item.product.price * item.quantity), 0) || 0;
  }

 private loadCart(): void {
  if (this.cartService['isAuthenticated']()) {
    this.cartService.loadCart().subscribe({
      next: (cart) => {
      },
      error: (err) => console.error('Failed to load cart:', err)
    });
  }
}

  toggleMiniCart(event: Event): void {
    event.stopPropagation();
    this.showMiniCart = !this.showMiniCart;
    
    if (this.showMiniCart) {
      this.closeNavbar();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMiniCart(): void {
    this.showMiniCart = false;
    document.body.style.overflow = '';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.showMiniCart) {
      const target = event.target as HTMLElement;
      const clickedInside = target.closest('.cart-icon-container') !== null;
      
      if (!clickedInside) {
        this.closeMiniCart();
      }
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.showMiniCart) {
      this.closeMiniCart();
    }
  }

  removeItem(productId: string): void {
    this.cartService.removeFromCart(productId).subscribe({
      next: () => {
      },
      error: (err) => console.error('Error removing item:', err)
    });
  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity < 1) {
      this.removeItem(item.product._id);
      return;
    }

    this.cartService.updateQuantity(item.product._id, newQuantity).subscribe({
      error: (err) => console.error('Error updating quantity:', err)
    });
  }

  navigateToCart(): void {
    this.closeMiniCart();
    this.router.navigate(['/cart']);
  }

  proceedToCheckout(): void {
    console.log('proceedToCheckout called');
    if (this.cart && this.cart.items.length > 0) {
      console.log('Navigating to checkout...');
    } else {
      console.log('Cart empty or missing, not navigating');
    }

    if (this.cart && this.cart.items.length > 0) {
      const selectedProducts: SelectedProduct[] = this.cart.items.map(
         (item) => ({
      id: String(item.product._id),
      name: item.product.name || item.product.title || 'Unnamed Product',
      price: item.product.price,
      status: 'Available',
      inProperty: item.quantity,
      quantity: item.quantity,
    })
      );
      this.orderService.settings(selectedProducts);
      this.closeMiniCart();
      this.router.navigate(['/checkout']);
    }
  }


  continueShopping(): void {
    this.closeMiniCart();
    this.router.navigate(['/products']);
  }

  getItemSubtotal(item: CartItem): number {
    return item.product.price * item.quantity;
  }

  trackByProductId(index: number, item: CartItem): string {
    return item.product._id;
  }

  getProductImage(product: any): string {

 if (product.images && product.images.length > 0 && product.images[0]) {
    return product.images[0];
  }
  
  if (product.image) {
    return product.image;
  }
  return 'assets/images/stats-count.jpg';
}

handleImageError(event: Event): void {
  const img = event.target as HTMLImageElement;
  if (!img.src.includes('placeholder.jpg')) {
    img.src = 'assets/images/stats-count.jpg';
    img.onerror = null; 
  }
}
}