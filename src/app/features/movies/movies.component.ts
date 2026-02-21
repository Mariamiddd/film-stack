import { Component, inject, computed, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TmdbService, Movie, Genre, FilterOptions } from '../../core/services/tmdb.service';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card.component';

@Component({
  selector: 'app-movies',
  standalone: true,
  imports: [CommonModule, MovieCardComponent],
  template: `
    <div class="home-container">
      <div class="hero-section">
        <h1>Popular Movies</h1>
        <div class="filter-controls">
          <div class="filter-row">
            <select class="filter-select" [value]="filters().genreId" (change)="updateFilter('genreId', $any($event.target).value)">
              <option value="">All Genres</option>
              @for (genre of genres(); track genre.id) {
                <option [value]="genre.id.toString()">{{ genre.name }}</option>
              }
            </select>

            <select class="filter-select" [value]="filters().year" (change)="updateFilter('year', $any($event.target).value)">
              <option value="">All Years</option>
              @for (year of years; track year) {
                <option [value]="year">{{ year }}</option>
              }
            </select>

            <select class="filter-select" [value]="filters().minRating" (change)="updateFilter('minRating', $any($event.target).value)">
              <option value="">All Ratings</option>
              <option value="9">9+ Stars</option>
              <option value="8">8+ Stars</option>
              <option value="7">7+ Stars</option>
              <option value="6">6+ Stars</option>
            </select>
            
            <select class="filter-select" [value]="filters().language" (change)="updateFilter('language', $any($event.target).value)">
              <option value="">All Languages</option>
              @for (lang of languages; track lang.code) {
                <option [value]="lang.code">{{ lang.name }}</option>
              }
            </select>

            <select class="filter-select" [value]="filters().sortBy" (change)="updateFilter('sortBy', $any($event.target).value)">
              <option value="popularity.desc">Most Popular</option>
              <option value="vote_average.desc">Top Rated</option>
              <option value="primary_release_date.desc">Newest</option>
              <option value="revenue.desc">Highest Grossing</option>
            </select>
          </div>
        </div>
      </div>

      @if (isLoading()) {
        <div class="loading">Loading movies...</div>
      }

      @if (errorMessage()) {
        <div class="error">{{ errorMessage() }}</div>
      }

      <div class="movies-grid">
        @for (movie of movies(); track movie.id) {
          <app-movie-card [movie]="movie" type="movie"></app-movie-card>
        }
      </div>
    </div>
  `,
  styleUrls: ['../home/home.component.css']
})
export class MoviesComponent implements OnInit {
  // Dependencies using inject()
  private tmdbService = inject(TmdbService);

  // State using Signals
  movies = signal<Movie[]>([]);
  genres = signal<Genre[]>([]);
  filters = signal<FilterOptions>({
    genreId: '',
    year: '',
    sortBy: 'popularity.desc',
    minRating: '',
    language: ''
  });

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  // Static data
  years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);
  languages = [
    { code: 'en', name: 'English' },
    { code: 'ko', name: 'Korean' },
    { code: 'ja', name: 'Japanese' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' }
  ];

  constructor() {
    // React to filter changes
    effect(() => {
      this.loadMovies(this.filters());
    });
  }

  ngOnInit() {
    this.loadGenres();
  }

  private loadGenres() {
    this.tmdbService.getGenres('movie').subscribe({
      next: (data) => this.genres.set(data)
    });
  }

  private loadMovies(options: FilterOptions) {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.tmdbService.getMovies(options).subscribe({
      next: (data) => {
        // Signal Update using .set()
        this.movies.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load movies. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  updateFilter(key: keyof FilterOptions, value: string) {
    this.filters.update(f => ({ ...f, [key]: value }));
  }
}
