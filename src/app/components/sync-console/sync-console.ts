import { Component, OnInit } from '@angular/core';
import { XeroService } from '../../services/xero';
import { SyncAllResponse } from '../../models/xero.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sync-console',
  imports: [CommonModule,FormsModule],
  templateUrl: './sync-console.html',
  styleUrl: './sync-console.css',
})
export class SyncConsoleComponent implements OnInit {
  isSyncing = false;
  syncResults: any = null;
  error = '';
  success = '';
  syncInProgress = {
    invoices: false,
    accounts: false,
    transactions: false,
    all: false
  };

  constructor(private xeroService: XeroService) {}

  ngOnInit(): void {}

  syncInvoices(): void {
    this.syncInProgress.invoices = true;
    this.error = '';
    this.xeroService.syncInvoices().subscribe({
      next: (response) => {
        this.success = response.message;
        this.syncInProgress.invoices = false;
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to sync invoices';
        this.syncInProgress.invoices = false;
      }
    });
  }

  syncAccounts(): void {
    this.syncInProgress.accounts = true;
    this.error = '';
    this.xeroService.syncAccounts().subscribe({
      next: (response) => {
        this.success = response.message;
        this.syncInProgress.accounts = false;
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to sync accounts';
        this.syncInProgress.accounts = false;
      }
    });
  }

  syncTransactions(): void {
    this.syncInProgress.transactions = true;
    this.error = '';
    this.xeroService.syncTransactions().subscribe({
      next: (response) => {
        this.success = response.message;
        this.syncInProgress.transactions = false;
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to sync transactions';
        this.syncInProgress.transactions = false;
      }
    });
  }

  syncAll(): void {
    this.syncInProgress.all = true;
    this.error = '';
    this.syncResults = null;
    this.xeroService.syncAll().subscribe({
      next: (response: SyncAllResponse) => {
        this.syncResults = response;
        this.success = response.message;
        this.syncInProgress.all = false;
        setTimeout(() => this.success = '', 5000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to sync all data';
        this.syncInProgress.all = false;
      }
    });
  }
}

