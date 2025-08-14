import { AfterViewInit, Component } from '@angular/core';
import * as AOS from 'aos';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css',
})
export class SignUpComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    AOS.init();
  }

  user = {
    username: '',
    email: '',
    password: '',
    phoneNumbers: [''],
    addresses: [''],
    age: null,
  };
  confirmPassword: string = '';

  constructor(private authService: AuthService, private router: Router) {}
  errorMsg: string = '';

  register() {
    if (this.user.password !== this.confirmPassword) {
      this.errorMsg = "Passwords don't match";
      return;
    }
    this.authService.register(this.user).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Registration Successful!',
          showConfirmButton: false,
          timer: 2000,
        });
        this.router.navigate(['/signin']);
      },
      error: (err) => {
        console.log(err);

        const errorMessage =
          err.error?.errors?.[0] ||
          err.error?.message ||
          'Registration failed. Please try again.';
        Swal.fire({
          icon: 'error',
          title: 'An Error Occurred',
          text: errorMessage,
        });
      },
    });
  }
}