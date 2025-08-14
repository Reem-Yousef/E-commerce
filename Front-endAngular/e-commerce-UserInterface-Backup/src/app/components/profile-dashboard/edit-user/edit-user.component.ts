import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ProfileService } from '../../../services/porpfile.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.css',
})
export class EditUserComponent implements OnInit {
  userForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      phoneNumbers: this.fb.array([], Validators.required),
      addresses: this.fb.array([], Validators.required),
      age: [''],
    });

    this.profileService.getUserInfo().subscribe({
      next: ({ user }) => {
        this.userForm.patchValue({
          username: user.username,
          email: user.email,
          age: user.age,
        });

        this.setFormArray('phoneNumbers', user.phoneNumbers);
        this.setFormArray('addresses', user.addresses);
      },
      error: (err) => console.error('Failed to load user', err),
    });
  }

  get phoneNumbers(): FormArray {
    return this.userForm.get('phoneNumbers') as FormArray;
  }

  get addresses(): FormArray {
    return this.userForm.get('addresses') as FormArray;
  }

  setFormArray(name: string, values: string[]) {
    const control = this.userForm.get(name) as FormArray;
    control.clear();
    values.forEach((val) => control.push(this.fb.control(val)));
  }

  addPhone() {
    this.phoneNumbers.push(this.fb.control(''));
  }

  addAddress() {
    this.addresses.push(this.fb.control(''));
  }

  onSubmit() {
    this.userForm.markAllAsTouched();
    if (this.userForm.valid) {
      this.profileService.updateUser(this.userForm.value).subscribe({
        next: (res) => {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Profile updated successfully',
            confirmButtonText: 'OK',
          }).then(() => {
            this.router.navigate(['/dashboard']);
          });
        },
        error: (err) => {
          console.error('Update failed', err);
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Failed to update profile',
            confirmButtonText: 'Try Again',
          });
        },
      });
    }
  }
}
