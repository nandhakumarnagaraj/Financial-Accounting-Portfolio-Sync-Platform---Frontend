import { CanActivateFn, Router } from ' @angular/router';
import { inject } from ' @angular/core';
import { XeroService } from '../services/xero';
import { map, take } from 'rxjs/operators';

export const xeroGuard: CanActivateFn = (route, state) => {
  const xeroService = inject(XeroService);
  const router = inject(Router);

  // Check if Xero is connected
  return xeroService.syncStatus$.pipe(
    take(1),
    map(status => {
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