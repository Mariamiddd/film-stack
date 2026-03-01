import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
	{ path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent), pathMatch: 'full' },
	{ path: 'movies', loadComponent: () => import('./features/movies/movies.component').then(m => m.MoviesComponent) },
	{ path: 'tv-shows', loadComponent: () => import('./features/tv-shows/tv-shows.component').then(m => m.TvShowsComponent) },
	{ path: 'movie/:id', loadComponent: () => import('./features/movie-details/movie-details.component').then(m => m.MovieDetailsComponent), data: { type: 'movie' } },
	{ path: 'tv/:id', loadComponent: () => import('./features/movie-details/movie-details.component').then(m => m.MovieDetailsComponent), data: { type: 'tv' } },
	{ path: 'auth/sign-in', canActivate: [guestGuard], loadComponent: () => import('./features/auth/sign-in.component').then(m => m.SignInComponent) },
	{ path: 'auth/sign-up', canActivate: [guestGuard], loadComponent: () => import('./features/auth/sign-up.component').then(m => m.SignUpComponent) },
	{ path: 'auth/recovery', canActivate: [guestGuard], loadComponent: () => import('./features/auth/recovery.component').then(m => m.RecoveryComponent) },
	{ path: 'auth/profile', canActivate: [authGuard], loadComponent: () => import('./features/auth/profile.component').then(m => m.ProfileComponent) },
	{ path: 'admin', canActivate: [adminGuard], loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent) },
	{ path: '**', redirectTo: '/' },
];
