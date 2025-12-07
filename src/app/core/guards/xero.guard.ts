import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { map, take } from 'rxjs/operators';
import { SyncStatusResponse } from '../models/xero.model'; // Import SyncStatusResponse
import { XeroService } from '../services/xero.service';

export const xeroGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const xeroService = inject(XeroService);
  const router = inject(Router);

  // Check if Xero is connected
  return xeroService.syncStatus$.pipe(
    take(1),
    map((status: SyncStatusResponse | null) => { // Explicitly type status
      if (status?.connected) {
        return true;
      }
      
      // Redirect to Xero connection page
      console.warn('[XeroGuard] Xero not connected, redirecting...');
      return router.createUrlTree(['/xero'], { 
        queryParams: { returnUrl: state.url } 
      });
    })
  );
};
