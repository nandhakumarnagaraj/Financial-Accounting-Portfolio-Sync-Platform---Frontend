import { Component, OnInit } from '@angular/core';
import { SyncStatusResponse, XeroAuthResponse } from '../../models/xero.model';
import { XeroService } from '../../services/xero';

@Component({
  selector: 'app-xero',
  imports: [],
  templateUrl: './xero.html',
  styleUrl: './xero.css',
})
export class XeroComponent implements OnInit {
  syncStatus: SyncStatusResponse | null = null;
  loading = false;
  disconnecting = false;
  error = '';
  success = '';

  constructor(private xeroService: XeroService) {}

  ngOnInit(): void {
    this.loadStatus();
    this.xeroService.syncStatus$.subscribe(status => {
      this.syncStatus = status;
    });
  }

  loadStatus(): void {
    this.xeroService.checkConnectionStatus();
  }

  connectXero(): void {
    this.loading = true;
    this.error = '';
    this.xeroService.getAuthorizationUrl().subscribe({
      next: (response: XeroAuthResponse) => {
        window.location.href = response.authorizationUrl;
      },
      error: (err) => {
        this.error = 'Failed to get authorization URL. Please try again.';
        this.loading = false;
      }
    });
  }

  disconnectXero(): void {
    if (!confirm('Are you sure you want to disconnect Xero? You will need to authorize again to sync data.')) {
      return;
    }

    this.disconnecting = true;
    this.error = '';
    this.xeroService.disconnectXero().subscribe({
      next: () => {
        this.success = 'Xero account disconnected successfully';
        this.syncStatus = null;
        setTimeout(() => this.success = '', 3000);
        this.disconnecting = false;
      },
      error: (err) => {
        this.error = 'Failed to disconnect Xero account';
        this.disconnecting = false;
      }
    });
  }

  refreshToken(): void {
    this.loading = true;
    this.error = '';
    this.xeroService.refreshToken().subscribe({
      next: () => {
        this.success = 'Token refreshed successfully';
        this.loadStatus();
        setTimeout(() => this.success = '', 3000);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to refresh token';
        this.loading = false;
      }
    });
  }
}
