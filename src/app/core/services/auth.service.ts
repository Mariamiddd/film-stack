import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError, switchMap, map } from 'rxjs/operators';
import { FavoriteService } from './favorites.service';
import { WishlistService } from './wishlist.service';
import { PurchaseService } from './purchase.service';

// ─── Interfaces ──────────────────────────────────────────

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  address?: string;
  phone?: string;
  zipcode?: string;
  avatar?: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
}

export interface SignUpRequest {
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  password: string;
  address?: string;
  phone?: string;
  zipcode?: string;
  avatar?: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  user?: User;
}

interface JwtPayload {
  _id?: string;
  sub?: string;
  [key: string]: unknown;
}

// ─── Constants ───────────────────────────────────────────

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  CURRENT_USER: 'current_user',
} as const;

// ─── Service ─────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly favoriteService = inject(FavoriteService);
  private readonly wishlistService = inject(WishlistService);
  private readonly purchaseService = inject(PurchaseService);

  private readonly baseUrl = 'https://api.everrest.educata.dev/auth';

  // Auth state
  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = signal(false);
  private readonly accessToken = signal<string | null>(null);

  constructor() {
    this.loadAuthState();
  }

  // ── Public API ──

  signUp(data: SignUpRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/sign_up`, data).pipe(
      tap(response => {
        if (!response.access_token) return;

        this.storeToken(response);
        this.isAuthenticated.set(true);

        const payload = this.decodeJWT(response.access_token);
        const user: User = {
          id: payload._id || payload.sub || 'unknown',
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          age: data.age,
          gender: data.gender,
          phone: data.phone || '',
          address: data.address || '',
          zipcode: data.zipcode || '',
          avatar: data.avatar || '',
        };

        this.setCurrentUser(user);
      }),
      catchError(error => throwError(() => error))
    );
  }

  signIn(credentials: SignInRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/sign_in`, credentials).pipe(
      switchMap(response => {
        if (!response.access_token) return of(response);

        this.storeToken(response);
        this.isAuthenticated.set(true);

        const payload = this.decodeJWT(response.access_token);
        const userId = payload._id || payload.sub;

        if (userId) {
          return this.http
            .get<User>(`${this.baseUrl}/id/${userId}`, { headers: this.getHeaders() })
            .pipe(
              tap(user => this.setCurrentUser(user)),
              map(() => response)
            );
        }

        // Fallback: create minimal user from email
        const fallbackUser: User = {
          id: 'unknown',
          firstName: credentials.email.split('@')[0],
          lastName: 'User',
          email: credentials.email,
          age: 18,
          gender: 'OTHER',
          phone: '',
          address: '',
          zipcode: '',
        };
        this.setCurrentUser(fallbackUser);

        return of(response);
      }),
      catchError(error => throwError(() => error))
    );
  }

  signOut(): void {
    this.http.post(`${this.baseUrl}/sign_out`, {}).subscribe({
      complete: () => this.handleSignOut(),
      error: () => this.handleSignOut(), // Clear local state even if API fails
    });
  }

  updateProfile(data: Partial<User>): Observable<User> {
    return this.http
      .patch<User>(`${this.baseUrl}/update`, data, { headers: this.getHeaders() })
      .pipe(
        tap(user => {
          this.currentUser.set(user);
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
        }),
        catchError(error => throwError(() => error))
      );
  }

  changePassword(oldPassword: string, newPassword: string): Observable<unknown> {
    return this.http
      .patch(
        `${this.baseUrl}/change_password`,
        { oldPassword, newPassword },
        { headers: this.getHeaders() }
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  deleteAccount(): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/delete`, { headers: this.getHeaders() }).pipe(
      tap(() => this.handleSignOut()),
      catchError(error => throwError(() => error))
    );
  }

  requestPasswordRecovery(email: string): Observable<unknown> {
    return this.http
      .post(`${this.baseUrl}/recovery`, { email })
      .pipe(catchError(error => throwError(() => error)));
  }

  verifyEmail(email: string): Observable<unknown> {
    return this.http
      .post(`${this.baseUrl}/verify_email`, { email })
      .pipe(catchError(error => throwError(() => error)));
  }

  getToken(): string | null {
    return this.accessToken();
  }

  // ── Private helpers ──

  private loadAuthState(): void {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);

    if (!token || !userStr) return;

    try {
      const raw = JSON.parse(userStr);
      // Normalize: backend may have stored `_id` instead of `id`
      const user: User = {
        ...raw,
        id: raw.id || raw._id || 'unknown',
      };

      this.accessToken.set(token);
      this.currentUser.set(user);
      this.isAuthenticated.set(true);
      this.initializeUserServices(user.id);

      // Re-save normalized user so future refreshes are clean
      if (!raw.id && raw._id) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      }
    } catch {
      this.clearAuthState();
    }
  }

  private storeToken(response: AuthResponse): void {
    this.accessToken.set(response.access_token);
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.access_token);

    if (response.refresh_token) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refresh_token);
    }
  }

  private setCurrentUser(user: User): void {
    // Normalize API response: backend returns `_id`, our code expects `id`
    const normalized: User = {
      ...user,
      id: user.id || (user as any)._id || 'unknown',
    };

    this.currentUser.set(normalized);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(normalized));
    this.initializeUserServices(normalized.id);
  }

  private initializeUserServices(userId: string): void {
    if (!userId) return;
    this.favoriteService.initializeForUser(userId);
    this.wishlistService.initializeForUser(userId);
    this.purchaseService.initializeForUser(userId);
  }

  private handleSignOut(): void {
    this.clearAuthState();
    this.router.navigate(['/']);
  }

  private clearAuthState(): void {
    this.accessToken.set(null);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);

    this.favoriteService.reset();
    this.wishlistService.reset();
    this.purchaseService.reset();
  }

  private getHeaders(): HttpHeaders {
    const token = this.accessToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    });
  }

  private decodeJWT(token: string): JwtPayload {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return {};
    }
  }
}
