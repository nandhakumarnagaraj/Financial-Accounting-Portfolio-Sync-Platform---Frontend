import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DashboardStats } from "../models/xero.model";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";


@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) { }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }

  getMonthlyRevenue(): Observable<any> {
    return this.http.get(`${this.apiUrl}/revenue`);
  }

  getIncomeExpense(): Observable<any> {
    return this.http.get(`${this.apiUrl}/income-expense`);
  }
}