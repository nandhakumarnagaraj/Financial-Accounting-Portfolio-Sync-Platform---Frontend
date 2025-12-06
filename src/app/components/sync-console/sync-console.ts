import { Component, OnInit } from ' @angular/core';
import { CommonModule } from ' @angular/common';
import { RouterLink } from ' @angular/router';
import { XeroService } from '../../services/xero';
import { SyncAllResponse } from '../../models/xero.model';
import { finalize } from 'rxjs/operators';
import { ChangeDetectorRef } from ' @angular/core';

 @Component({
  selector: 'app-sync-console',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sync-console.html',
  styleUrl: './sync-console.css',
})
export class SyncConsoleComponent implements OnInit {
  isSyncing = false;
  syncResults: any = null;
  error = '';
  success = '';
  allSynced = false; // Track if all data is synced
  syncInProgress = {
    invoices: false,
    accounts: false,
    transactions: false,
    all: false
  };

  constructor(private xeroService: XeroService, private cd: ChangeDetectorRef) { }

  ngOnInit(): void { }

  syncInvoices(): void {
    this.syncInProgress.invoices = true;
    this.error = '';
    this.allSynced = false;
    
    this.xeroService.syncInvoices()
      .pipe(finalize(() => {
        this.syncInProgress.invoices = false;
        this.cd.detectChanges();
      }))
      .subscribe({
        next: (response) => {
          this.success = response.message;
          setTimeout(() => {
            this.success = '';
            this.cd.detectChanges();
          }, 3000);
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to sync invoices';
        }
      });
  }

  syncAccounts(): void {
    this.syncInProgress.accounts = true;
    this.error = '';
    this.allSynced = false;
    
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
    this.allSynced = false;
    
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
    this.allSynced = false;
    
    this.xeroService.syncAll()
      .pipe(finalize(() => {
        this.syncInProgress.all = false;
        this.cd.detectChanges();
      }))
      .subscribe({
        next: (response: SyncAllResponse) => {
          this.syncResults = response;
          this.success = response.message;
          
          // Check if all syncs were successful
          const allSuccess = response.results && 
            response.results.invoices?.status === 'SUCCESS' &&
            response.results.accounts?.status === 'SUCCESS' &&
            response.results.transactions?.status === 'SUCCESS';
          
          if (allSuccess) {
            this.allSynced = true;
          }
          
          setTimeout(() => {
            this.success = '';
            this.cd.detectChanges();
          }, 5000);
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to sync all data';
        }
      });
  }
}