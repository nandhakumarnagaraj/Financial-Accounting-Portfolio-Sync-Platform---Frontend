import { Component, OnInit } from '@angular/core';
import { User } from '../../models/auth.model';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router'; // Add RouterLinkActive for routerLinkActiveOptions

@Component({
  selector: 'app-navbar',
  standalone: true, // Mark as standalone
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive], // Add RouterLinkActive to imports
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class NavbarComponent implements OnInit {
  currentUser$!: Observable<User | null>;
  isAuthenticated$!: Observable<boolean>;
  mobileMenuOpen = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser$ = this.authService.currentUser$;
    this.isAuthenticated$ = this.authService.isAuthenticated$;
  }

  logout(): void {
    this.authService.logout();
    this.mobileMenuOpen = false;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}
