import { Component } from '@angular/core';
import { ProfileService } from '../../../services/porpfile.service';

export interface User {
  _id: string;
  username: string;
  image: string;
  email: string;
  password: string;
  phoneNumbers: string[];
  addresses: string[];
  age: number;
  isLoggedIn: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.css',
})
export class UserInfoComponent {
  userInfoData!: User;

  constructor(private profileService: ProfileService) {}

  ngOnInit() {
    this.profileService.getUserInfo().subscribe({
      next: (userInfo) => {
        this.userInfoData = userInfo.user;
      },
      error: (err) => {
        console.error('Failed to load user info', err);
      },
    });
  }
}
