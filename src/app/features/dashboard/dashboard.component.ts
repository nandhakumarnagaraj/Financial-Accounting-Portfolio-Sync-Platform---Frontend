import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardStatsResponse, Invoice, Transaction } from '../../core/models/dashboard-stats.model';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { forkJoin } from 'rxjs';

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

  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
refreshDashboard() {
throw new Error('Method not implemented.');
}
  isLoading = true;
  dashboardStats: DashboardStatsResponse | null = null;
  totalMonthlyRevenue: number = 0;
  monthlyRevenueGrowth: string = '0%';
  currentMonthIncome: number = 0;
  currentMonthExpenses: number = 0;
  currentMonthNetIncome: number = 0;


  // Monthly Revenue Chart
  public revenueChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{
      label: 'Revenue',
      data: [],
      backgroundColor: 'rgba(102, 126, 234, 0.8)',
      borderColor: 'rgba(102, 126, 234, 1)',
      borderWidth: 2,
      borderRadius: 10,
      barThickness: 40,
    }]
  };

  public revenueChartType: ChartType = 'bar';
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
              return `Revenue: ₹${context.parsed.y.toLocaleString()}`;
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
                    ticks: { callback: (value: number) => '₹' + value.toLocaleString() }
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
      data: [],
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

  public expenseIncomeChartType: ChartType = 'doughnut';

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
            return `${label}: ₹${value.toLocaleString()}`;
          }
        }
      }
    }
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    forkJoin({
      dashboardStats: this.dashboardService.getDashboardStats()
    }).subscribe({
      next: (result) => {
        this.dashboardStats = result.dashboardStats;
        this.processMonthlyRevenueData();
        this.processIncomeVsExpensesData();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard data', err);
        this.isLoading = false;
      }
    });
  }

  private processMonthlyRevenueData(): void {
    if (!this.dashboardStats || !this.dashboardStats.invoices) {
      return;
    }

    const monthlyRevenueMap = new Map<string, number>();
    const months: string[] = [];
    const revenues: number[] = [];
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    for (let i = 0; i < 12; i++) {
      let month = currentMonth - i;
      let year = currentYear;
      if (month < 0) {
        month += 12;
        year -= 1;
      }
      const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });
      const key = `${monthName} ${year}`;
      monthlyRevenueMap.set(key, 0);
    }

    this.dashboardStats.invoices.forEach((invoice: Invoice) => {
      const invoiceDate = new Date(invoice.invoiceDate);
      if (invoice.status !== 'DELETED' && invoice.status !== 'VOIDED') {
        const monthName = invoiceDate.toLocaleString('default', { month: 'long' });
        const year = invoiceDate.getFullYear();
        const key = `${monthName} ${year}`;
        if (monthlyRevenueMap.has(key)) {
          monthlyRevenueMap.set(key, monthlyRevenueMap.get(key)! + invoice.total);
        }
      }
    });

    const sortedKeys = Array.from(monthlyRevenueMap.keys()).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA.getTime() - dateB.getTime();
    });

    sortedKeys.forEach(key => {
      months.push(key.split(' ')[0]);
      revenues.push(monthlyRevenueMap.get(key)!);
    });


    this.revenueChartData.labels = months;
    this.revenueChartData.datasets[0].data = revenues;

    console.log('Monthly Revenue Labels:', this.revenueChartData.labels);
    console.log('Monthly Revenue Data:', this.revenueChartData.datasets[0].data);

    this.totalMonthlyRevenue = revenues.reduce((acc, val) => acc + val, 0);
    if (revenues.length >= 2) {
      const lastMonthRevenue = revenues[revenues.length - 1];
      const secondLastMonthRevenue = revenues[revenues.length - 2];
      if (secondLastMonthRevenue !== 0) {
        const growth = ((lastMonthRevenue - secondLastMonthRevenue) / secondLastMonthRevenue) * 100;
        this.monthlyRevenueGrowth = `${growth.toFixed(1)}%`;
      } else {
        this.monthlyRevenueGrowth = 'N/A';
      }
    } else {
      this.monthlyRevenueGrowth = 'N/A';
    }
  }

  private processIncomeVsExpensesData(): void {
    if (!this.dashboardStats || !this.dashboardStats.invoices || !this.dashboardStats.transactions) {
      return;
    }

    let income = 0;
    let expenses = 0;
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    this.dashboardStats.invoices.forEach((invoice: Invoice) => {
      const invoiceDate = new Date(invoice.invoiceDate);
      if (invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear &&
          invoice.status !== 'DELETED' && invoice.status !== 'VOIDED') {
        income += invoice.total;
      }
    });

    this.dashboardStats.transactions.forEach((transaction: Transaction) => {
      const transactionDate = new Date(transaction.transactionDate);
      if (transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear &&
          transaction.transactionType === 'SPEND' &&
          transaction.status !== 'DELETED' && transaction.status !== 'VOIDED') {
        expenses += transaction.amount;
      }
    });

    this.currentMonthIncome = income;
    this.currentMonthExpenses = expenses;
    this.currentMonthNetIncome = income - expenses;

    this.expenseIncomeChartData.datasets[0].data = [income, expenses];

    console.log('Current Month Income:', income);
    console.log('Current Month Expenses:', expenses);
    console.log('Expense Income Chart Data:', this.expenseIncomeChartData.datasets[0].data);
  }
}