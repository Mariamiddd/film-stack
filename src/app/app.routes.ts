import { Routes } from '@angular/router';

export const routes: Routes = [
	{ path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
	{ path: 'movies', loadComponent: () => import('./features/movies/movies.component').then(m => m.MoviesComponent) },
	{ path: 'tv-shows', loadComponent: () => import('./features/tv-shows/tv-shows.component').then(m => m.TvShowsComponent) },
	{ path: 'movie/:id', loadComponent: () => import('./features/movie-details/movie-details.component').then(m => m.MovieDetailsComponent), data: { type: 'movie' } },
	{ path: 'tv/:id', loadComponent: () => import('./features/movie-details/movie-details.component').then(m => m.MovieDetailsComponent), data: { type: 'tv' } },
	{ path: 'auth/sign-in', loadComponent: () => import('./features/auth/sign-in.component').then(m => m.SignInComponent) },
	{ path: 'auth/sign-up', loadComponent: () => import('./features/auth/sign-up.component').then(m => m.SignUpComponent) },
	{ path: 'auth/recovery', loadComponent: () => import('./features/auth/recovery.component').then(m => m.RecoveryComponent) },
	{ path: 'auth/profile', loadComponent: () => import('./features/auth/profile.component').then(m => m.ProfileComponent) },
	{ path: '**', redirectTo: '' },
];
