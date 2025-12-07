import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { filter, map } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatBadgeModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss' // Will change to .scss
})
export class AppComponent implements OnInit {
  isLoggedIn = false;
  username: string = 'User';
  userRole: string = 'Analyst';
  currentPageTitle: string = 'Dashboard';

  constructor(private authService: AuthService, private router: Router) {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.isLoggedIn = this.authService.isLoggedIn();
      if (this.isLoggedIn) {
        this.loadUserInfo();
        this.currentPageTitle = this.getPageTitle(event.urlAfterRedirects);
      }
    });
  }

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.loadUserInfo();
    }
  }

  loadUserInfo() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.username = user.username;
      this.userRole = user.roles ? user.roles[0] : 'User'; // Assuming first role is the primary
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getPageTitle(url: string): string {
    if (url.includes('/dashboard')) {
      return 'Dashboard';
    } else if (url.includes('/xero-connection')) {
      return 'Xero Connection';
    } else if (url.includes('/sync-data')) {
      return 'Sync Data';
    } else if (url.includes('/login') || url.includes('/signup')) {
      return 'Authentication';
    }
    return 'FinSync';
  }
}