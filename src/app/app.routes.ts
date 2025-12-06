import { Routes } from ' @angular/router';
import { NoAuthGuard } from './guards/no-auth.guard';
import { authGuard } from './guards/auth.guard';
import { xeroGuard } from './guards/xero.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login').then(m => m.LoginComponent),
    canActivate: [NoAuthGuard]
  },
  {
    path: 'signup',
    loadComponent: () => import('./components/signup/signup').then(m => m.SignupComponent),
    canActivate: [NoAuthGuard]
  },
  {
    path: 'xero',
    loadComponent: () => import('./components/xero/xero').then(m => m.XeroComponent),
    canActivate: [authGuard]
  },
  {
    path: 'sync',
    loadComponent: () => import('./components/sync-console/sync-console').then(m => m.SyncConsoleComponent),
    canActivate: [authGuard, xeroGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [authGuard, xeroGuard]
  },
  {
    path: 'invoices',
    loadComponent: () => import('./components/invoices/invoices').then(m => m.InvoicesComponent),
    canActivate: [authGuard, xeroGuard]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];