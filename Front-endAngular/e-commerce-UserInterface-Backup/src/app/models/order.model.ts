import { Product } from './product.model';
import { Address } from './address.model';

export interface Order {
  id: string;
  userId: number;
  sellerId: number;
  product: Product;
  deliveryAddress: Address;
  contact: string;
  dateTime: string;
  status: 'pending' | 'paid' | 'cancelled' | string;
}
