import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, timeout, map } from 'rxjs';

// ─── Interfaces ──────────────────────────────────────────

export interface Movie {
  id: number;
  title?: string;
  name?: string;
  media_type?: 'movie' | 'tv';
  poster_path: string | null;
  backdrop_path?: string | null;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  popularity?: number;
  original_language?: string;
  runtime?: number;
  genres?: Genre[];
  genre_ids?: number[];
  tagline?: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface FilterOptions {
  genreId?: string;
  year?: string;
  sortBy?: string;
  minRating?: string;
  language?: string;
  minVoteCount?: string;
}

export interface VideoResult {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface CreditsResponse {
  id: number;
  cast: Cast[];
}

interface TmdbResponse {
  results: Movie[];
}

interface GenreResponse {
  genres: Genre[];
}

interface VideoResponse {
  results: VideoResult[];
}

// ─── Language Map ────────────────────────────────────────

const LANGUAGE_NAMES: Readonly<Record<string, string>> = {
  en: 'English',
  ko: 'Korean',
  ja: 'Japanese',
  fr: 'French',
  es: 'Spanish',
  zh: 'Chinese',
  hi: 'Hindi',
  de: 'German',
};

const NO_IMAGE_PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="500" height="750"%3E%3Crect fill="%23333" width="100%25" height="100%25"/%3E%3Ctext fill="%23999" text-anchor="middle" x="250" y="375" font-size="24" dy=".3em"%3ENo Image Available%3C/text%3E%3C/svg%3E';

// ─── Service ─────────────────────────────────────────────

// TODO: Move API key to environment variables before deployment
const API_KEY = '37dfd88329e76b292770638930a39710';
const BASE_URL = 'https://api.themoviedb.org/3';
const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const REQUEST_TIMEOUT = 10_000;

@Injectable({ providedIn: 'root' })
export class TmdbService {
  private readonly http = inject(HttpClient);

  // ── HTTP helpers ──

  private buildUrl(path: string, params: Record<string, string> = {}): string {
    const allParams = { api_key: API_KEY, language: 'en-US', ...params };
    const query = new URLSearchParams(allParams).toString();
    const fullUrl = `${BASE_URL}${path}?${query}`;

    // Return the TMDB URL directly without the proxy wrapper
    return fullUrl;
  }

  private fetch<T>(path: string, params: Record<string, string> = {}): Observable<T> {
    const url = this.buildUrl(path, params);
    return this.http.get(url, { responseType: 'text' }).pipe(
      timeout(REQUEST_TIMEOUT),
      map(res => JSON.parse(res) as T),
      catchError(err => {
        console.error(`[TmdbService] Fetch error for ${path}:`, err);
        return throwError(() => err);
      })
    );
  }

  // ── Data endpoints ──

  getTrending(page: number = 1): Observable<Movie[]> {
    return this.fetch<TmdbResponse>('/trending/all/week', { page: page.toString() }).pipe(
      map(res => res.results ?? [])
    );
  }

  getGenres(type: 'movie' | 'tv'): Observable<Genre[]> {
    return this.fetch<GenreResponse>(`/genre/${type}/list`).pipe(
      map(res => res.genres ?? [])
    );
  }

  getMovies(options: FilterOptions, page: number = 1): Observable<Movie[]> {
    const params = this.buildDiscoverParams(options);
    params['page'] = page.toString();
    if (options.year) params['primary_release_year'] = options.year;

    return this.fetch<TmdbResponse>('/discover/movie', params).pipe(
      map(res => res.results ?? [])
    );
  }

  getTvShows(options: FilterOptions, page: number = 1): Observable<Movie[]> {
    const params = this.buildDiscoverParams(options);
    params['page'] = page.toString();
    if (options.year) params['first_air_date_year'] = options.year;

    return this.fetch<TmdbResponse>('/discover/tv', params).pipe(
      map(res => res.results ?? [])
    );
  }

  searchMovies(query: string, page: number = 1): Observable<Movie[]> {
    return this.fetch<TmdbResponse>('/search/movie', { query, page: page.toString() }).pipe(
      map(res => (res.results ?? []).sort((a, b) => (b.popularity || 0) - (a.popularity || 0)))
    );
  }

  multiSearch(query: string, page: number = 1): Observable<Movie[]> {
    return this.fetch<TmdbResponse>('/search/multi', { query, page: page.toString() }).pipe(
      map(res => {
        const results = res.results ?? [];
        // Sort by popularity and filter out items without posters or those that are not movie/tv
        // We also filter out extremely obscure results (low vote count + low popularity)
        return results
          .filter(item =>
            (item.media_type === 'movie' || item.media_type === 'tv') &&
            !!item.poster_path &&
            (item.vote_average > 0 || (item.popularity ?? 0) > 10)
          )
          .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      })
    );
  }

  getMovieDetails(id: string): Observable<Movie> {
    return this.fetch<Movie>(`/movie/${id}`);
  }

  getTvDetails(id: string): Observable<Movie> {
    return this.fetch<Movie>(`/tv/${id}`);
  }

  getCredits(id: number, type: 'movie' | 'tv' = 'movie'): Observable<Cast[]> {
    return this.fetch<CreditsResponse>(`/${type}/${id}/credits`).pipe(
      map(res => res.cast ?? [])
    );
  }

  getMovieVideos(id: number, type: 'movie' | 'tv' = 'movie'): Observable<VideoResult[]> {
    return this.fetch<VideoResponse>(`/${type}/${id}/videos`).pipe(
      map(res => res.results ?? [])
    );
  }

  getBestTrailer(id: number, type: 'movie' | 'tv' = 'movie'): Observable<string | null> {
    return this.getMovieVideos(id, type).pipe(
      map(videos => {
        const trailers = videos.filter(
          v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
        );
        const trailer = trailers.find(v => v.official) ?? trailers[0];
        return trailer?.key ?? null;
      })
    );
  }

  // ── Utility methods ──

  getPosterUrl(posterPath: string | null): string {
    return posterPath ? `${POSTER_BASE_URL}${posterPath}` : NO_IMAGE_PLACEHOLDER;
  }

  getYear(date?: string): string {
    return date ? new Date(date).getFullYear().toString() : 'N/A';
  }

  getLanguageName(code?: string): string {
    return LANGUAGE_NAMES[code ?? ''] ?? code?.toUpperCase() ?? 'Unknown';
  }

  // ── Private helpers ──

  private buildDiscoverParams(options: FilterOptions): Record<string, string> {
    const params: Record<string, string> = {
      sort_by: options.sortBy || 'popularity.desc',
      'vote_count.gte': options.minVoteCount || '100', // Default or custom threshold
      'include_adult': 'false',
      page: '1',
    };
    if (options.genreId) params['with_genres'] = options.genreId;
    if (options.minRating) params['vote_average.gte'] = options.minRating;
    if (options.language) params['with_original_language'] = options.language;
    return params;
  }
}