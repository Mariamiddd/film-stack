import { Component, input, inject, computed } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { TmdbService, Movie } from '../../../core/services/tmdb.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { FavoriteService } from '../../../core/services/favorites.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.css'],
  host: { 'style': 'display: block;' }
})
export class MovieCardComponent {
  movie = input.required<Movie>();
  type = input<'movie' | 'tv'>('movie');

  private readonly tmdbService = inject(TmdbService);
  private readonly wishlistService = inject(WishlistService);
  private readonly favoriteService = inject(FavoriteService);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  isInWishlist = computed(() => this.wishlistService.isInWishlist(this.movie().id));
  isInFavorites = computed(() => this.favoriteService.isInFavorites(this.movie().id));

  getPosterUrl(path: string | null): string {
    return this.tmdbService.getPosterUrl(path);
  }

  getYear(date?: string): string {
    return this.tmdbService.getYear(date);
  }

  getLanguageName(code?: string): string {
    return this.tmdbService.getLanguageName(code);
  }

  getContentLink(): string[] {
    return [this.type() === 'movie' ? '/movie' : '/tv', this.movie().id.toString()];
  }

  onMouseEnter(): void {
    const movie = this.movie();
    let color = '';

    // Prioritize specific 'Movieland' genre colors
    if (movie.genre_ids && movie.genre_ids.length > 0) {
      const primaryGenre = movie.genre_ids[0].toString();
      const genreColor = this.themeService.getGenreColor(primaryGenre);
      // We check if it returned a specific genre color or the default
      if (genreColor !== '#43aa8b') {
        color = genreColor;
      }
    }

    // Fallback to generated color if not a branded genre
    if (!color) {
      color = this.generateColor(movie.title || movie.name || '');
    }

    // this.themeService.setActiveColor(color); // Removed to prevent dynamic background color changes
  }

  private generateColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash % 360);
    return `hsl(${h}, 60%, 50%)`;
  }

  toggleWishlist(event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    if (!this.checkAuth()) return;

    if (this.isInWishlist()) {
      this.wishlistService.removeFromWishlist(this.movie().id);
    } else {
      this.wishlistService.addToWishlist(
        this.movie().id,
        this.movie().title || this.movie().name || 'Unknown',
        this.movie().poster_path,
        this.movie().vote_average
      );
    }
  }

  toggleFavorite(event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    if (!this.checkAuth()) return;

    if (this.isInFavorites()) {
      this.favoriteService.removeFromFavorites(this.movie().id);
    } else {
      this.favoriteService.addToFavorites(
        this.movie().id,
        this.movie().title || this.movie().name || 'Unknown',
        this.movie().poster_path,
        this.movie().vote_average
      );
    }
  }

  private checkAuth(): boolean {
    if (!this.authService.isAuthenticated()) {
      this.notificationService.show(
        'Please sign in to add movies to your lists.',
        'info',
        {
          label: 'Sign In',
          callback: () => this.router.navigate(['/auth/sign-in']),
        }
      );
      return false;
    }
    return true;
  }
}
