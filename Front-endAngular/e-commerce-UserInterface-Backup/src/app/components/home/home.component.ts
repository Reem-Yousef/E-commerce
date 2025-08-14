import { Component, OnInit } from '@angular/core';
import * as AOS from 'aos';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit{
  products: Product[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe((res: Product[]) => {
      this.products =  res.slice(0, 3);
    });
  }

  ngAfterViewInit(): void {
    AOS.init();
  }

  trackByProductId(index: number, item: any): string {
    return item.product._id;
  }
}
