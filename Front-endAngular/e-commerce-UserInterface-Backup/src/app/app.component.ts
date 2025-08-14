import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { FooterComponent } from './components/footer/footer.component';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  // imports: [FooterComponent, NavBarComponent],
})
export class AppComponent {
  title = 'e-commerce';

  showFooter = true;
  showSaleSection = true;
  showNav = true;

  constructor(private router: Router) {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        )
      )
      .subscribe((event) => {
        const url = event.urlAfterRedirects;
        const hiddenFooterRoutes = [
          '/dashboard',
          '/dashboard/userinfo',
          '/dashboard/edit-user',
          '/dashboard/orders',
        ];
        const hiddenSaleSectionRoutes = ['/signin', '/signup', '/dashboard'];
        this.showFooter = !hiddenFooterRoutes.some((path) =>
          event.urlAfterRedirects.startsWith(path)
        );
        this.showSaleSection = !hiddenSaleSectionRoutes.some((path) =>
          event.urlAfterRedirects.startsWith(path)
        );

        if (url === '/notfounded') {
          this.showFooter = false;
          this.showNav = false;
        } else {
          this.showNav = true;
        }
      });
  }
}
