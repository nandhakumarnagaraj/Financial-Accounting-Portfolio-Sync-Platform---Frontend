import { Component, OnInit } from '@angular/core';
import { DashboardStats, SyncStatusResponse } from '../../models/xero.model';
import { DashboardService } from '../../services/dashboard';
import { AuthService } from '../../services/auth';
import { XeroService } from '../../services/xero';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule,FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  syncStatus: SyncStatusResponse | null = null;
  loading = true;
  error = '';
  currentUser$ = this.authService.currentUser$;

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private xeroService: XeroService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
    this.xeroService.syncStatus$.subscribe(status => {
      this.syncStatus = status;
    });
  }

  loadDashboard(): void {
    this.loading = true;
    this.authService.getCurrentUser().subscribe({
      next: () => {
        this.dashboardService.getDashboardStats().subscribe({
          next: (data) => {
            this.stats = data;
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Failed to load dashboard stats';
            this.loading = false;
          }
        });
      },
      error: (err) => {
        this.error = 'Failed to load user information';
        this.loading = false;
      }
    });
  }

  refreshStats(): void {
    this.loadDashboard();
  }
}

