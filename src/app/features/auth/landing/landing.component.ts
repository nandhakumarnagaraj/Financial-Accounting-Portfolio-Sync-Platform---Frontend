import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
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
export class LandingComponent implements OnInit {
  isLoginView = true;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Check if there's a 'view' query parameter to determine which view to show
    this.route.queryParams.subscribe(params => {
      if (params['view'] === 'signup') {
        this.isLoginView = false;
      } else {
        this.isLoginView = true;
      }
    });
  }

  toggleView() {
    this.isLoginView = !this.isLoginView;
  }
}