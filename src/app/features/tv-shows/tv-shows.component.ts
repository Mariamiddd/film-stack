import { Component, inject, computed, signal, OnInit, effect } from '@angular/core';
import { TmdbService, Movie, Genre, FilterOptions } from '../../core/services/tmdb.service';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card.component';
import { Title, Meta } from '@angular/platform-browser';
import { forkJoin, map } from 'rxjs';

@Component({
  selector: 'app-tv-shows',
  standalone: true,
  imports: [MovieCardComponent],
  templateUrl: './tv-shows.component.html',
  styleUrl: './tv-shows.component.css'
})
export class TvShowsComponent implements OnInit {
  // Dependencies using inject()
  private tmdbService = inject(TmdbService);
  private titleService = inject(Title);
  private metaService = inject(Meta);

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
  isLoadingMore = signal(false);
  errorMessage = signal<string | null>(null);
  currentPage = signal(1);

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
      this.currentPage.set(1);
      this.loadTvShows(this.filters(), 1, false);
    });
  }

  ngOnInit() {
    this.titleService.setTitle('Episodic Masterpieces | Movieland');
    this.metaService.updateTag({ name: 'description', content: 'Explore the best TV shows from around the globe. Filter by genre, year, and rating.' });
    this.loadGenres();
  }

  private loadGenres() {
    this.tmdbService.getGenres('tv').subscribe({
      next: (data) => this.genres.set(data)
    });
  }

  private loadTvShows(options: FilterOptions, startPage: number = 1, append: boolean = false) {
    if (append) {
      this.isLoadingMore.set(true);
    } else {
      this.isLoading.set(true);
    }
    this.errorMessage.set(null);

    // Fetch 3 pages to get 60 items (Multiple of 6 columns)
    const requests = [
      this.tmdbService.getTvShows(options, startPage),
      this.tmdbService.getTvShows(options, startPage + 1),
      this.tmdbService.getTvShows(options, startPage + 2)
    ];

    forkJoin(requests).pipe(
      map(results => results.flat())
    ).subscribe({
      next: (data) => {
        if (append) {
          this.movies.update(prev => [...prev, ...data]);
        } else {
          this.movies.set(data);
        }
        this.isLoading.set(false);
        this.isLoadingMore.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load TV shows. Please try again.');
        this.isLoading.set(false);
        this.isLoadingMore.set(false);
      }
    });
  }

  loadMore() {
    // Increment by 3 pages (60 items)
    this.currentPage.update(p => p + 3);
    this.loadTvShows(this.filters(), this.currentPage(), true);
  }

  updateFilter(key: keyof FilterOptions, value: string) {
    this.filters.update(f => ({ ...f, [key]: value }));
  }
}
