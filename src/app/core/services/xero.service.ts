import { Injectable, Inject, forwardRef } from '@angular/core';
import { Observable, map, BehaviorSubject, of, forkJoin } from 'rxjs';
import { environment } from '../../environments/environment';
import { XeroInvoice, XeroAccount, XeroTransaction, SyncResponse, MessageResponse, XeroConnectionState } from '../models/xero-data.models';
import { SyncStatusResponse } from '../models/xero.model';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth.service'; // Import AuthService
import { DashboardService } from './dashboard.service'; // Import DashboardService

@Injectable({
  providedIn: 'root'
})
export class XeroService {
  
  private apiUrl = `${environment.apiUrl}/xero`;
  private _invoicesCache = new BehaviorSubject<XeroInvoice[] | null>(null);
  private _transactionsCache = new BehaviorSubject<XeroTransaction[] | null>(null);
  private _xeroConnectionStateCache = new BehaviorSubject<XeroConnectionState | null>(null);


  constructor(
    private http: HttpClient,
    @Inject(forwardRef(() => AuthService)) private authService: AuthService,
    private dashboardService: DashboardService
  ) {}

  get syncStatus$(): Observable<SyncStatusResponse> {
    return this.http.get<SyncStatusResponse>(`${this.apiUrl}/status`);
  }

  getAuthUrl(): Observable<{authorizationUrl: string}> {
    return this.http.get<{authorizationUrl: string}>(`${this.apiUrl}/auth`);
  }

  syncInvoices(): Observable<SyncResponse> {
    // Clear cache to ensure fresh data after sync
    this._invoicesCache.next(null);
    return this.http.post<SyncResponse>(`${this.apiUrl}/invoices/sync`, {});
  }

  syncAccounts(): Observable<SyncResponse> {
    return this.http.post<SyncResponse>(`${this.apiUrl}/accounts/sync`, {});
  }

  syncTransactions(): Observable<SyncResponse> {
    // Clear cache to ensure fresh data after sync
    this._transactionsCache.next(null);
    return this.http.post<SyncResponse>(`${this.apiUrl}/transactions/sync`, {});
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
      tap(invoices => this._invoicesCache.next(invoices)) // Cache the fetched data
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
      tap(transactions => this._transactionsCache.next(transactions)) // Cache the fetched data
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
        return state;
      })
    );
  }

  clearCachedData(): void {
    this._invoicesCache.next(null);
    this._transactionsCache.next(null);
    this._xeroConnectionStateCache.next(null); // Clear Xero connection state cache
  }
}