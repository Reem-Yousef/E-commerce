import { Component } from '@angular/core';
import * as AOS from 'aos';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.css'
})
export class ContactUsComponent {
  contactForm = {
    name: '',
    email: '',
    phone: '',
    message: ''
  };

  formSubmitted = false;
  showErrorPopup = false; 

  constructor() { }

  onSubmit() {
    if (this.isFormValid()) {
      console.log('Form submitted:', this.contactForm);
      
      this.formSubmitted = true;
      
    } else {
      this.showErrorPopup = true;
    }
  }

  closeErrorPopup(): void {
    this.showErrorPopup = false;
  }

  resetToForm(): void {
    this.formSubmitted = false;
    this.resetForm();
  }

  private isFormValid(): boolean {
    return !!(this.contactForm.name && 
              this.contactForm.email && 
              this.contactForm.phone &&
              this.isValidEmail(this.contactForm.email));
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private resetForm(): void {
    this.contactForm = {
      name: '',
      email: '',
      phone: '',
      message: ''
    };
  }

  ngAfterViewInit(): void {
    AOS.init();
  }
}