import { AfterViewInit, Component } from '@angular/core';
import * as AOS from 'aos';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrl: '../sign-up/sign-up.component.css',
})
export class SignInComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    AOS.init();
  }

  email = '';
  password = '';
  errorMsg = '';
  rememberMe = false;
  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService
      .login({ email: this.email, password: this.password })
      .subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Login Successful!',
            showConfirmButton: false,
            timer: 2000,
          });
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.log(err);
          const errorMessage =
            err.error?.message || 'Invalid email or password';
          Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: errorMessage,
          });
        },
      });
  }
}