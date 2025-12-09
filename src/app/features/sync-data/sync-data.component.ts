import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XeroService } from '../../core/services/xero.service';
import { ToastrService } from 'ngx-toastr';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
  styleUrls: ['./sync-data.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SyncDataComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  isSyncing = {
    invoices: false,
    accounts: false,
    transactions: false
  };
  isSyncingAll = false;
  lastSync: { invoices: string | null; accounts: string | null; transactions: string | null } = {
    invoices: null,
    accounts: null,
    transactions: null
  };

  constructor(
    private xeroService: XeroService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.xeroService.syncTimestamps$.pipe(takeUntil(this.destroy$)).subscribe(timestamps => {
      this.lastSync = timestamps;
      this.cdr.detectChanges(); // Manually trigger change detection
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  syncInvoices() {
    this.isSyncing.invoices = true;
    this.xeroService.syncInvoices().subscribe({
      next: (res) => {
        this.toastr.success(res.message, 'Success');
        // Reload timestamps from localStorage (updated by service)
        this.isSyncing.invoices = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toastr.error(err.error.message || 'Failed to sync invoices', 'Error');
        this.isSyncing.invoices = false;
        this.cdr.detectChanges();
      }
    });
  }

  syncAccounts() {
    this.isSyncing.accounts = true;
    this.xeroService.syncAccounts().subscribe({
      next: (res) => {
        this.toastr.success(res.message, 'Success');
        // Reload timestamps from localStorage (updated by service)
        this.isSyncing.accounts = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toastr.error(err.error.message || 'Failed to sync accounts', 'Error');
        this.isSyncing.accounts = false;
        this.cdr.detectChanges();
      }
    });
  }

  syncTransactions() {
    this.isSyncing.transactions = true;
    this.xeroService.syncTransactions().subscribe({
      next: (res) => {
        this.toastr.success(res.message, 'Success');
        // Reload timestamps from localStorage (updated by service)
        this.isSyncing.transactions = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toastr.error(err.error.message || 'Failed to sync transactions', 'Error');
        this.isSyncing.transactions = false;
        this.cdr.detectChanges();
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
        // Reload timestamps from localStorage (updated by service)
        this.isSyncingAll = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toastr.error(err.error.message || 'Failed to sync all data', 'Error');
        this.isSyncingAll = false;
        this.cdr.detectChanges();
      }
    });
  }
}