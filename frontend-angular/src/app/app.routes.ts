import {Routes} from '@angular/router';
import {Login} from './features/auth/login/login';
import {Register} from './features/auth/register/register';
import {authGuard, guestGuard} from './core/guards/authentication-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: Login,
    canActivate: [guestGuard]  // Prevent logged-in users from accessing
  },
  {
    path: 'register',
    component: Register,
    canActivate: [guestGuard]
  },
  {
    path: 'home',
    loadComponent: () => import('./features/battle/pages/battle-list/battle-list.component').then(m => m.BattleListComponent),
    canActivate: [authGuard]  // Requires authentication
  },
  {
    path: 'battles',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'battles/:id',
    loadComponent: () => import('./features/battle/pages/battle-detail/battle-detail.component').then(m => m.BattleDetailComponent),
    canActivate: [authGuard]  // Requires authentication
  },
  {
    path: 'players',
    loadComponent: () => import('./features/player/pages/player-list/player-list.component').then(m => m.PlayerListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'beastery',
    loadComponent: () => import('./features/beastery/pages/beastery-list/beastery-list.component').then(m => m.BeasteryListComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];
