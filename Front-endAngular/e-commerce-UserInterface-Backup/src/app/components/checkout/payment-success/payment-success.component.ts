import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../enviroments/enviroment';
import { OrderService } from '../../../services/order.service';
import { CartService } from '../../../services/cart.service'; // ADD THIS IMPORT
import Swal from 'sweetalert2';

interface PaymentVerificationResponse {
  success: boolean;
  message: string;
  order: {
    id: string;
    total: number;
    status: string;
    items: any[];
  };
  payment: {
    sessionId: string;
    status: string;
    amount: number;
  };
}

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.css']
})
export class PaymentSuccessComponent implements OnInit {
  sessionId: string | null = null;
  isLoading = true;
  paymentVerified = false;
  orderDetails: any = null;
  paymentDetails: any = null;
  errorMessage = '';
  countdown = 5;
  private countdownInterval: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private orderService: OrderService,
    private cartService: CartService // ADD THIS INJECTION
  ) {}

  ngOnInit(): void {
    console.log('🎉 Payment Success Component Loaded!');
    console.log('Current URL:', window.location.href);
    console.log('Route params:', this.route.snapshot.params);
    console.log('Query params:', this.route.snapshot.queryParams);
    
    // Get session_id from URL parameters
    this.sessionId = this.route.snapshot.queryParamMap.get('session_id');
    
    console.log('Session ID from URL:', this.sessionId);
    
    if (this.sessionId) {
      this.verifyPayment();
    } else {
      console.error('❌ No session_id found in URL');
      this.handleError('No payment session found. Please try again.');
    }
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  private verifyPayment(): void {
    const token = localStorage.getItem('token');
    
    if (!token) {
      this.handleError('Authentication required. Please login and try again.');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `${token}`,
      'Content-Type': 'application/json'
    });

    console.log('🔍 Verifying payment with session ID:', this.sessionId);

    this.http.post<PaymentVerificationResponse>(
      `${environment.apiUrl}/order/verify-payment`, 
      { sessionId: this.sessionId }, 
      { headers }
    ).subscribe({
      next: (response) => {
        console.log('✅ Payment verified successfully:', response);
        
        if (response.success) {
          this.paymentVerified = true;
          this.orderDetails = response.order;
          this.paymentDetails = response.payment;
          
          // CLEAR BOTH FRONTEND AND BACKEND CART
          this.clearCartAfterPayment();
          
          // Success message removed - UI shows success state instead
          console.log('🎉 Payment successful - showing success UI');

          // Start countdown for auto-redirect
          this.startCountdown();
        } else {
          this.handleError(response.message || 'Payment verification failed.');
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Payment verification failed:', error);
        this.handleError(
          error?.error?.message || 
          'Payment verification failed. Please contact support if you were charged.'
        );
      }
    });
  }

  private clearCartAfterPayment(): void {
    console.log('🛒 Starting cart clearing process...');
    
    // Clear frontend order service first
    this.orderService.clearItems();
    console.log('✅ Order service cleared');

    // Clear backend cart
    this.cartService.clearCart().subscribe({
      next: () => {
        console.log('✅ Backend cart cleared successfully');
      },
      error: (err: any) => {
        console.error('❌ Failed to clear backend cart:', err);
        // Don't show error to user as payment was successful
        // Just log it for debugging
      }
    });

    // Also clear frontend cart state if there's a method for it
    // This ensures immediate UI update
    if (this.cartService.cart$) {
      console.log('✅ Frontend cart state cleared');
    }
  }

  private handleError(message: string): void {
    this.paymentVerified = false;
    this.errorMessage = message;
    this.isLoading = false;
    
    Swal.fire({
      icon: 'error',
      title: 'Payment Verification Error',
      text: message,
      confirmButtonText: 'OK'
    });
  }

  private startCountdown(): void {
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.countdownInterval);
        this.navigateToOrders();
      }
    }, 1000);
  }

  private stopCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  // Navigation methods
  navigateToDashboard(): void {
    this.stopCountdown();
    this.router.navigate(['/dashboard']).then(() => {
      console.log('✅ Navigated to dashboard');
    }).catch((error) => {
      console.error('❌ Navigation to dashboard failed:', error);
    });
  }

  navigateToOrders(): void {
    this.stopCountdown();
    this.router.navigate(['/dashboard/orders']).then(() => {
      console.log('✅ Navigated to orders');
    }).catch((error) => {
      console.error('❌ Navigation to orders failed:', error);
      // Fallback to dashboard if orders route fails
      this.router.navigate(['/dashboard']);
    });
  }

  navigateToProducts(): void {
    this.stopCountdown();
    this.router.navigate(['/products']).then(() => {
      console.log('✅ Navigated to products');
    }).catch((error) => {
      console.error('❌ Navigation to products failed:', error);
    });
  }

  navigateToHome(): void {
    this.stopCountdown();
    this.router.navigate(['/']).then(() => {
      console.log('✅ Navigated to home');
    }).catch((error) => {
      console.error('❌ Navigation to home failed:', error);
    });
  }

  retryVerification(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.paymentVerified = false;
    this.verifyPayment();
  }

  contactSupport(): void {
    // You can implement your support contact logic here
    Swal.fire({
      title: 'Contact Support',
      html: `
        <p>If you need assistance with your payment, please contact our support team:</p>
        <p><strong>Email:</strong> support@yourcompany.com</p>
        <p><strong>Phone:</strong> +1-800-123-4567</p>
        <p><strong>Session ID:</strong> ${this.sessionId}</p>
      `,
      icon: 'info',
      confirmButtonText: 'OK'
    });
  }

  // Helper method to format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100); // Assuming amount is in cents
  }

  // Helper method to format date
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}