import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {LoginUseCase} from '../domain/use-cases/login.use-case';
import {NavigationPort} from '../ports/navigation.port';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(LoginUseCase);
  const router = inject(NavigationPort);

  if (authService.isAuthenticated()) {
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
  const authService = inject(LoginUseCase);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;  // Allow navigation
  }

  // Already logged in, redirect to home
  router.navigate(['/']);
  return false;  // Block navigation
};
