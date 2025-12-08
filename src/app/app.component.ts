import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { filter, map } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
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
      
      // Handle both role formats: string[] or Role[]
      if (user.roles && user.roles.length > 0) {
        const firstRole = user.roles[0];
        // If it's an object with 'name' property, use the name
        if (typeof firstRole === 'object' && 'name' in firstRole) {
          this.userRole = (firstRole as any).name;
        } else if (typeof firstRole === 'string') {
          // If it's already a string, use it directly
          this.userRole = firstRole;
        } else {
          this.userRole = 'Analyst';
        }
      } else {
        this.userRole = 'User';
      }
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  getPageTitle(url: string): string {
    if (url.includes('/dashboard')) {
      return 'Dashboard';
    } else if (url.includes('/xero-connection')) {
      return 'Xero Connection';
    } else if (url.includes('/sync-data')) {
      return 'Sync Data';
    } else if (url.includes('/invoices')) {
      return 'Invoices';
    } else if (url.includes('/transactions')) {
      return 'Transactions';
    } else if (url.includes('/login') || url.includes('/signup')) {
      return 'Authentication';
    }
    return 'FinSync';
  }
}