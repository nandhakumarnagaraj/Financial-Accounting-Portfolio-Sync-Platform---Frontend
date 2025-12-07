import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { XeroInvoice, XeroAccount, XeroTransaction, SyncResponse, MessageResponse } from '../models/xero-data.models';
import { SyncStatusResponse } from '../models/xero.model';

@Injectable({
  providedIn: 'root'
})
export class XeroService {
  private apiUrl = `${environment.apiUrl}/xero`;

  constructor(private http: HttpClient) {}

  get syncStatus$(): Observable<SyncStatusResponse> {
    return this.http.get<SyncStatusResponse>(`${this.apiUrl}/status`);
  }

  getAuthUrl(): Observable<{authorizationUrl: string}> {
    return this.http.get<{authorizationUrl: string}>(`${this.apiUrl}/auth`);
  }

  syncInvoices(): Observable<SyncResponse> {
    return this.http.post<SyncResponse>(`${this.apiUrl}/invoices/sync`, {});
  }

  syncAccounts(): Observable<SyncResponse> {
    return this.http.post<SyncResponse>(`${this.apiUrl}/accounts/sync`, {});
  }

  syncTransactions(): Observable<SyncResponse> {
    return this.http.post<SyncResponse>(`${this.apiUrl}/transactions/sync`, {});
  }

  refreshToken(): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.apiUrl}/refresh-token`, {});
  }

  disconnectXero(): Observable<any> {
    return this.http.post(`${this.apiUrl}/disconnect`, {});
  }

  getInvoices(): Observable<XeroInvoice[]> {
    return this.http.get<XeroInvoice[]>(`${this.apiUrl}/invoices`);
  }

  getAccounts(): Observable<XeroAccount[]> {
    return this.http.get<XeroAccount[]>(`${this.apiUrl}/accounts`);
  }

  getTransactions(): Observable<XeroTransaction[]> {
    return this.http.get<XeroTransaction[]>(`${this.apiUrl}/transactions`);
  }
}