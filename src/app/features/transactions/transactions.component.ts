import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
  ];
  dataSource = new MatTableDataSource<XeroTransaction>();
  isLoading = true;
  error: string | null = null;

  @ViewChild(MatSort) sort!: MatSort;

  constructor(private xeroService: XeroService) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  loadTransactions(): void {
    this.isLoading = true;
    this.error = null;
    this.xeroService.getTransactions().subscribe({
      next: (transactions) => {
        this.dataSource.data = transactions;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching transactions', err);
        this.error = 'Failed to load transactions. Please try again later.';
        this.isLoading = false;
      },
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
