import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { SignupComponent } from './features/auth/signup/signup.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { XeroConnectionComponent } from './features/xero-connection/xero-connection.component';
import { SyncDataComponent } from './features/sync-data/sync-data.component';
import { LandingComponent } from './features/auth/landing/landing.component';
import { AuthGuard } from './core/guards/auth-guard';

const routes: Routes = [
  { path: '', component: LandingComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'xero-connection',
    component: XeroConnectionComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'sync-data',
    component: SyncDataComponent,
    canActivate: [AuthGuard],
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
