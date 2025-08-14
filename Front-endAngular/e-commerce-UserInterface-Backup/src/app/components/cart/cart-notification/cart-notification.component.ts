import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartNotificationService, CartNotification } from '../../../services/cart-notification.service';

@Component({
  selector: 'app-cart-notification',
  templateUrl: './cart-notification.component.html',
  styleUrls: ['./cart-notification.component.css']
})
export class CartNotificationComponent implements OnInit, OnDestroy {
  notification: CartNotification = { show: false, productName: '', message: '' };
  private subscription?: Subscription;

  constructor(
    private cartNotificationService: CartNotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subscription = this.cartNotificationService.notification$.subscribe(
      notification => {
        this.notification = notification;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  viewCart(): void {
    this.cartNotificationService.hideNotification();
    this.router.navigate(['/cart']);
  }

  closeNotification(): void {
    this.cartNotificationService.hideNotification();
  }
}

