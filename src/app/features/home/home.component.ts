import { Component, inject, signal, computed, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TmdbService, Movie } from '../../core/services/tmdb.service';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card.component';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, MovieCardComponent, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  // Dependencies using inject()
  private tmdbService = inject(TmdbService);
  readonly authService = inject(AuthService);

  // State using Signals
  searchQuery = signal('');
  movies = signal<Movie[]>([]);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  // Computed state for structured layout
  featuredMovie = computed(() => this.movies().length > 0 ? this.movies()[0] : null);
  recommendedMovies = computed(() => this.movies().slice(1));

  constructor() {
    // Implement debounce for search query
    toObservable(this.searchQuery)
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(query => {
        this.loadData(query);
      });
  }

  ngOnInit() {
    // Initial load: trending movies
    this.loadData('');
  }

  private loadData(query: string) {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const request$ = query.trim()
      ? this.tmdbService.searchMovies(query)
      : this.tmdbService.getTrending();

    request$.subscribe({
      next: (data) => {
        // Signal Update using .set()
        this.movies.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load content. Please check your connection.');
        this.isLoading.set(false);
      }
    });
  }

  onSearchChange(query: string) {
    this.searchQuery.set(query);
  }

  loadTrendingMovies() {
    this.searchQuery.set('');
  }
}
