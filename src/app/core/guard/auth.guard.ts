import { inject } from '@angular/core';
import { AuthService } from './../services/auth/auth.service';
import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  if (!authService.isLoggedIn()) {
    authService.logout();
    return false;
  }
  return true;
};
