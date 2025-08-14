import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartNotification {
  show: boolean;
  productName: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartNotificationService {
  private notificationSubject = new BehaviorSubject<CartNotification>({
    show: false,
    productName: '',
    message: ''
  });

  notification$ = this.notificationSubject.asObservable();

  showNotification(productName: string): void {
    this.notificationSubject.next({
      show: true,
      productName,
      message: `"${productName}" has been added to your cart.`
    });

    setTimeout(() => {
      this.hideNotification();
    }, 5000);
  }

  hideNotification(): void {
    this.notificationSubject.next({
      show: false,
      productName: '',
      message: ''
    });
  }
}