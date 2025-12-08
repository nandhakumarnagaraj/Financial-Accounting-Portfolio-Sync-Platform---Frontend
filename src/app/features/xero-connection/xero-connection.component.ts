import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { XeroService } from '../../core/services/xero.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { ToastrService } from 'ngx-toastr';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-xero-connection',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DatePipe
  ],
  templateUrl: './xero-connection.component.html',
  styleUrls: ['./xero-connection.component.scss']
})
export class XeroConnectionComponent implements OnInit {
  isLoading = true;
  xeroConnected = false;
  tenantId: string | null = null;
  lastSyncTime: string | null = null;

  constructor(
    private xeroService: XeroService,
    private dashboardService: DashboardService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.dashboardService.getDashboardStats().subscribe(stats => {
      this.xeroConnected = stats.xeroConnected;
      if (this.xeroConnected) {
        this.tenantId = stats.tenantId; // Use data from backend
        this.lastSyncTime = stats.lastSyncTime; // Use data from backend
      }
      this.isLoading = false;
    });
  }

  connectXero() {
    this.xeroService.getAuthUrl().subscribe(response => {
      window.open(response.authorizationUrl, '_blank');
    });
  }

  refreshToken() {
    this.xeroService.refreshToken().subscribe({
      next: (response) => {
        this.toastr.success(response.message, 'Success');
        // Assuming refreshToken response might contain updated lastSyncTime or it needs to be refetched
        // For now, we'll optimistically update it to current time if no backend value is returned.
        this.lastSyncTime = response.lastSyncTime || new Date().toISOString(); // Prefer backend value
      },
      error: (err) => {
        this.toastr.error(err.error.message || 'Failed to refresh token', 'Error');
      }
    });
  }

  disconnectXero() {
    this.xeroService.disconnectXero().subscribe({
      next: () => {
        this.xeroConnected = false;
        this.tenantId = null;
        this.lastSyncTime = null;
        this.toastr.success('Xero disconnected successfully', 'Success');
      },
      error: (err) => {
        this.toastr.error(err.error.message || 'Failed to disconnect Xero', 'Error');
      }
    });
  }
}
