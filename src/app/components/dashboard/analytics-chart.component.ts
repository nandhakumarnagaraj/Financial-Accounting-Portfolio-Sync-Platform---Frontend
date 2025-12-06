import { Component, OnInit } from ' @angular/core';
import { CommonModule } from ' @angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { DashboardService } from '../../services/dashboard';

 @Component({
  selector: 'app-analytics-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="row">
      <!-- Monthly Revenue -->
      <div class="col-md-6 mb-4">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-white border-bottom">
            <h5 class="mb-0">📊 Monthly Revenue</h5>
          </div>
          <div class="card-body">
            <div *ngIf="loadingRevenue" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div *ngIf="!loadingRevenue" class="chart-container">
              <canvas baseChart
                [data]="revenueData"
                [options]="revenueOptions"
                [type]="'bar'">
              </canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Expense vs Income -->
      <div class="col-md-6 mb-4">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-white border-bottom">
            <h5 class="mb-0">💰 Expense vs Income</h5>
          </div>
          <div class="card-body">
            <div *ngIf="loadingPie" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div *ngIf="!loadingPie" class="chart-container">
              <canvas baseChart
                [data]="pieData"
                [options]="pieOptions"
                [type]="'pie'">
              </canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chart-container {
      position: relative;
      height: 300px;
      width: 100%;
    }
  `]
})
export class AnalyticsChartComponent implements OnInit {
  
  loadingRevenue = true;
  loadingPie = true;

  public revenueData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };

  public revenueOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
      }
    }
  };

  public pieData: ChartData<'pie'> = {
    labels: [],
    datasets: []
  };

  public pieOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      }
    }
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadChartData();
  }

  loadChartData(): void {
    // Load revenue data
    this.dashboardService.getMonthlyRevenue().subscribe({
      next: (data) => {
        this.revenueData = {
          labels: data.months,
          datasets: [{
            data: data.amounts,
            label: 'Revenue',
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        };
        this.loadingRevenue = false;
      },
      error: (err) => {
        console.error('Error loading revenue data:', err);
        this.loadingRevenue = false;
      }
    });

    // Load income/expense data
    this.dashboardService.getIncomeExpense().subscribe({
      next: (data) => {
        this.pieData = {
          labels: ['Income', 'Expenses'],
          datasets: [{
            data: [data.income, data.expenses],
            backgroundColor: [
              'rgba(75, 192, 192, 0.8)',
              'rgba(255, 99, 132, 0.8)',
            ],
            hoverBackgroundColor: [
              'rgba(75, 192, 192, 1)',
              'rgba(255, 99, 132, 1)',
            ]
          }]
        };
        this.loadingPie = false;
      },
      error: (err) => {
        console.error('Error loading income/expense data:', err);
        this.loadingPie = false;
      }
    });
  }
}