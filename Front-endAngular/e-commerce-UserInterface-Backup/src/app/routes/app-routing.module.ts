import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../components/home/home.component';
import { SignUpComponent } from '../components/sign-up/sign-up.component';
import { SignInComponent } from '../components/sign-in/sign-in.component';
import { ProfileDashboardComponent } from '../components/profile-dashboard/profile-dashboard.component';
import { UserInfoComponent } from '../components/profile-dashboard/user-info/user-info.component';
import { EditUserComponent } from '../components/profile-dashboard/edit-user/edit-user.component';
import { OrdersOfUserComponent } from '../components/profile-dashboard/orders-of-user/orders-of-user.component';
import { ProductListComponent } from '../../app/components/product-list/product-list.component';
import { ProductDetailComponent } from '../../app/components/product-detail/product-detail.component';
import { CartComponent } from '../components/cart/cart.component';
import { WishlistComponent } from '../components/wishlist/wishlist.component';
import { NotFoundedComponent } from '../components/not-founded/not-founded.component';
import { AboutUsComponent } from '../components/about-us/about-us.component';
import { CheckoutComponent } from '../components/checkout/checkout.component';
import { ContactUsComponent } from '../components/contact-us/contact-us.component';
import { PaymentSuccessComponent } from '../components/checkout/payment-success/payment-success.component';
import { PaymentCancelComponent } from '../components/checkout/payment-cancel/payment-cancel.component';
import { AuthGuard } from '../gards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'signup', component: SignUpComponent },
  { path: 'signin', component: SignInComponent },
  { path: 'cart', component: CartComponent },
  { path: 'wishlist', component: WishlistComponent },
  { path: 'aboutUs', component: AboutUsComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'contactUs', component: ContactUsComponent },

  { 
    path: 'complete', 
    component: PaymentSuccessComponent,
  },
  { 
    path: 'cancel', 
    component: PaymentCancelComponent,
  },
  {
    path: 'dashboard',
    component: ProfileDashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'userinfo', pathMatch: 'full' },
      { path: 'userinfo', component: UserInfoComponent },
      { path: 'edit-user', component: EditUserComponent },
      { path: 'orders', component: OrdersOfUserComponent },
    ],
  },
  { path: 'products', component: ProductListComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  { path: 'products', component: ProductListComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  { path: 'notfounded', component: NotFoundedComponent },
  { path: '**', redirectTo: '/notfounded' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
