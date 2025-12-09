import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { XeroService } from '../../core/services/xero.service';
import { ToastrService } from 'ngx-toastr';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, interval, takeUntil, Subscription } from 'rxjs';

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
  private pollInterval = 3000;
  private expiryCheckInterval = 60000;
  private pollingSubscription: Subscription | null = null;

  constructor(
    private xeroService: XeroService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.xeroService.xeroConnectionState$.pipe(takeUntil(this.destroy$)).subscribe(state => {
      this.isLoading = !state;
      if (state) {
        this.xeroConnected = state.xeroConnected;
        this.tenantId = state.tenantId;
        this.lastSyncTime = state.lastSyncTime;
        this.tokenExpiresAt = state.tokenExpiresAt;
        if (state.xeroConnected) {
          this.updateTimeUntilExpiry();
        }
      } else {
        this.xeroConnected = false;
      }
      this.cdr.markForCheck();
    });

    this.loadConnectionStatus(false);
    this.startExpiryTimer();
    this.startAuthWindowListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.authWindow && !this.authWindow.closed) {
      this.authWindow.close();
    }
    this.pollingSubscription?.unsubscribe();
  }

  loadConnectionStatus(forceRefresh: boolean = false): void {
    if (!forceRefresh) {
      this.isLoading = true;
    }
    this.xeroService.getXeroConnectionState(forceRefresh).subscribe({
      error: (err) => {
        console.error('Error loading connection status', err);
        this.isLoading = false;
        this.toastr.error('Failed to load connection status', 'Error');
        this.cdr.markForCheck();
      }
    });
  }

  connectXero(): void {
    this.xeroService.getAuthUrl().subscribe({
      next: (response) => {
        this.authWindow = window.open(response.authorizationUrl, 'XeroAuth', 'width=800,height=600,left=200,top=200');
        if (!this.authWindow) {
          this.toastr.error('Please allow pop-ups for Xero authentication', 'Pop-up Blocked');
          return;
        }
        this.toastr.info('Opening Xero authorization in new window...', 'Authentication');
        this.startPollingForAuthCompletion();
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to get Xero authorization URL', 'Error');
      }
    });
  }

  private startPollingForAuthCompletion(): void {
    this.pollingSubscription?.unsubscribe(); // Stop any previous polling

    this.pollingSubscription = interval(this.pollInterval)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.authWindow && this.authWindow.closed) {
          this.pollingSubscription?.unsubscribe(); // Stop polling
          this.toastr.info('Verifying authentication, please wait...', 'Processing');
          // Wait a moment for backend to process the OAuth callback, then refresh
          setTimeout(() => this.loadConnectionStatus(true), 2500);
        }
      });
  }

  private startExpiryTimer(): void {
    interval(this.expiryCheckInterval)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.xeroConnected && this.tokenExpiresAt) {
          this.updateTimeUntilExpiry();
          const expiryDate = new Date(this.tokenExpiresAt);
          const now = new Date();
          const minutesLeft = (expiryDate.getTime() - now.getTime()) / (1000 * 60);

          if (minutesLeft < 5 && minutesLeft > 0) {
            this.toastr.warning('Token expiring soon, auto-refreshing...', 'Token Refresh');
            this.refreshToken();
          } else if (minutesLeft <= 0) {
            this.toastr.error('Xero token has expired. Please reconnect.', 'Token Expired');
            this.xeroService.clearCachedData();
            this.loadConnectionStatus(true);
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
    } else {
      const minutes = Math.floor(diffMs / 60000);
      const seconds = Math.floor((diffMs % 60000) / 1000);
      this.timeUntilExpiry = `${minutes}m ${seconds}s`;
    }
  }

  private startAuthWindowListener(): void {
    window.addEventListener('message', (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'XERO_AUTH_SUCCESS') {
        this.pollingSubscription?.unsubscribe();
        this.toastr.success('Xero connected successfully!', 'Success');
        this.loadConnectionStatus(true);
        this.authWindow?.close();
      } else if (event.data?.type === 'XERO_AUTH_FAILED') {
        this.pollingSubscription?.unsubscribe();
        this.toastr.error('Xero authentication failed or was cancelled', 'Error');
        this.authWindow?.close();
      }
    });
  }

  refreshToken(): void {
    this.xeroService.refreshToken().subscribe({
      next: (response) => {
        this.toastr.success(response.message || 'Token refreshed successfully', 'Success');
        this.loadConnectionStatus(true);
      },
      error: (err) => {
        console.error('Token refresh error:', err);
        this.toastr.error(err.error?.message || 'Failed to refresh token. Please reconnect Xero.', 'Error');
        this.xeroService.clearCachedData();
        this.loadConnectionStatus(true);
      }
    });
  }
}