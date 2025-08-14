import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../../services/porpfile.service';
import { TrimStr } from "../../../pipes/trim";

interface Product {
  _id: string;
  title: string;
  price: number;
  images: string[];
  description: string;
}

interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  total: number;
  orderedAt: Date;
  status: string;
}

@Component({
  selector: 'app-orders-of-user',
  templateUrl: './orders-of-user.component.html',
  styleUrls: ['./orders-of-user.component.css'],
})
export class OrdersOfUserComponent implements OnInit {
  orders: Order[] = [];
  isLoading: boolean = true;
  error: string = '';

  constructor(private orderService: ProfileService) {}

  ngOnInit(): void {
    this.orderService.getUserOrders().subscribe({
      next: (userOrders: any) => {
        this.orders = userOrders || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'faild to load order';
        this.isLoading = false;
        console.error(err);
      },
    });
  }
}
