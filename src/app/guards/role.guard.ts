import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { map, take } from 'rxjs/operators';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredRoles = route.data['roles'] as Array<string>;

  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      if (user && user.roles && requiredRoles.some(role => user.roles.includes(role))) {
        return true;
      } else {
        router.navigate(['/unauthorized']); // Or /login, depending on flow
        return false;
      }
    })
  );
};