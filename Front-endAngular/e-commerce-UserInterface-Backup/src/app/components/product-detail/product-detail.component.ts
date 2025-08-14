import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product, ProductReview } from '../../models/product.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { CartService } from '../../services/cart.service';
import { CartNotificationService } from '../../services/cart-notification.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css'],
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  relatedProducts: Product[] = [];
  reviews: ProductReview[] = [];
  loading = true;
  error = '';
  reviewCount: number = 0;

  // Product detail state
  selectedImageIndex = 0;
  quantity = 1;
  activeTab = 'description';
  isAddingToCart = false;

  // Review form state
  showReviewForm = false;
  reviewForm: FormGroup;
  submittingReview = false;
  reviewSubmissionError = '';
  reviewSubmissionSuccess = false;

  breadcrumbs = [
    { label: 'Home', link: '/' },
    { label: 'Indoor Plants', link: '/products' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private formBuilder: FormBuilder,
    private fb: FormBuilder,
    private cartService: CartService,
    private cartNotificationService: CartNotificationService
  ) {
    this.reviewForm = this.formBuilder.group({
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(500),
        ],
      ],
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      saveInfo: [false],
    });
  }

 ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const productId = params['id'];
      if (productId) {
        this.loadProduct(productId);
      }
    });
  }

  loadProduct(productId: string): void {
    this.loading = true;
    this.error = '';

    this.productService.getProduct(productId).subscribe({
      next: (product) => {
        this.product = product;
        this.breadcrumbs = [
          { label: 'Home', link: '/' },
          { label: product.brand, link: `/products` },
          { label: product.name, link: '' },
        ];
        this.loadRelatedProducts(product.category);
        this.loadReviews(productId);
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Product not found';
        this.loading = false;
        console.error('Error loading product:', error);
      },
    });
  }

  loadRelatedProducts(category: string): void {
    this.productService.getProductsByCategory(category).subscribe({
      next: (products) => {
        this.relatedProducts = products
          .filter((p) => p.id !== this.product?.id)
          .slice(0, 3);
      },
      error: (error) => {
        console.error('Error loading related products:', error);
      },
    });
  }

  loadReviews(productId: string): void {
    this.productService.getProductReviews(productId).subscribe({
      next: (data) => {
        this.reviews = data.reviews;
        this.reviewCount = data.count;
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
      },
    });
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  increaseQuantity(): void {
    this.quantity++;
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCartAndViewCart(): void {
    if (!this.product || this.isAddingToCart) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to add items to cart');
      this.router.navigate(['/login']);
      return;
    }

    const productId = this.product._id || this.product.id;
    if (!productId) {
      console.error('Product ID is missing:', this.product);
      return;
    }

    this.isAddingToCart = true;

    this.cartService.addToCart(productId, this.quantity).subscribe({
      next: () => {
        this.isAddingToCart = false;
        this.quantity = 1;

        this.cartService.loadCart().subscribe();

        this.cartNotificationService.showNotification(this.product!.name);
      },
      error: (err) => {
        this.isAddingToCart = false;
        console.error('Failed to add to cart:', err);

        if (err.status === 401 || err.status === 403) {
          alert('Session expired. Please login again.');
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        } else {
          alert('Failed to add the product to your cart. Please try again.');
        }
      },
    });
  }

  toggleReviewForm(): void {
    this.showReviewForm = !this.showReviewForm;
    if (this.showReviewForm) {
      this.reviewSubmissionSuccess = false;
      this.reviewSubmissionError = '';
    }
  }

  getStarArray(rating: number): boolean[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating);
    }
    return stars;
  }

  setRating(rating: number): void {
    this.reviewForm.patchValue({ rating });
  }

  getUserFromToken(): any {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payloadBase64 = token.split('.')[1]; 
      const decodedPayload = JSON.parse(atob(payloadBase64));
      return decodedPayload;
    } catch (e) {
      console.error('Invalid token format', e);
      return null;
    }
  }

  onSubmitReview(): void {
    if (this.reviewForm.valid && this.product) {
      this.submittingReview = true;
      this.reviewSubmissionError = '';

      const user = this.getUserFromToken();
      const userId = user?.userId;

      if (!userId) {
        this.reviewSubmissionError = 'User not logged in.';
        this.submittingReview = false;
        return;
      }
      const reviewData = {
        productId: this.product.id,
        userId: userId,
        rating: this.reviewForm.value.rating,
        comment: this.reviewForm.value.comment,
      };

      this.productService.submitReview(reviewData).subscribe({
        next: (response) => {
          this.submittingReview = false;
          this.reviewSubmissionSuccess = true;
          this.showReviewForm = false;
          this.reviewForm.reset();
          this.loadReviews(this.product!.id);
        },
        error: (error) => {
          this.submittingReview = false;
          this.reviewSubmissionError =
            error.error?.message ||
            'Failed to submit review. Please try again.';
          console.error('Error submitting review:', error);
        },
      });
    } else {
      Object.keys(this.reviewForm.controls).forEach((key) => {
        this.reviewForm.get(key)?.markAsTouched();
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  
}
