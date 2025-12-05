import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NoAuthGuard } from './guards/no-auth.guard';
import { LoginComponent } from './components/login/login';
import { SignupComponent } from './components/signup/signup';
import { DashboardComponent } from './components/dashboard/dashboard';
import { AuthGuard } from './guards/auth-guard';
import { XeroComponent } from './components/xero/xero';
import { SyncConsoleComponent } from './components/sync-console/sync-console';
import { InvoicesComponent } from './components/invoices/invoices';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [NoAuthGuard]
  },
  {
    path: 'signup',
    component: SignupComponent,
    canActivate: [NoAuthGuard]
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'xero',
    component: XeroComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'sync',
    component: SyncConsoleComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'invoices',
    component: InvoicesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }