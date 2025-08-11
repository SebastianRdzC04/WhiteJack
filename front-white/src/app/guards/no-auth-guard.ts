import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { tap, map } from 'rxjs/operators';
import { AuthServices } from '../services/auth.service';


export const noAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthServices);
  const router = inject(Router);

  return authService.isAuthenticated().pipe(
    tap(isAuth => {
      if (isAuth) {
        router.navigate(['/']);
      }
    }),
    map(isAuth => !isAuth) // Solo permite acceso si NO está autenticado
  );
};