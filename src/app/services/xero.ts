import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import {
  XeroInvoiceDTO,
  XeroAccountDTO,
  SyncResponseDTO,
  SyncStatusResponse,
  XeroAuthResponse,
  XeroCallbackResponse,
  SyncAllResponse
} from '../models/xero.model';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class XeroService {
  private apiUrl = 'http://localhost:8080/api/xero';
  
  private syncStatusSubject = new BehaviorSubject<SyncStatusResponse | null>(null);
  public syncStatus$ = this.syncStatusSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkConnectionStatus();
  }

  getAuthorizationUrl(): Observable<XeroAuthResponse> {
    return this.http.get<XeroAuthResponse>(`${this.apiUrl}/auth`).pipe(
      catchError(error => {
        console.error('Error getting authorization URL:', error);
        throw error;
      })
    );
  }

  checkConnectionStatus(): void {
    this.http.get<SyncStatusResponse>(`${this.apiUrl}/status`).pipe(
      tap(status => this.syncStatusSubject.next(status)),
      catchError(error => {
        console.error('Error checking connection status:', error);
        return of(null);
      })
    ).subscribe();
  }

  disconnectXero(): Observable<any> {
    return this.http.post(`${this.apiUrl}/disconnect`, {}).pipe(
      tap(() => {
        this.syncStatusSubject.next(null);
        this.checkConnectionStatus();
      }),
      catchError(error => {
        console.error('Error disconnecting Xero:', error);
        throw error;
      })
    );
  }

  syncInvoices(): Observable<SyncResponseDTO> {
    return this.http.post<SyncResponseDTO>(`${this.apiUrl}/invoices/sync`, {});
  }

  syncAccounts(): Observable<SyncResponseDTO> {
    return this.http.post<SyncResponseDTO>(`${this.apiUrl}/accounts/sync`, {});
  }

  syncTransactions(): Observable<SyncResponseDTO> {
    return this.http.post<SyncResponseDTO>(`${this.apiUrl}/transactions/sync`, {});
  }

  syncAll(): Observable<SyncAllResponse> {
    return this.http.post<SyncAllResponse>(`${this.apiUrl}/sync-all`, {});
  }

  getInvoices(status?: string, page: number = 0, size: number = 50): Observable<any> {
    let url = `${this.apiUrl}/invoices?page=${page}&size=${size}`;
    if (status) {
      url += `&status=${status}`;
    }
    return this.http.get<any>(url);
  }

  getAccounts(type?: string, status?: string): Observable<any> {
    let url = `${this.apiUrl}/accounts`;
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (status) params.append('status', status);
    if (params.toString()) {
      url += '?' + params.toString();
    }
    return this.http.get<any>(url);
  }

  refreshToken(): Observable<any> {
    return this.http.post(`${this.apiUrl}/refresh-token`, {}).pipe(
      tap(() => this.checkConnectionStatus()),
      catchError(error => {
        console.error('Error refreshing token:', error);
        throw error;
      })
    );
  }
}