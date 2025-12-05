import { Component, OnInit } from '@angular/core';
import { XeroService } from '../../services/xero';
import { XeroInvoiceDTO } from '../../models/xero.model';

@Component({
  selector: 'app-invoices',
  imports: [],
  templateUrl: './invoices.html',
  styleUrl: './invoices.css',
})
export class InvoicesComponent implements OnInit {
  invoices: XeroInvoiceDTO[] = [];
  loading = true;
  error = '';
  selectedStatus = '';
  statusOptions = ['DRAFT', 'SUBMITTED', 'AUTHORISED', 'PAID', 'VOIDED'];

  constructor(private xeroService: XeroService) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.loading = true;
    this.error = '';
    this.xeroService.getInvoices(this.selectedStatus).subscribe({
      next: (response) => {
        this.invoices = response.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load invoices';
        this.loading = false;
      }
    });
  }

  filterByStatus(): void {
    this.loadInvoices();
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'DRAFT': 'bg-secondary',
      'SUBMITTED': 'bg-info',
      'AUTHORISED': 'bg-warning',
      'PAID': 'bg-success',
      'VOIDED': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
  }
}
