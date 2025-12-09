import { Injectable } from '@angular/core';
import { Observable, map, BehaviorSubject, of, forkJoin } from 'rxjs';
import { environment } from '../../environments/environment';
import { XeroInvoice, XeroAccount, XeroTransaction, SyncResponse, MessageResponse, XeroConnectionState } from '../models/xero-data.models';
import { SyncStatusResponse } from '../models/xero.model';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { DashboardService } from './dashboard.service';

@Injectable({
  providedIn: 'root'
})
export class XeroService {
  
  private apiUrl = `${environment.apiUrl}/xero`;
  
  // LocalStorage keys for persistence
  private readonly LOCAL_STORAGE_XERO_STATE_KEY = 'xero_connection_state';
  private readonly LOCAL_STORAGE_SYNC_TIMESTAMPS_KEY = 'xero_sync_timestamps';
  private readonly LOCAL_STORAGE_INVOICES_KEY = 'xero_invoices_cache';
  private readonly LOCAL_STORAGE_TRANSACTIONS_KEY = 'xero_transactions_cache';
  
  private _invoicesCache = new BehaviorSubject<XeroInvoice[] | null>(null);
  private _transactionsCache = new BehaviorSubject<XeroTransaction[] | null>(null);
  private _xeroConnectionStateCache = new BehaviorSubject<XeroConnectionState | null>(null);

