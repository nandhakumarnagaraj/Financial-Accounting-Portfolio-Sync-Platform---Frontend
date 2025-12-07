import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { XeroService } from '../../core/services/xero.service';
import { XeroTransaction } from '../../core/models/xero-data.models';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatMenuModule,
  ],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss',
})
export class TransactionsComponent implements OnInit {
  displayedColumns: string[] = [
    'date',
    'description',
    'amount',
    'currency',
    'status',
    'actions',
  ];
  dataSource = new MatTableDataSource<XeroTransaction>();
  isLoading = true;
  error: string | null = null;

  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private xeroService: XeroService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  ngAfterViewInit() {
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  loadTransactions(): void {
    this.xeroService.getTransactions().subscribe({
      next: (transactions) => {
        this.dataSource.data = transactions;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching transactions', err);
        this.error = 'Failed to load transactions. Please try again later.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getStatusClass(status: string): string {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('completed') || statusLower.includes('reconciled')) {
      return 'status-completed';
    } else if (statusLower.includes('pending') || statusLower.includes('unreconciled')) {
      return 'status-pending';
    }
    return 'status-failed';
  }

  isIncome(transaction: any): boolean {
    // Check if transaction type indicates income (RECEIVE, CREDIT, etc.)
    const type = transaction.type?.toLowerCase() || transaction.transactionType?.toLowerCase() || '';
    return type.includes('receive') || type.includes('credit') || type.includes('income') || transaction.isReconciled;
  }

  getTransactionType(transaction: any): string {
    return this.isIncome(transaction) ? 'Income' : 'Expense';
  }

  getTypeClass(transaction: any): string {
    return this.isIncome(transaction) ? 'type-income' : 'type-expense';
  }

  getTypeIcon(transaction: any): string {
    return this.isIncome(transaction) ? 'arrow_downward' : 'arrow_upward';
  }

  getTotalIncome(): number {
    return this.dataSource.data
      .filter(t => this.isIncome(t))
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  }

  getTotalExpenses(): number {
    return this.dataSource.data
      .filter(t => !this.isIncome(t))
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  }

  getNetBalance(): number {
    return this.getTotalIncome() - this.getTotalExpenses();
  }
}