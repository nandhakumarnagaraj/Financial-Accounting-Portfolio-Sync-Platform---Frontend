import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth-guard';
import { NoAuthGuard } from './core/guards/no-auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/auth/landing/landing.component').then(m => m.LandingComponent),
    canActivate: [NoAuthGuard]
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/landing/landing.component').then(m => m.LandingComponent),
    canActivate: [NoAuthGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'xero-connection',
    loadComponent: () => import('./features/xero-connection/xero-connection.component').then(m => m.XeroConnectionComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'sync-data',
    loadComponent: () => import('./features/sync-data/sync-data.component').then(m => m.SyncDataComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'invoices',
    loadComponent: () => import('./features/invoices/invoices.component').then(m => m.InvoicesComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'transactions',
    loadComponent: () => import('./features/transactions/transactions.component').then(m => m.TransactionsComponent),
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '' }
];