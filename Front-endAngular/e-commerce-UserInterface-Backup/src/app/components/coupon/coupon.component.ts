import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-coupon',
  templateUrl: './coupon.component.html',
  styleUrls: ['./coupon.component.css']
})
export class CouponComponent {
  showCouponField = false;
  couponCode = '';
  couponApplied = false;
  couponMessage = '';
  
  @Output() couponAppliedEvent = new EventEmitter<{code: string, discount: number}>();

  toggleCouponField() {
    this.showCouponField = !this.showCouponField;
  }

  applyCoupon() {
    if (!this.couponCode) {
      this.couponMessage = 'Please enter a coupon code';
      this.couponApplied = false;
      return;
    }

   
    setTimeout(() => {
      if (this.couponCode.toUpperCase() === 'DISCOUNT10') {
        this.couponApplied = true;
        this.couponMessage = '10% discount applied!';
        this.couponAppliedEvent.emit({code: this.couponCode, discount: 10});
      } else if (this.couponCode.toUpperCase() === 'FREESHIP') {
        this.couponApplied = true;
        this.couponMessage = 'Free shipping applied!';
        this.couponAppliedEvent.emit({code: this.couponCode, discount: 0}); // 0 for free shipping
      } else {
        this.couponApplied = false;
        this.couponMessage = 'Invalid coupon code';
      }
    }, 500);
  }
}