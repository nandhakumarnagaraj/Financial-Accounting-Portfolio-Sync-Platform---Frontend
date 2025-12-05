import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth';


@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const requiredRoles = route.data['roles'] as Array<string>;

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const user = (this.authService as any).currentUserSubject.value;

    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }

    const hasRole = requiredRoles.some(role => user.roles.includes(role));

    if (hasRole) {
      return true;
    }

    this.router.navigate(['/unauthorized']);
    return false;
  }
}