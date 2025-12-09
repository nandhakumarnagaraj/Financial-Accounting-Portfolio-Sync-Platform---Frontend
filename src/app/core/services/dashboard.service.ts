import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { DashboardStatsResponse } from '../models/dashboard-stats.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;
  private _dashboardStatsCache = new BehaviorSubject<DashboardStatsResponse | null>(null);

  constructor(private http: HttpClient) {}

  getDashboardStats(forceRefresh: boolean = false): Observable<DashboardStatsResponse> {
    const cachedStats = this._dashboardStatsCache.getValue();
    if (cachedStats && !forceRefresh) {
      return of(cachedStats);
    }
    
    return this.http.get<DashboardStatsResponse>(`${this.apiUrl}/stats`).pipe(
      tap(stats => this._dashboardStatsCache.next(stats)),
      shareReplay(1)
    );
  }

  refreshDashboardStats(): Observable<DashboardStatsResponse> {
    // Clear cache to ensure a fresh fetch
    this._dashboardStatsCache.next(null);
    return this.getDashboardStats(true);
  }

  clearCachedData(): void {
    this._dashboardStatsCache.next(null);
  }
}