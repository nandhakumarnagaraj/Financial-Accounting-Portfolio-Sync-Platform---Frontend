import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { XeroService } from '../../core/services/xero.service';
import { XeroInvoice } from '../../core/models/xero-data.models';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-invoices',
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
  templateUrl: './invoices.component.html',
  styleUrl: './invoices.component.scss',
})
export class InvoicesComponent implements OnInit {
  displayedColumns: string[] = [
    'invoiceNumber',
    'contactName',
    'date',
    'dueDate',
    'total',
    'amountDue',
    'status',
  ];
  dataSource = new MatTableDataSource<XeroInvoice>();
  isLoading = true;
  error: string | null = null;

  @ViewChild(MatSort) sort!: MatSort;

  constructor(private xeroService: XeroService) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  loadInvoices(): void {
    this.isLoading = true;
    this.error = null;
    this.xeroService.getInvoices().subscribe({
      next: (invoices) => {
        this.dataSource.data = invoices;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching invoices', err);
        this.error = 'Failed to load invoices. Please try again later.';
        this.isLoading = false;
      },
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
