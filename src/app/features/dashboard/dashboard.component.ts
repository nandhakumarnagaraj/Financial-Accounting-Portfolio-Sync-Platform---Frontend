import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardStatsResponse } from '../../core/models/dashboard-stats.model';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    BaseChartDirective,
    MatButtonModule,
    MatMenuModule,
    CurrencyPipe // For currency pipe in HTML
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  isLoading = true;
  dashboardStats: DashboardStatsResponse | null = null;

  // Monthly Revenue Chart
  public revenueChartData: ChartConfiguration['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Revenue',
      data: [12000, 15000, 13000, 18000, 16000, 20000, 22000, 19000, 24000, 21000, 25000, 27000],
      backgroundColor: 'rgba(102, 126, 234, 0.8)',
      borderColor: 'rgba(102, 126, 234, 1)',
      borderWidth: 2,
      borderRadius: 10,
      barThickness: 40,
    }]
  };

  public revenueChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: (context: any) => {
            if (context.parsed && typeof context.parsed.y === 'number') {
              return `Revenue: $${context.parsed.y.toLocaleString()}`;
            }
            return `Revenue: N/A`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          callback: (value: number) => '$' + value.toLocaleString()
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };


  // Expense vs Income Doughnut Chart
  public expenseIncomeChartData: ChartConfiguration['data'] = {
    labels: ['Income', 'Expenses'],
    datasets: [{
      data: [125000, 26250],
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderColor: [
        'rgba(16, 185, 129, 1)',
        'rgba(239, 68, 68, 1)'
      ],
      borderWidth: 3,
      hoverOffset: 20
    }]
  };

  public expenseIncomeChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed;
            return `${label}: $${value.toLocaleString()}`;
          }
        }
      }
    }
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getDashboardStats().subscribe(stats => {
      this.dashboardStats = stats;
      // You would typically update the chart data based on actual fetched stats
      // For this example, we use hardcoded values from the UI guide.
      // In a real app, you'd process `stats` to fill `revenueChartData.datasets[0].data` etc.
      this.isLoading = false;
    });
  }
}