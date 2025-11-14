import {Routes} from '@angular/router';
import {Login} from './login/login';
import {Register} from './register/register';
import {authGuard, guestGuard} from './guard/authentication-guard';

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
    loadComponent: () => import('./home/home').then(m => m.HomeComponent),
    canActivate: [authGuard]  // Requires authentication
  },
  // Add more protected routes here
  {
    path: '**',
    redirectTo: '/home'  // Fallback route
  }
];
