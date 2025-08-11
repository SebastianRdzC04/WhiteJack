import { CanActivateFn } from '@angular/router';
import { AuthServices } from '../services/auth.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { tap, map } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthServices);
  const router = inject(Router);

  return authService.isAuthenticated().pipe(
    tap(isAuth => {
      if (!isAuth) {
        router.navigate(['/auth']);
      }
    }),
    map(isAuth => isAuth)
  );
};