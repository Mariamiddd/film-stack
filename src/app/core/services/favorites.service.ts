import { Injectable, signal, inject } from '@angular/core';
import { NotificationService } from './notification.service';


export interface FavoriteItem {
    movieId: number;
    movieTitle: string;
    posterPath: string | null;
    addedDate: Date;
}

@Injectable({
    providedIn: 'root'
})
export class FavoriteService {
    private favorites = signal<FavoriteItem[]>([]);
    private currentUserId: string | null = null;

    constructor() {
        // Initial load for guest or last user
        const userStr = localStorage.getItem('current_user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user && user.id) {
                    this.initializeForUser(user.id);
                }
            } catch (e) {
                this.loadFavorites();
            }
        } else {
            this.loadFavorites();
        }
    }

    initializeForUser(userId: string) {
        this.currentUserId = userId;
        this.loadFavorites();
    }

    private get storageKey(): string {
        return this.currentUserId ? `favorites_${this.currentUserId}` : 'favorites';
    }

    private loadFavorites() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                const items = parsed.map((item: any) => ({
                    ...item,
                    addedDate: new Date(item.addedDate)
                }));
                this.favorites.set(items);
            } catch (e) {
                console.error('Failed to parse favorites', e);
                this.favorites.set([]);
            }
        } else {
            this.favorites.set([]);
        }
    }

    private saveFavorites() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.favorites()));
    }

    private readonly notificationService = inject(NotificationService);

    addToFavorites(movieId: number, movieTitle: string, posterPath: string | null): boolean {
        if (this.isInFavorites(movieId)) {
            return false;
        }

        const item: FavoriteItem = {
            movieId,
            movieTitle,
            posterPath,
            addedDate: new Date()
        };

        this.favorites.update(f => [...f, item]);
        this.saveFavorites();

        this.notificationService.addInboxItem(
            'Added to Favorites',
            `"${movieTitle}" has been added to your favorites list.`,
            'favorite'
        );

        return true;
    }


    removeFromFavorites(movieId: number): void {
        this.favorites.update(f => f.filter(item => item.movieId !== movieId));
        this.saveFavorites();
    }

    isInFavorites(movieId: number): boolean {
        return this.favorites().some(item => item.movieId === movieId);
    }

    getFavorites(): FavoriteItem[] {
        return this.favorites();
    }

    /**
     * Clears the current list from the UI and memory, but keeps the storage for the user.
     * Used on sign-out.
     */
    reset(): void {
        this.favorites.set([]);
        this.currentUserId = null;
    }

    /**
     * Completely clears everything for the current context.
     */
    clearFavorites(): void {
        localStorage.removeItem(this.storageKey);
        this.favorites.set([]);
    }
}
