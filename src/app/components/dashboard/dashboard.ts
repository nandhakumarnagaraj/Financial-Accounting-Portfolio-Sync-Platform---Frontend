import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

import { DashboardStats, SyncStatusResponse } from '../../models/xero.model';
import { DashboardService } from '../../services/dashboard';
import { AuthService } from '../../services/auth';
import { XeroService } from '../../services/xero';
import { User } from '../../models/auth.model';

import { AnalyticsChartComponent } from './analytics-chart.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AnalyticsChartComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {

  stats: DashboardStats | null = null;
  syncStatus: SyncStatusResponse | null = null;
  loading = true;
  error = '';

  currentUser$: Observable<User | null>;

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private xeroService: XeroService
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

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

