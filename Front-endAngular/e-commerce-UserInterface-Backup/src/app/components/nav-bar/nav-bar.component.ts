import { Component, ElementRef } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css',
})
export class NavBarComponent {

  constructor(
    private el: ElementRef,
    public authService: AuthService,
    private router: Router
  ) {}

  closeNavbar() {
    const navbar = this.el.nativeElement.querySelector('#mainMenu');
    if (navbar.classList.contains('show')) {
      navbar.classList.remove('show');
    }
  }

  onLogout() {
    this.authService.logout().subscribe({
      next: () => {
        localStorage.removeItem('token');
        this.router.navigate(['/signin']);
      },
      error: (err) => {
        console.error('Logout failed:', err);
      },
    });
  }

}
