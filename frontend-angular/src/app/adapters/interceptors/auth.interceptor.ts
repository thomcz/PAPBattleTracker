import {HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {catchError, throwError} from 'rxjs';
import {LogoutUseCase} from '../../core/domain/use-cases/logout.use-case';
import {LoginUseCase} from '../../core/domain/use-cases/login.use-case';
import {NavigationPort} from '../../core/ports/navigation.port';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const logoutUseCase = inject(LogoutUseCase);
  const loginUseCase = inject(LoginUseCase);
  const router = inject(NavigationPort);
  const token = loginUseCase.getToken();

  // Clone request and add Authorization header if token exists
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Handle 401 Unauthorized responses
  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        // Token expired or invalid - logout and redirect to login
        logoutUseCase.execute();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