  get xeroConnectionState$(): Observable<XeroConnectionState | null> {
    return this._xeroConnectionStateCache.asObservable();
  }

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private dashboardService: DashboardService
  ) {
    // Load cached data from localStorage on initialization
    this.loadCachedDataFromStorage();
  }

  private loadCachedDataFromStorage(): void {
    // Load invoices cache
    const cachedInvoices = localStorage.getItem(this.LOCAL_STORAGE_INVOICES_KEY);
    if (cachedInvoices) {
      try {
        this._invoicesCache.next(JSON.parse(cachedInvoices));
      } catch (e) {
        console.error('Error parsing cached invoices', e);
      }
    }

    // Load transactions cache
    const cachedTransactions = localStorage.getItem(this.LOCAL_STORAGE_TRANSACTIONS_KEY);
    if (cachedTransactions) {
      try {
        this._transactionsCache.next(JSON.parse(cachedTransactions));
      } catch (e) {
        console.error('Error parsing cached transactions', e);
      }
    }

    // Load connection state cache
    const cachedState = localStorage.getItem(this.LOCAL_STORAGE_XERO_STATE_KEY);
    if (cachedState) {
      try {
        this._xeroConnectionStateCache.next(JSON.parse(cachedState));
      } catch (e) {
        console.error('Error parsing cached connection state', e);
      }
    }
  }

  get syncStatus$(): Observable<SyncStatusResponse> {
    return this.http.get<SyncStatusResponse>(`${this.apiUrl}/status`);
  }

  getAuthUrl(): Observable<{authorizationUrl: string}> {
    return this.http.get<{authorizationUrl: string}>(`${this.apiUrl}/auth`);
  }

  syncInvoices(): Observable<SyncResponse> {
    return this.http.post<SyncResponse>(`${this.apiUrl}/invoices/sync`, {}).pipe(
      tap(() => {
        // Clear cache to force refresh on next fetch
        this._invoicesCache.next(null);
        localStorage.removeItem(this.LOCAL_STORAGE_INVOICES_KEY);
        
        // Update sync timestamp
        this.updateSyncTimestamp('invoices');
        this.dashboardService.refreshDashboardStats().subscribe(() => {
          // After dashboard stats are refreshed, refresh the connection state
          this.getXeroConnectionState(true).subscribe();
        });
      })
    );
  }

  syncAccounts(): Observable<SyncResponse> {
    return this.http.post<SyncResponse>(`${this.apiUrl}/accounts/sync`, {}).pipe(
      tap(() => {
        // Update sync timestamp
        this.updateSyncTimestamp('accounts');
        this.dashboardService.refreshDashboardStats().subscribe(() => {
          // After dashboard stats are refreshed, refresh the connection state
          this.getXeroConnectionState(true).subscribe();
        });
      })
    );
  }

  syncTransactions(): Observable<SyncResponse> {
    return this.http.post<SyncResponse>(`${this.apiUrl}/transactions/sync`, {}).pipe(
      tap(() => {
        // Clear cache to force refresh on next fetch
        this._transactionsCache.next(null);
        localStorage.removeItem(this.LOCAL_STORAGE_TRANSACTIONS_KEY);
        
        // Update sync timestamp
        this.updateSyncTimestamp('transactions');
        this.dashboardService.refreshDashboardStats().subscribe(() => {
          // After dashboard stats are refreshed, refresh the connection state
          this.getXeroConnectionState(true).subscribe();
        });
      })
    );
  }

  refreshToken(): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.apiUrl}/refresh-token`, {});
  }

  disconnectXero(): Observable<any> {
    return this.http.post(`${this.apiUrl}/disconnect`, {});
  }

  getInvoices(): Observable<XeroInvoice[]> {
    const cachedInvoices = this._invoicesCache.getValue();
    if (cachedInvoices) {
      return of(cachedInvoices);
    }

    return this.http.get<any[]>(`${this.apiUrl}/invoices`).pipe(
      map(invoices => invoices.map(invoice => ({
        ...invoice,
        invoiceID: invoice.id ? String(invoice.id) : ''
      } as XeroInvoice))),
      tap(invoices => {
        this._invoicesCache.next(invoices);
        // Persist to localStorage
        localStorage.setItem(this.LOCAL_STORAGE_INVOICES_KEY, JSON.stringify(invoices));
      })
    );
  }

  getAccounts(): Observable<XeroAccount[]> {
    return this.http.get<XeroAccount[]>(`${this.apiUrl}/accounts`);
  }

  getTransactions(): Observable<XeroTransaction[]> {
    const cachedTransactions = this._transactionsCache.getValue();
    if (cachedTransactions) {
      return of(cachedTransactions);
    }

    return this.http.get<XeroTransaction[]>(`${this.apiUrl}/transactions`).pipe(
      tap(transactions => {
        this._transactionsCache.next(transactions);
        // Persist to localStorage
        localStorage.setItem(this.LOCAL_STORAGE_TRANSACTIONS_KEY, JSON.stringify(transactions));
      })
    );
  }

  getXeroConnectionState(forceRefresh: boolean = false): Observable<XeroConnectionState> {
    const cachedState = this._xeroConnectionStateCache.getValue();
    if (cachedState && !forceRefresh) {
      return of(cachedState);
    }

    return forkJoin({
      dashboardStats: this.dashboardService.getDashboardStats(forceRefresh),
      userProfile: this.authService.getCurrentUserProfile(forceRefresh)
    }).pipe(
      map(({ dashboardStats, userProfile }) => {
        const state: XeroConnectionState = {
          xeroConnected: dashboardStats.xeroConnected && !!userProfile.xeroAccessToken,
          tenantId: userProfile.xeroTenantId || dashboardStats.tenantId || null,
          lastSyncTime: dashboardStats.lastSyncTime,
          tokenExpiresAt: userProfile.tokenExpiry || null,
        };
        this._xeroConnectionStateCache.next(state);
        // Persist to localStorage
        localStorage.setItem(this.LOCAL_STORAGE_XERO_STATE_KEY, JSON.stringify(state));
        return state;
      })
    );
  }

  // Sync timestamp management
  getSyncTimestamps(): { invoices: string | null; accounts: string | null; transactions: string | null } {
    const stored = localStorage.getItem(this.LOCAL_STORAGE_SYNC_TIMESTAMPS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing sync timestamps', e);
      }
    }
    return { invoices: null, accounts: null, transactions: null };
  }

  private updateSyncTimestamp(type: 'invoices' | 'accounts' | 'transactions'): void {
    const timestamps = this.getSyncTimestamps();
    timestamps[type] = new Date().toISOString();
    localStorage.setItem(this.LOCAL_STORAGE_SYNC_TIMESTAMPS_KEY, JSON.stringify(timestamps));
  }

  clearCachedData(): void {
    this._invoicesCache.next(null);
    this._transactionsCache.next(null);
    this._xeroConnectionStateCache.next(null);
  }


}