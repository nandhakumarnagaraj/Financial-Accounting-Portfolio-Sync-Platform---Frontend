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
    MatMenuModule,
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
    'actions',
  ];
  dataSource = new MatTableDataSource<XeroInvoice>();
  isLoading = true;
  error: string | null = null;

  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private xeroService: XeroService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  ngAfterViewInit() {
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  loadInvoices(): void {
    this.xeroService.getInvoices().subscribe({
      next: (invoices) => {
        this.dataSource.data = invoices;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching invoices', err);
        this.error = 'Failed to load invoices. Please try again later.';
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
    if (statusLower.includes('paid') || statusLower.includes('authorised')) {
      return 'status-paid';
    } else if (statusLower.includes('draft')) {
      return 'status-draft';
    } else if (statusLower.includes('voided') || statusLower.includes('deleted')) {
      return 'status-overdue';
    }
    return 'status-pending';
  }

  isOverdue(dueDate: string): boolean {
    return new Date(dueDate) < new Date();
  }

  getPaidCount(): number {
    return this.dataSource.data.filter(invoice => 
      invoice.status.toLowerCase().includes('paid') || 
      invoice.status.toLowerCase().includes('authorised')
    ).length;
  }

  getPendingCount(): number {
    return this.dataSource.data.filter(invoice => 
      !invoice.status.toLowerCase().includes('paid') && 
      !invoice.status.toLowerCase().includes('authorised')
    ).length;
  }

  getTotalAmount(): number {
    return this.dataSource.data.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
  }
}