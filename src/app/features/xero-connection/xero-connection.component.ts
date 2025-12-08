import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { XeroService } from '../../core/services/xero.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, interval, takeUntil } from 'rxjs';

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
export class XeroConnectionComponent implements OnInit, OnDestroy {
  isLoading = true;
  xeroConnected = false;
  tenantId: string | null = null;
  lastSyncTime: string | null = null;
  tokenExpiresAt: string | null = null;
  timeUntilExpiry: string = '';
  
  private destroy$ = new Subject<void>();
  private authWindow: Window | null = null;
  private pollInterval = 3000; // Poll every 3 seconds for auth window
  private expiryCheckInterval = 60000; // Check expiry every 1 minute

  constructor(
    private xeroService: XeroService,
    private dashboardService: DashboardService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadConnectionStatus();
    this.startExpiryTimer();
    this.startAuthWindowListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.authWindow && !this.authWindow.closed) {
      this.authWindow.close();
    }
  }

  loadConnectionStatus(): void {
    this.isLoading = true;
    
    // Fetch both dashboard stats and current user profile
    Promise.all([
      this.dashboardService.getDashboardStats().toPromise(),
      this.authService.getCurrentUserProfile().toPromise()
    ]).then(([stats, user]) => {
      if (stats && user) {
        this.xeroConnected = stats.xeroConnected && !!user.xeroAccessToken;
        
        if (this.xeroConnected) {
          this.tenantId = user.xeroTenantId || stats.tenantId || null;
          this.lastSyncTime = stats.lastSyncTime;
          this.tokenExpiresAt = user.tokenExpiry || null;
          
          // Update expiry timer immediately
          this.updateTimeUntilExpiry();
        }
      }
      this.isLoading = false;
    }).catch((err) => {
      console.error('Error loading connection status', err);
      this.isLoading = false;
      this.toastr.error('Failed to load connection status', 'Error');
    });
  }

  connectXero(): void {
    this.xeroService.getAuthUrl().subscribe({
      next: (response) => {
        // Open auth URL in new window (non-blocking)
        this.authWindow = window.open(
          response.authorizationUrl,
          'XeroAuth',
          'width=800,height=600,left=200,top=200'
        );

        if (!this.authWindow) {
          this.toastr.error('Please allow pop-ups for Xero authentication', 'Pop-up Blocked');
          return;
        }

        this.toastr.info('Opening Xero authorization in new window...', 'Authentication');

        // Start polling for auth window closure
        this.startPollingForAuthCompletion();
      },
      error: (err) => {
        this.toastr.error(
          err.error?.message || 'Failed to get Xero authorization URL',
          'Error'
        );
      }
    });
  }

  private startPollingForAuthCompletion(): void {
    let pollCount = 0;
    const maxPolls = 600; // Stop after 30 minutes (600 * 3 seconds)

    interval(this.pollInterval)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        pollCount++;

        // Check if auth window is closed
        if (this.authWindow && this.authWindow.closed) {
          // Wait a moment for backend to process the OAuth callback
          setTimeout(() => {
            this.loadConnectionStatus();
            this.toastr.success('Xero authentication completed! Connection status updated.', 'Success');
          }, 2000);
          return;
        }

        // Stop polling after 30 minutes
        if (pollCount >= maxPolls) {
          this.toastr.info('Authentication window timeout', 'Info');
          return;
        }
      });
  }

  private startExpiryTimer(): void {
    // Update timer every minute
    interval(this.expiryCheckInterval)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.xeroConnected && this.tokenExpiresAt) {
          this.updateTimeUntilExpiry();
          
          // Get remaining time
          const expiryDate = new Date(this.tokenExpiresAt);
          const now = new Date();
          const minutesLeft = (expiryDate.getTime() - now.getTime()) / (1000 * 60);
          
          // Auto-refresh if expiring in less than 5 minutes
          if (minutesLeft < 5 && minutesLeft > 0) {
            this.toastr.warning('Token expiring soon, auto-refreshing...', 'Token Refresh');
            this.refreshToken();
          } else if (minutesLeft <= 0) {
            // Token expired
            this.xeroConnected = false;
            this.toastr.error('Xero token has expired. Please reconnect to Xero.', 'Token Expired');
          }
        }
      });
  }

  private updateTimeUntilExpiry(): void {
    if (!this.tokenExpiresAt) {
      this.timeUntilExpiry = '';
      return;
    }

    const expiryDate = new Date(this.tokenExpiresAt);
    const now = new Date();
    const diffMs = expiryDate.getTime() - now.getTime();

    if (diffMs <= 0) {
      this.timeUntilExpiry = 'Expired';
      this.xeroConnected = false;
      return;
    }

    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    this.timeUntilExpiry = `${minutes}m ${seconds}s`;
  }

  private startAuthWindowListener(): void {
    // Listen for messages from auth callback window
    window.addEventListener('message', (event) => {
      // Verify origin for security
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'XERO_AUTH_SUCCESS') {
        this.toastr.success('Xero connected successfully!', 'Success');
        this.loadConnectionStatus();
        if (this.authWindow && !this.authWindow.closed) {
          this.authWindow.close();
        }
      } else if (event.data?.type === 'XERO_AUTH_FAILED') {
        this.toastr.error('Xero authentication failed or was cancelled', 'Error');
        if (this.authWindow && !this.authWindow.closed) {
          this.authWindow.close();
        }
      }
    });
  }

  refreshToken(): void {
    this.xeroService.refreshToken().subscribe({
      next: (response) => {
        this.toastr.success(response.message || 'Token refreshed successfully', 'Success');
        // Reload connection status to get updated token expiry
        this.loadConnectionStatus();
      },
      error: (err) => {
        console.error('Token refresh error:', err);
        this.toastr.error(
          err.error?.message || 'Failed to refresh token. Please reconnect Xero.',
          'Error'
        );
        // Force reconnection if refresh fails
        this.xeroConnected = false;
      }
    });
  }

  disconnectXero(): void {
    if (!confirm('Are you sure you want to disconnect Xero? You will need to reconnect to continue syncing.')) {
      return;
    }

    this.xeroService.disconnectXero().subscribe({
      next: () => {
        this.xeroConnected = false;
        this.tenantId = null;
        this.lastSyncTime = null;
        this.tokenExpiresAt = null;
        this.timeUntilExpiry = '';
        this.toastr.success('Xero disconnected successfully', 'Success');
      },
      error: (err) => {
        this.toastr.error(
          err.error?.message || 'Failed to disconnect Xero',
          'Error'
        );
      }
    });
  }
}