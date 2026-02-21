import { Injectable, signal } from '@angular/core';

export interface WishlistItem {
    movieId: number;
    movieTitle: string;
    posterPath: string | null;
    addedDate: Date;
}

@Injectable({
    providedIn: 'root'
})
export class WishlistService {
    private wishlist = signal<WishlistItem[]>([]);
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
                this.loadWishlist();
            }
        } else {
            this.loadWishlist();
        }
    }

    initializeForUser(userId: string) {
        this.currentUserId = userId;
        this.loadWishlist();
    }

    private get storageKey(): string {
        return this.currentUserId ? `wishlist_${this.currentUserId}` : 'wishlist';
    }

    private loadWishlist() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                const items = parsed.map((item: any) => ({
                    ...item,
                    addedDate: new Date(item.addedDate)
                }));
                this.wishlist.set(items);
            } catch (e) {
                console.error('Failed to parse wishlist', e);
                this.wishlist.set([]);
            }
        } else {
            this.wishlist.set([]);
        }
    }

    private saveWishlist() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.wishlist()));
    }

    addToWishlist(movieId: number, movieTitle: string, posterPath: string | null): boolean {
        if (this.isInWishlist(movieId)) {
            return false;
        }

        const item: WishlistItem = {
            movieId,
            movieTitle,
            posterPath,
            addedDate: new Date()
        };

        this.wishlist.update(w => [...w, item]);
        this.saveWishlist();
        return true;
    }

    removeFromWishlist(movieId: number): void {
        this.wishlist.update(w => w.filter(item => item.movieId !== movieId));
        this.saveWishlist();
    }

    isInWishlist(movieId: number): boolean {
        return this.wishlist().some(item => item.movieId === movieId);
    }

    getWishlist(): WishlistItem[] {
        return this.wishlist();
    }

    /**
     * Clears the current list from the UI and memory, but keeps the storage for the user.
     * Used on sign-out.
     */
    reset(): void {
        this.wishlist.set([]);
        this.currentUserId = null;
    }

    /**
     * Completely clears everything for the current context.
     */
    clearWishlist(): void {
        localStorage.removeItem(this.storageKey);
        this.wishlist.set([]);
    }
}
