import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { GetGameResponse } from '../models/game.model';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { GamesServices } from '../services/game.service';

export const isGameValidGuard: CanActivateFn = (route, state) => {
  const gamesService = inject(GamesServices);
  const router = inject(Router);
  const gameId = localStorage.getItem('gameId');


  if(gameId){
    return gamesService.getGame(gameId).pipe(
      map((response: GetGameResponse) => {
        if (response.data.game) {
          return true; // Permite entrar
        } else {
          return router.createUrlTree(['']);
        }
      }),
      catchError(() => of(router.createUrlTree(['']))) // Si hay error, redirige a la raíz
    );
  }

  return router.createUrlTree(['']); // Si no hay gameId, redirige a la raíz

};