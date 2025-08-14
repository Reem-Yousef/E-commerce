export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  brand: string;
  stock: number;
  images: string[];
  ratings: {
    average: number;
    count: number;
  };
  createdAt: Date;

  id: string;
  name: string;
  category: string;
  inStock: boolean;
  rating: number;
  reviewCount: number;  shortDescription?: string;
  originalPrice?: number;
  freeShipping?: boolean;
  tags?: string[];
  specifications?: { [key: string]: string };
}

export interface ProductFilter {
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
export interface SearchParams {
  q?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  minRating?: number;
  sortBy?: 'relevance' | 'price' | 'rating' | 'newest' | 'oldest' | 'name';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchResponse {
  message: string;
  query: string;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  results: number;
  products: Product[];
  suggestions: string[];
  filters: {
    brands: string[];
    priceRange: { min: number; max: number };
    maxRating: number;
  };
}

export interface SearchSuggestionsResponse {
  suggestions: string[];
}

export interface ProductReview {
  _id: string;
  productId: string;
  userId: { _id: string; name: string };
  rating: number;
  comment: string;
  createdAt: Date;

  id: string;
  userName: string;
  date: Date;
}

export interface CartItem {
  product: {
    id: string;
    _id: string;
    name: string;
    price: number;
    image?: string;
    description?: string;
  };
  quantity: number;
  _id: string;
}
