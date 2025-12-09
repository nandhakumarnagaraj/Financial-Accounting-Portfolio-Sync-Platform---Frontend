import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XeroService } from '../../core/services/xero.service';
import { ToastrService } from 'ngx-toastr';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-sync-data',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './sync-data.component.html',
  styleUrls: ['./sync-data.component.scss']
})
export class SyncDataComponent implements OnInit {
  isSyncing = {
    invoices: false,
    accounts: false,
    transactions: false
  };
  isSyncingAll = false;
  lastSync = {
    invoices: null,
    accounts: null,
    transactions: null
  };

  constructor(private xeroService: XeroService, private toastr: ToastrService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const storedSyncData = this.xeroService.getSyncDataTimestamps();
    if (storedSyncData) {
      this.lastSync = storedSyncData;
    }
  }

  syncInvoices() {
    this.isSyncing.invoices = true;
    this.xeroService.syncInvoices().subscribe({
      next: (res) => {
        this.toastr.success(res.message, 'Success');
        this.lastSync.invoices = new Date().toISOString(); // Store as ISO string
        this.xeroService.saveSyncDataTimestamps(this.lastSync);
        this.isSyncing.invoices = false;
        this.cdr.detectChanges(); // Manually trigger change detection
      },
      error: (err) => {
        this.toastr.error(err.error.message || 'Failed to sync invoices', 'Error');
        this.isSyncing.invoices = false;
        this.cdr.detectChanges(); // Manually trigger change detection
      }
    });
  }

  syncAccounts() {
    this.isSyncing.accounts = true;
    this.xeroService.syncAccounts().subscribe({
        next: (res) => {
            this.toastr.success(res.message, 'Success');
            this.lastSync.accounts = new Date().toISOString(); // Store as ISO string
            this.xeroService.saveSyncDataTimestamps(this.lastSync);
            this.isSyncing.accounts = false;
            this.cdr.detectChanges(); // Manually trigger change detection
        },
        error: (err) => {
            this.toastr.error(err.error.message || 'Failed to sync accounts', 'Error');
            this.isSyncing.accounts = false;
            this.cdr.detectChanges(); // Manually trigger change detection
        }
    });
  }

  syncTransactions() {
    this.isSyncing.transactions = true;
    this.xeroService.syncTransactions().subscribe({
        next: (res) => {
            this.toastr.success(res.message, 'Success');
            this.lastSync.transactions = new Date().toISOString(); // Store as ISO string
            this.xeroService.saveSyncDataTimestamps(this.lastSync);
            this.isSyncing.transactions = false;
            this.cdr.detectChanges(); // Manually trigger change detection
        },
        error: (err) => {
            this.toastr.error(err.error.message || 'Failed to sync transactions', 'Error');
            this.isSyncing.transactions = false;
            this.cdr.detectChanges(); // Manually trigger change detection
        }
    });
  }

  syncAll() {
    this.isSyncingAll = true;
    forkJoin({
      invoices: this.xeroService.syncInvoices(),
      accounts: this.xeroService.syncAccounts(),
      transactions: this.xeroService.syncTransactions()
    }).subscribe({
      next: (res) => {
        this.toastr.success('All data synced successfully', 'Success');
        this.lastSync.invoices = new Date().toISOString(); // Store as ISO string
        this.lastSync.accounts = new Date().toISOString(); // Store as ISO string
        this.lastSync.transactions = new Date().toISOString(); // Store as ISO string
        this.xeroService.saveSyncDataTimestamps(this.lastSync);
        this.isSyncingAll = false;
        this.cdr.detectChanges(); // Manually trigger change detection
      },
      error: (err) => {
        this.toastr.error(err.error.message || 'Failed to sync all data', 'Error');
        this.isSyncingAll = false;
        this.cdr.detectChanges(); // Manually trigger change detection
      }
    });
  }
}
