import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { LoginComponent } from '../login/login.component';
import { SignupComponent } from '../signup/signup.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, LoginComponent, SignupComponent, MatCardModule, MatIconModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  isLoginView = true;

  toggleView() {
    this.isLoginView = !this.isLoginView;
  }
}
