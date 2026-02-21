import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { Location } from '@angular/common';
import { TmdbService, Movie } from '../../core/services/tmdb.service';
import { AuthService } from '../../core/services/auth.service';
import { PurchaseService } from '../../core/services/purchase.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { FavoriteService } from '../../core/services/favorites.service';
import { NotificationService } from '../../core/services/notification.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './movie-details.component.html',
  styleUrls: ['./movie-details.component.css']
})
export class MovieDetailsComponent implements OnInit {
  // Dependencies using inject()
  private readonly route = inject(ActivatedRoute);
  private readonly tmdbService = inject(TmdbService);
  private readonly location = inject(Location);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly purchaseService = inject(PurchaseService);
  private readonly wishlistService = inject(WishlistService);
  private readonly favoriteService = inject(FavoriteService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);

  // State using Signals
  movie = signal<Movie | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  isPurchasing = signal(false);
  showTrailer = signal(false);
  trailerKey = signal<string | null>(null);

  // Computed state
  isInWishlist = computed(() => {
    const m = this.movie();
    return m ? this.wishlistService.isInWishlist(m.id) : false;
  });

  isInFavorites = computed(() => {
    const m = this.movie();
    return m ? this.favoriteService.isInFavorites(m.id) : false;
  });

  hasPurchased = computed(() => {
    const m = this.movie();
    return m ? this.purchaseService.hasPurchased(m.id) : false;
  });

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    const id = this.route.snapshot.paramMap.get('id')!;
    const type = this.route.snapshot.data['type'] || 'movie';

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const request$ = type === 'tv'
      ? this.tmdbService.getTvDetails(id)
      : this.tmdbService.getMovieDetails(id);

    request$.subscribe({
      next: (data) => {
        this.movie.set(data);
        if (data) {
          this.loadTrailer(data.id, type);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load details. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  getPosterUrl(path: string | null): string {
    return this.tmdbService.getPosterUrl(path);
  }

  goBack(): void {
    this.location.back();
  }

  purchaseMovie(): void {
    const m = this.movie();
    if (!m || !this.checkAuth('purchase movies')) return;

    this.isPurchasing.set(true);

    setTimeout(() => {
      const success = this.purchaseService.purchaseMovie(
        m.id,
        m.title || m.name || 'Unknown',
        m.poster_path,
        4.99,
        m.media_type || 'movie'
      );

      this.isPurchasing.set(false);

      if (success) {
        this.notificationService.show(
          `🎉 Purchase successful! You can now watch "${m.title || m.name}"`,
          'success'
        );
        this.showTrailer.set(true);
      }
    }, 1500);
  }

  toggleTrailer(): void {
    this.showTrailer.update(v => !v);
  }

  toggleWishlist(): void {
    const m = this.movie();
    if (!m || !this.checkAuth('add movies to your wishlist')) return;

    if (this.isInWishlist()) {
      this.wishlistService.removeFromWishlist(m.id);
    } else {
      this.wishlistService.addToWishlist(m.id, m.title || m.name || 'Unknown', m.poster_path);
    }
  }

  toggleFavorite(): void {
    const m = this.movie();
    if (!m || !this.checkAuth('add movies to your favorites')) return;

    if (this.isInFavorites()) {
      this.favoriteService.removeFromFavorites(m.id);
    } else {
      this.favoriteService.addToFavorites(m.id, m.title || m.name || 'Unknown', m.poster_path);
    }
  }

  getTrailerUrl(): SafeResourceUrl {
    const key = this.trailerKey();
    if (!key) {
      return this.sanitizer.bypassSecurityTrustResourceUrl('');
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${key}?autoplay=1&rel=0`
    );
  }

  private loadTrailer(movieId: number, type: 'movie' | 'tv'): void {
    this.tmdbService.getBestTrailer(movieId, type).subscribe({
      next: key => this.trailerKey.set(key),
      error: () => this.trailerKey.set(null),
    });
  }

  private checkAuth(action: string): boolean {
    if (!this.authService.isAuthenticated()) {
      this.notificationService.show(
        `Please sign in to ${action}.`,
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
