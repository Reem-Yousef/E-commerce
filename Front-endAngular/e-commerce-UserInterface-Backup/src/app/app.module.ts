import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './routes/app-routing.module';
import { AppComponent } from './app.component';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { HomeComponent } from './components/home/home.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { FooterComponent } from './components/footer/footer.component';
import { CartComponent } from './components/cart/cart.component';
import { CartService } from './services/cart.service';
import { CartIconComponent } from './components/cart/cart-icon/cart-icon.component';
import { ProfileDashboardComponent } from './components/profile-dashboard/profile-dashboard.component';
import { UserInfoComponent } from './components/profile-dashboard/user-info/user-info.component';
import { EditUserComponent } from './components/profile-dashboard/edit-user/edit-user.component';
import { OrdersOfUserComponent } from './components/profile-dashboard/orders-of-user/orders-of-user.component';
import { TrimStr } from '../app/pipes/trim';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { ProductCardComponent } from './components/shared/product-card/product-card.component';
import { ProductService } from './services/product.service';
import { SaleComponent } from './components/sale/sale.component';
import { MiniCartComponent } from './components/cart/mini-cart/mini-cart.component';
import { CartNotificationComponent } from './components/cart/cart-notification/cart-notification.component';
import { CartNotificationService } from './services/cart-notification.service';
import { WishlistComponent } from './components/wishlist/wishlist.component';
import { AboutUsComponent } from './components/about-us/about-us.component';
import { NotFoundedComponent } from './components/not-founded/not-founded.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { CouponComponent } from './components/coupon/coupon.component';
import { ContactUsComponent } from './components/contact-us/contact-us.component';
import { PaymentSuccessComponent } from './components/checkout/payment-success/payment-success.component';
import { PaymentCancelComponent } from './components/checkout/payment-cancel/payment-cancel.component';


@NgModule({
  imports: [BrowserModule, AppRoutingModule, FormsModule, HttpClientModule,ReactiveFormsModule],
  declarations: [
    AppComponent,
    NavBarComponent,
    HomeComponent,
    SignUpComponent,
    SignInComponent,
    FooterComponent,
    CartComponent,
    CartIconComponent,
    ProfileDashboardComponent,
    UserInfoComponent,
    EditUserComponent,
    OrdersOfUserComponent,
    TrimStr,
    ProductListComponent,
    ProductDetailComponent,
    ProductCardComponent,
    SaleComponent,
    MiniCartComponent,
    CartNotificationComponent,
    WishlistComponent,
    AboutUsComponent,
    NotFoundedComponent,
    CheckoutComponent,
    CouponComponent,
    ContactUsComponent,
    PaymentSuccessComponent,
    PaymentCancelComponent
  ],
  providers: [ProductService, CartService, CartNotificationService],
  bootstrap: [AppComponent],
})
export class AppModule {}