import { Injectable } from '@angular/core';

export interface SelectedProduct {
  id: string;
  name: string;
  price: number;
  status: string;
  inProperty: number;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
 settings(selectedProducts: SelectedProduct[]): void {
  
  this.setItems(selectedProducts);
}
  private storageKey = 'checkout_items'; 

  
  setItems(items: SelectedProduct[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

 
  getItems(): SelectedProduct[] {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  
  clearItems(): void {
    localStorage.removeItem(this.storageKey);
  }
  
}
