import { Component, OnInit } from '@angular/core';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-mini-cart',
  templateUrl: './mini-cart.component.html',
  styleUrl: './mini-cart.component.css'
})

export class MiniCartComponent implements OnInit {
  itemCount = 0;
  total = 0;
  isOpen = false;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.cartService.cart$.subscribe(() => {
      this.itemCount = this.cartService.getCartItemCount();
      this.total = this.cartService.getCartTotal();
    });
  }

  toggleCart() {
    this.isOpen = !this.isOpen;
  }
}