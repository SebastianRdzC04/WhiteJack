import { Routes } from '@angular/router';
import { Authenticate } from './pages/authenticate/authenticate';
import { noAuthGuard } from './guards/no-auth-guard';
import { Game } from './pages/game/game';
import { isGameValidGuard } from './guards/game-valid-guard';
import { authGuard } from './guards/is-auth-guard';
import { Home } from './pages/home/home';

export const routes: Routes = [
    {
        path: 'auth',
        component: Authenticate,
        canActivate: [noAuthGuard] // Prevent authenticated users from accessing the auth page
    },
    {
        path: '',
        component: Home,
        canActivate: [authGuard] // Protect the index page for authenticated users
    },
    {
        path: 'game/:gameId',
        component: Game,
        canActivate: [authGuard, isGameValidGuard] // Protect the game page for authenticated users
    }
];
    