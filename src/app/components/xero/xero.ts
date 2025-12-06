import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SyncStatusResponse, XeroAuthResponse } from '../../models/xero.model';
import { XeroService } from '../../services/xero';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

 @Component({
  selector: 'app-xero',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './xero.html',
  styleUrl: './xero.css',
})
export class XeroComponent implements OnInit {

  syncStatus: SyncStatusResponse | null = null;
  loading = false;
  disconnecting = false;
  error = '';
  success = '';
  returnUrl = '';

  constructor(
    private xeroService: XeroService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Get return URL if provided
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/sync';

    // Check for OAuth callback status
    this.route.queryParams.subscribe(params => {
      if (params['status'] === 'success') {
        this.success = '✅ Xero connected successfully! Please sync your data.';
        this.loadStatus();
      } else if (params['status'] === 'error') {
        this.error = '❌ ' + (params['message'] || 'Xero connection failed. Please try again.');
      }
    });

    this.loadStatus();

    // Listen to live sync status updates
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
        // Redirect to Xero authorization page
        window.location.href = response.authorizationUrl;
      },
      error: (err) => {
        this.error = 'Failed to get authorization URL. Please try again.';
        this.loading = false;
      }
    });
  }

  goToSync(): void {
    this.router.navigate(['/sync']);
  }

  disconnectXero(): void {
    if (!confirm('Are you sure you want to disconnect Xero? This will log you out.')) return;

    this.disconnecting = true;
    this.error = '';

    this.xeroService.disconnectXero().subscribe({
      next: () => {
        this.success = 'Xero account disconnected successfully';
        this.syncStatus = null;

        // Logout after disconnecting Xero
        setTimeout(() => {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('current_user');
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: () => {
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
        setTimeout(() => (this.success = ''), 3000);
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to refresh token';
        this.loading = false;
      }
    });
  }
}