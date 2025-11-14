import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {Authentication} from '../service/authentication';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Authentication);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;  // Allow navigation
  }

  // Redirect to login, preserving the attempted URL
  router.navigate(['/login'], {
    queryParams: {returnUrl: state.url}
  });
  return false;  // Block navigation
};

/**
 * Guest guard that prevents authenticated users from accessing login/register pages
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(Authentication);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return true;  // Allow navigation
  }

  // Already logged in, redirect to home
  router.navigate(['/']);
  return false;  // Block navigation
};
