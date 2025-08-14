import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-cancel',
  templateUrl: './payment-cancel.component.html',
  styleUrls: ['./payment-cancel.component.css']
})
export class PaymentCancelComponent implements OnInit {

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Optional: You can add any initialization logic here
    // For example, logging the cancellation event
    console.log('Payment was cancelled by user');
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  navigateToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  navigateToCart(): void {
    this.router.navigate(['/cart']);
  }
}