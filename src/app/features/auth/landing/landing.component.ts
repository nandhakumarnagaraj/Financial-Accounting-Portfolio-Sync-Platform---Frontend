import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
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

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if there's a 'view' query parameter to determine which view to show
    this.route.queryParams.subscribe(params => {
      if (params['view'] === 'signup') {
        this.isLoginView = false;
      } else {
        this.isLoginView = true;
      }
    });

    // Check if we're coming from signup with credentials
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state;
    const historyState = window.history.state;

    // If coming from signup, ensure we show login view
    if ((state && state['fromSignup']) || (historyState && historyState['fromSignup'])) {
      this.isLoginView = true;
    }
  }

  toggleView() {
    this.isLoginView = !this.isLoginView;
  }
}