import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LoginRequest, SignupRequest, JwtResponse, AuthMessageResponse, User } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private apiUrl = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'jwt_token';
  private readonly USER_KEY = 'current_user';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Load user from storage on service initialization
    const storedUser = this.getCurrentUser();
    if (storedUser) {
      this.currentUserSubject.next(storedUser);
    }
  }

  login(credentials: LoginRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        // Save token and user after login
        this.saveUser(response as any);
      })
    );
  }

  signup(userData: SignupRequest): Observable<AuthMessageResponse> {
    return this.http.post<AuthMessageResponse>(`${this.apiUrl}/signup`, userData);
  }

  // Fetch current user profile from backend
  getCurrentUserProfile(forceRefresh: boolean = false): Observable<User> {
    const currentUser = this.currentUserSubject.value;
    if (currentUser && !forceRefresh) {
      return of(currentUser); // Return cached user if available and no force refresh
    }

    return this.http.get<User>(`${environment.apiUrl}/users/me`).pipe(
      map(user => this.normalizeUser(user)),
      tap(user => {
        // Update local storage and subject
        this.saveUser(user);
        this.currentUserSubject.next(user);
      })
    );
  }

  refreshCurrentUserProfile(): Observable<User> {
    // Clear cache to ensure a fresh fetch
    this.currentUserSubject.next(null); // Clear the internal cache
    return this.getCurrentUserProfile(true);
  }

  // Normalize user data to handle different response formats
  private normalizeUser(user: any): User {
    return {
      ...user,
      roles: this.normalizeRoles(user.roles)
    };
  }

  // Convert role format: either { id, name } or string
  private normalizeRoles(roles: any): string[] {
    if (!roles) return [];
    
    if (Array.isArray(roles)) {
      return roles.map(role => {
        // If it's an object with 'name' property, extract the name
        if (typeof role === 'object' && role.name) {
          return role.name;
        }
        // If it's already a string, keep it
        if (typeof role === 'string') {
          return role;
        }
        return String(role);
      });
    }
    
    return [];
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    
    localStorage.removeItem('xero_connection_state');
    localStorage.removeItem('xero_sync_timestamps');
    localStorage.removeItem('xero_invoices_cache');
    localStorage.removeItem('xero_transactions_cache');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
  }

  saveToken(token: string, rememberMe: boolean): void {
    if (rememberMe) {
      localStorage.setItem(this.TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem(this.USER_KEY);
    if (!user) return null;
    
    try {
      return JSON.parse(user) as User;
    } catch {
      return null;
    }
  }

  getCurrentUserSync(): User | null {
    return this.currentUserSubject.value;
  }

  saveUser(user: any): void {
    const normalizedUser = this.normalizeUser(user);
    localStorage.setItem(this.USER_KEY, JSON.stringify(normalizedUser));
    this.currentUserSubject.next(normalizedUser);
  }

  // Get token expiry time
  getTokenExpiry(): string | null {
    const user = this.getCurrentUser();
    return user?.tokenExpiry || null;
  }

  // Check if token will expire soon (within 5 minutes)
  isTokenExpiringSoon(): boolean {
    const expiryStr = this.getTokenExpiry();
    if (!expiryStr) return false;

    try {
      const expiryDate = new Date(expiryStr);
      const now = new Date();
      const minutesLeft = (expiryDate.getTime() - now.getTime()) / (1000 * 60);

      return minutesLeft > 0 && minutesLeft <= 5;
    } catch {
      return false;
    }
  }

  // Check if token is already expired
  isTokenExpired(): boolean {
    const expiryStr = this.getTokenExpiry();
    if (!expiryStr) return false;

    try {
      const expiryDate = new Date(expiryStr);
      const now = new Date();

      return expiryDate.getTime() <= now.getTime();
    } catch {
      return false;
    }
  }

  // Get remaining time until expiry
  getTimeUntilExpiry(): { minutes: number; seconds: number } | null {
    const expiryStr = this.getTokenExpiry();
    if (!expiryStr) return null;

    try {
      const expiryDate = new Date(expiryStr);
      const now = new Date();
      const diffMs = expiryDate.getTime() - now.getTime();

      if (diffMs <= 0) {
        return { minutes: 0, seconds: 0 };
      }

      const minutes = Math.floor(diffMs / 60000);
      const seconds = Math.floor((diffMs % 60000) / 1000);

      return { minutes, seconds };
    } catch {
      return null;
    }
  }

  // Get user roles as strings
  getUserRoles(): string[] {
    const user = this.getCurrentUser();
    if (!user || !user.roles) return [];
    
    return this.normalizeRoles(user.roles);
  }

  // Check if user has a specific role
  hasRole(role: string): boolean {
    return this.getUserRoles().includes(role);
  }
}