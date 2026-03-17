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
    loadComponent: () => import('./features/session/pages/session-list/session-list.component').then(m => m.SessionListComponent),
    canActivate: [authGuard]  // Requires authentication
  },
  {
    path: 'sessions/:id',
    loadComponent: () => import('./features/session/pages/session-detail/session-detail.component').then(m => m.SessionDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'battles',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'battles/:id',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/battle/pages/combat-prepare/combat-prepare.component').then(m => m.CombatPrepareComponent)
      },
      {
        path: 'initiative',
        loadComponent: () => import('./features/battle/pages/combat-initiative/combat-initiative.component').then(m => m.CombatInitiativeComponent)
      },
      {
        path: 'combat',
        loadComponent: () => import('./features/battle/pages/combat-active/combat-active.component').then(m => m.CombatActiveComponent)
      },
      {
        path: 'result',
        loadComponent: () => import('./features/battle/pages/combat-result/combat-result.component').then(m => m.CombatResultComponent)
      }
    ]
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
