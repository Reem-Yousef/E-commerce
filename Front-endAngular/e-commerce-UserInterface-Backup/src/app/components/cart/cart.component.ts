import { Component, OnInit, OnDestroy, TrackByFunction } from '@angular/core';
import { CartService, Cart, CartItem } from '../../services/cart.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { OrderService, SelectedProduct } from '../../services/order.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit, OnDestroy {
  increaseQuantity(arg0: string, arg1: number) {
    throw new Error('Method not implemented.');
  }
  decreaseQuantity(arg0: string, arg1: number) {
    throw new Error('Method not implemented.');
  }

  cart: Cart | null = null;
  loading = false;
  error = '';
  couponCode = '';
  hasChanges = false;
  subtotal = 0;
  total = 0;

  private cartSubscription?: Subscription;
  private originalQuantities: { [productId: string]: number } = {};

  showConfirmationPopup = false;
  confirmationTitle = '';
  confirmationMessage = '';
  private pendingAction: (() => void) | null = null;

  trackByProductId: TrackByFunction<CartItem> = (index, item) => {
    return item.product._id;
  };

  constructor(
    private cartService: CartService,
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.loadCart();
    this.cartSubscription = this.cartService.cart$.subscribe((cart) => {
      this.cart = cart;
      this.loading = false;
      this.storeOriginalQuantities();
      this.hasChanges = false;

      // حساب المبالغ أول مرة
      this.calculateTotals();
    });
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  private storeOriginalQuantities(): void {
    if (this.cart && this.cart.items) {
      this.originalQuantities = {};
      this.cart.items.forEach((item) => {
        this.originalQuantities[item.product._id] = item.quantity;
      });
    }
  }

  private checkForChanges(): void {
    if (!this.cart || !this.cart.items) {
      this.hasChanges = false;
      return;
    }

    this.hasChanges = this.cart.items.some((item) => {
      const originalQuantity = this.originalQuantities[item.product._id];
      return (
        originalQuantity !== undefined && originalQuantity !== item.quantity
      );
    });
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

  loadCart(): void {
    this.loading = true;
    this.error = '';
    this.cartService.loadCart().subscribe({
      next: (cart) => {
        this.cart = cart;
        this.loading = false;
        this.storeOriginalQuantities();
        this.hasChanges = false;
        this.calculateTotals();
      },
      error: (err) => {
        this.error = 'Failed to load cart';
        this.loading = false;
        console.error('Cart loading error:', err);
      },
    });
  }

  onQuantityChange(productId: string, newQuantity: number): void {
    if (newQuantity < 1) {
      newQuantity = 1;
      if (this.cart && this.cart.items) {
        const item = this.cart.items.find(
          (item) => item.product._id === productId
        );
        if (item) {
          item.quantity = 1;
        }
      }
    }
    this.checkForChanges();
  }

  updateCart(): void {
    if (!this.hasChanges || !this.cart) {
      return;
    }

    this.loading = true;
    const updatePromises = this.cart.items.map((item) => {
      const originalQuantity = this.originalQuantities[item.product._id];
      if (originalQuantity !== item.quantity) {
        return this.cartService
          .updateQuantity(item.product._id, item.quantity)
          .toPromise();
      }
      return Promise.resolve();
    });

    Promise.all(updatePromises)
      .then(() => {
        this.storeOriginalQuantities();
        this.hasChanges = false;
        this.loading = false;

        // تحديث المبالغ بعد نجاح الحفظ
        this.calculateTotals();
      })
      .catch((err) => {
        this.error = 'Failed to update cart';
        this.loading = false;
        console.error('Update cart error:', err);
      });
  }

  updateQuantity(productId: string, newQuantity: number): void {
    if (newQuantity < 1) {
      this.showRemoveConfirmation(productId);
      return;
    }

    this.cartService.updateQuantity(productId, newQuantity).subscribe({
      next: () => {},
      error: (err) => {
        this.error = 'Failed to update quantity';
        console.error('Update quantity error:', err);
      },
    });
  }

  showRemoveConfirmation(productId: string): void {
    const item = this.cart?.items.find(
      (item) => item.product._id === productId
    );
    const productName =
      item?.product.name || item?.product.title || 'this item';

    this.confirmationTitle = 'Remove Item';
    this.confirmationMessage = `Are you sure you want to remove "${productName}" from your cart?`;
    this.showConfirmationPopup = true;
    this.pendingAction = () => this.removeItem(productId);
  }

  showClearCartConfirmation(): void {
    this.confirmationTitle = 'Clear Cart';
    this.confirmationMessage =
      'Are you sure you want to remove all items from your cart? This action cannot be undone.';
    this.showConfirmationPopup = true;
    this.pendingAction = () => this.clearCart();
  }

  confirmAction(): void {
    if (this.pendingAction) {
      this.pendingAction();
    }
    this.hideConfirmationPopup();
  }

  cancelAction(): void {
    this.hideConfirmationPopup();
  }

  private hideConfirmationPopup(): void {
    this.showConfirmationPopup = false;
    this.confirmationTitle = '';
    this.confirmationMessage = '';
    this.pendingAction = null;
  }

  removeItem(productId: string): void {
    this.cartService.removeFromCart(productId).subscribe({
      next: () => {
        this.storeOriginalQuantities();
        this.hasChanges = false;
        this.calculateTotals();
      },
      error: (err) => {
        this.error = 'Failed to remove item';
        console.error('Remove item error:', err);
      },
    });
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe({
      next: () => {
        this.cart = null;
        this.originalQuantities = {};
        this.hasChanges = false;
        this.subtotal = 0;
        this.total = 0;
      },
      error: (err) => {
        this.error = 'Failed to clear cart';
        console.error('Clear cart error:', err);
      },
    });
  }

  private calculateTotals(): void {
    if (!this.cart) {
      this.subtotal = 0;
      this.total = 0;
      return;
    }
    this.subtotal = this.cartService.getCartTotal();
    this.total = this.subtotal; // لو فيه شحن أو ضريبة ضيفهم هنا
  }

  proceedToCheckout(): void {
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
      this.router.navigate(['/checkout']);
    }
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  getItemSubtotal(item: CartItem): number {
    return item.product.price * item.quantity;
  }
}
